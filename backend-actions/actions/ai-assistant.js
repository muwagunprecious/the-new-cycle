'use server'

import prisma from "@/backend-actions/lib/prisma"
import { sendEmail } from "@/backend-actions/lib/email"
import { deleteUser, banUser } from "@/backend-actions/actions/admin"
import { logger } from "@/backend-actions/lib/api-utils"
import { authorize } from "@/backend-actions/lib/api-middleware"
import { getPricingConfig, updatePricingConfig } from "@/backend-actions/actions/settings"

// Helper to check if SMTP config is present
function checkSmtpConfig() {
    return {
        host: !!process.env.SMTP_HOST,
        port: !!process.env.SMTP_PORT,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS,
    }
}

// ─── NEW EXPANDED AI TOOLS ───────────────────────────────────────────────────

/**
 * 1. Check system diagnostics and health status.
 */
async function getSystemHealth() {
    try {
        // Test database connection
        const dbCheck = await prisma.$queryRaw`SELECT 1`.then(() => "CONNECTED").catch((err) => `FAILED: ${err.message}`);
        
        // Check key env vars
        const envVars = {
            DATABASE_URL: !!process.env.DATABASE_URL,
            SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            SMTP: checkSmtpConfig(),
            TERMII: !!process.env.TERMII_API_KEY,
            QOREID: !!process.env.QOREID_SECRET_KEY,
            FLUTTERWAVE: !!process.env.FLUTTERWAVE_SECRET_KEY,
            GROQ: !!process.env.GROQ_API_KEY
        };

        // Active disputes
        const activeDisputes = await prisma.order.count({
            where: { collectionStatus: 'DISPUTED' }
        });

        // Count pending manual verifications
        const pendingVerifications = await prisma.manualVerification.count({
            where: { status: 'pending' }
        });

        // Count pending products
        const pendingProducts = await prisma.product.count({
            where: { status: 'pending' }
        });

        // Count failed payments (orders marked failed/pending verification)
        const failedPayments = await prisma.order.count({
            where: { paymentStatus: 'failed' }
        });

        const status = (dbCheck === "CONNECTED" && activeDisputes === 0 && failedPayments === 0) ? "healthy" : "warning";

        return {
            status,
            database: dbCheck,
            environment: envVars,
            activeDisputes,
            pendingVerifications,
            pendingProducts,
            failedPayments,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: "error",
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * 2. Email the web developer about diagnostic/system errors.
 */
async function emailWebDeveloper({ errorMessage }) {
    try {
        const developerEmail = "professorprecious03@gmail.com";
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">System Error Alert</h2>
                <p>Hello Precious,</p>
                <p>An administrator has triggered a diagnostic report from the Go-Cycle AI Admin Co-pilot. The following system error or diagnostic warning was flagged:</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; font-family: monospace; white-space: pre-wrap; font-size: 14px; color: #334155;">
                    ${errorMessage}
                </div>
                <p>Please log in to the server or database console to resolve this as soon as possible.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated alert sent from your Go-Cycle Admin Dashboard AI Co-pilot.</p>
            </div>
        `;

        const response = await sendEmail({
            to: developerEmail,
            subject: "Go-Cycle Admin Alert: Developer Attention Required",
            html: emailContent
        });

        if (!response.success) {
            console.warn(`[AI_ASSISTANT] Developer email failed: ${response.error}. Simulating delivery.`);
            return { success: true, simulated: true, message: `Email to developer was simulated. (SMTP offline: ${response.error})` };
        }

        return { success: response.success, message: `Email successfully sent to ${developerEmail}` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 3. Send custom emails to any user. (With simulation fallback)
 */
async function sendEmailToUser({ to, subject, body }) {
    try {
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #05DF72; margin: 0;">Go-Cycle Support</h2>
                </div>
                <p>${body.replace(/\n/g, '<br/>')}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">Go-Cycle Marketplace Admin Team</p>
            </div>
        `;

        const response = await sendEmail({
            to,
            subject,
            html: emailContent
        });

        if (!response.success) {
            console.warn(`[AI_ASSISTANT] Email delivery failed: ${response.error}. Simulating delivery to keep flow active.`);
            return {
                success: true,
                simulated: true,
                message: `Email to ${to} was simulated. (Nodemailer status: ${response.error || "SMTP offline"})`,
                emailPreview: { to, subject, body }
            };
        }

        return { success: true, message: `Custom email successfully sent to ${to}` };
    } catch (error) {
        console.warn(`[AI_ASSISTANT] Email delivery threw exception: ${error.message}. Simulating.`);
        return {
            success: true,
            simulated: true,
            message: `Email to ${to} was simulated. (Exception: ${error.message})`,
            emailPreview: { to, subject, body }
        };
    }
}

/**
 * 4. Delete or block a user by ID, email, or phone.
 */
async function deleteOrBlockUser({ emailOrPhoneOrId, action }) {
    try {
        // Resolve user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: emailOrPhoneOrId },
                    { email: emailOrPhoneOrId },
                    { phone: emailOrPhoneOrId },
                    { name: { contains: emailOrPhoneOrId, mode: 'insensitive' } },
                    { fullName: { contains: emailOrPhoneOrId, mode: 'insensitive' } }
                ]
            }
        });

        if (!user) {
            return { success: false, error: `User matching query "${emailOrPhoneOrId}" not found.` };
        }

        if (action === 'delete') {
            const res = await deleteUser(user.id);
            return { success: res.success, message: `User ${user.name} (${user.email || 'No Email'}) has been deleted.`, detail: res };
        } else if (action === 'block') {
            const res = await banUser(user.id, true);
            return { success: res.success, message: `User ${user.name} (${user.email || 'No Email'}) has been blocked/banned.`, detail: res };
        } else if (action === 'unblock') {
            const res = await banUser(user.id, false);
            return { success: res.success, message: `User ${user.name} (${user.email || 'No Email'}) has been unblocked/activated.`, detail: res };
        }

        return { success: false, error: `Invalid action "${action}". Must be 'delete', 'block', or 'unblock'.` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 5. Retrieve verification codes (e.g. for orders or manual transfers, or custom verification tasks).
 */
async function getVerificationCodes({ query }) {
    try {
        // Search orders
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { id: query },
                    { transactionId: query },
                    { paymentReference: query },
                    { user: { email: query } },
                    { user: { phone: query } }
                ]
            },
            select: {
                id: true,
                transactionId: true,
                total: true,
                status: true,
                verificationCode: true,
                collectionToken: true,
                verificationStatus: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            take: 5
        });

        // Search users for registration/verification codes
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { id: query },
                    { email: query },
                    { phone: query }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                verificationCode: true,
                isEmailVerified: true,
                isPhoneVerified: true
            },
            take: 5
        });

        return {
            success: true,
            orders,
            users
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 6. Audit a buyer/seller account in detail.
 */
async function auditAccount({ emailOrPhoneOrId }) {
    try {
        // Resolve user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: emailOrPhoneOrId },
                    { email: emailOrPhoneOrId },
                    { phone: emailOrPhoneOrId },
                    { name: { contains: emailOrPhoneOrId, mode: 'insensitive' } },
                    { fullName: { contains: emailOrPhoneOrId, mode: 'insensitive' } }
                ]
            },
            include: {
                store: true
            }
        });

        if (!user) {
            return { success: false, error: `User with identifier "${emailOrPhoneOrId}" not found.` };
        }

        // Get uploaded products (if seller store exists)
        let products = [];
        if (user.store) {
            products = await prisma.product.findMany({
                where: { storeId: user.store.id },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    brand: true,
                    condition: true
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        // Get purchases
        const purchases = await prisma.order.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                transactionId: true,
                total: true,
                status: true,
                collectionStatus: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get notifications sent (which represents communications log)
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            select: {
                id: true,
                title: true,
                message: true,
                type: true,
                status: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 15
        });

        // Strip password for safety
        const { password, ...safeUser } = user;

        return {
            success: true,
            profile: safeUser,
            products,
            purchases,
            notifications,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 7. Get dashboard statistics and aggregations.
 */
async function getDashboardStats() {
    try {
        // Count users by status and role
        const userCounts = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        const activeStores = await prisma.store.count({ where: { status: 'approved', isActive: true } });
        const pendingStores = await prisma.store.count({ where: { status: 'pending' } });
        
        // Pending payouts
        const pendingCashoutsCount = await prisma.order.count({
            where: {
                status: 'COMPLETED',
                payoutStatus: 'pending'
            }
        });
        
        const pendingCashoutsSum = await prisma.order.aggregate({
            where: {
                status: 'COMPLETED',
                payoutStatus: 'pending'
            },
            _sum: {
                payoutAmount: true
            }
        });

        // Best sellers (stores with most completed orders)
        const storeOrdersGroup = await prisma.order.groupBy({
            by: ['storeId'],
            where: { status: 'COMPLETED' },
            _count: { id: true },
            _sum: { total: true },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        const bestSellers = [];
        for (const group of storeOrdersGroup) {
            const store = await prisma.store.findUnique({
                where: { id: group.storeId },
                select: { name: true, email: true, contact: true }
            });
            bestSellers.push({
                storeName: store?.name || "Unknown Store",
                email: store?.email,
                phone: store?.contact,
                ordersCount: group._count.id,
                totalSales: group._sum.total || 0
            });
        }

        // Recent contact messages
        const recentComplaints = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                message: true,
                status: true,
                createdAt: true
            }
        });

        return {
            success: true,
            userCounts,
            activeStores,
            pendingStores,
            pendingCashouts: {
                count: pendingCashoutsCount,
                totalAmount: pendingCashoutsSum._sum.payoutAmount || 0
            },
            bestSellers,
            recentComplaints
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 8. Get pricing configuration table
 */
async function getPricingConfiguration() {
    try {
        const res = await getPricingConfig();
        return res;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 9. Update the price of a specific battery capacity size globally
 */
async function updateBatteryPrice({ batteryType, amps, price }) {
    try {
        const res = await getPricingConfig();
        if (!res.success) return { success: false, error: "Could not load pricing configuration" };

        const priceTable = res.data;
        if (!priceTable[batteryType]) {
            return { 
                success: false, 
                error: `Battery type "${batteryType}" not found. Valid types: ${Object.keys(priceTable).join(", ")}` 
            };
        }

        priceTable[batteryType][String(amps)] = parseFloat(price);

        const saveRes = await updatePricingConfig(priceTable);
        if (saveRes.success) {
            return { success: true, message: `Successfully updated global price for "${batteryType}" size ${amps}AH to ₦${price}.` };
        } else {
            return { success: false, error: saveRes.error || "Failed to save pricing configuration" };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 10. List blogs
 */
async function listBlogs() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        return { success: true, blogs };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Slug generator helper
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Date.now();
};

/**
 * 11. Create or Update a blog article
 */
async function createOrUpdateBlog({ id, title, content, status, headlineImage }, adminUserId) {
    try {
        if (id) {
            // Update
            const existing = await prisma.blog.findUnique({ where: { id } });
            if (!existing) return { success: false, error: `Blog ID ${id} not found.` };

            const data = {
                title: title || undefined,
                content: content || undefined,
                status: status || undefined,
                headlineImage: headlineImage !== undefined ? headlineImage : undefined
            };

            if (title) {
                data.slug = generateSlug(title);
            }

            const updated = await prisma.blog.update({
                where: { id },
                data
            });
            return { success: true, message: `Blog "${updated.title}" updated successfully.`, blog: updated };
        } else {
            // Create
            if (!title || !content) return { success: false, error: "Title and content are mandatory to create a blog." };

            const slug = generateSlug(title);
            const blog = await prisma.blog.create({
                data: {
                    title,
                    content,
                    slug,
                    status: status || 'published',
                    headlineImage: headlineImage || null,
                    authorId: adminUserId
                }
            });
            return { success: true, message: `Blog "${blog.title}" created successfully.`, blog };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 12. Delete a blog post
 */
async function deleteBlogAction({ id }) {
    try {
        await prisma.blog.delete({ where: { id } });
        return { success: true, message: `Blog ID ${id} has been deleted successfully.` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 13. Edit or Delete a Product
 */
async function editOrDeleteProduct({ productId, action, name, price, status, inStock, condition, brand, description }) {
    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return { success: false, error: `Product ID ${productId} not found.` };

        if (action === 'delete') {
            await prisma.product.delete({ where: { id: productId } });
            return { success: true, message: `Product "${product.name}" (ID: ${productId}) has been deleted.` };
        } else if (action === 'edit') {
            const updated = await prisma.product.update({
                where: { id: productId },
                data: {
                    name: name || undefined,
                    price: price !== undefined ? parseFloat(price) : undefined,
                    status: status || undefined,
                    inStock: inStock !== undefined ? !!inStock : undefined,
                    condition: condition || undefined,
                    brand: brand !== undefined ? brand : undefined,
                    description: description || undefined
                }
            });
            return { success: true, message: `Product "${updated.name}" updated successfully.`, product: updated };
        }
        return { success: false, error: `Invalid action "${action}". Use 'edit' or 'delete'.` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 14. Edit or Delete a Store (Seller Profile)
 */
async function editOrDeleteStore({ storeId, action, name, status, isActive, description, address, contact, email }) {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) return { success: false, error: `Store ID ${storeId} not found.` };

        if (action === 'delete') {
            await prisma.$transaction([
                prisma.order.deleteMany({ where: { storeId } }),
                prisma.product.deleteMany({ where: { storeId } }),
                prisma.store.delete({ where: { id: storeId } })
            ]);
            return { success: true, message: `Store "${store.name}" and all associated products/orders have been deleted.` };
        } else if (action === 'edit') {
            const updated = await prisma.store.update({
                where: { id: storeId },
                data: {
                    name: name || undefined,
                    status: status || undefined,
                    isActive: isActive !== undefined ? !!isActive : undefined,
                    description: description || undefined,
                    address: address || undefined,
                    contact: contact || undefined,
                    email: email || undefined
                }
            });
            return { success: true, message: `Store "${updated.name}" updated successfully.`, store: updated };
        }
        return { success: false, error: `Invalid action "${action}". Use 'edit' or 'delete'.` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 15. Edit or Delete an Order
 */
async function editOrDeleteOrder({ orderId, action, status, collectionStatus, payoutStatus, total }) {
    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return { success: false, error: `Order ID ${orderId} not found.` };

        if (action === 'delete') {
            await prisma.order.delete({ where: { id: orderId } });
            return { success: true, message: `Order #${orderId} has been deleted successfully.` };
        } else if (action === 'edit') {
            const updated = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: status || undefined,
                    collectionStatus: collectionStatus || undefined,
                    payoutStatus: payoutStatus || undefined,
                    total: total !== undefined ? parseFloat(total) : undefined
                }
            });
            return { success: true, message: `Order #${orderId} updated successfully.`, order: updated };
        }
        return { success: false, error: `Invalid action "${action}". Use 'edit' or 'delete'.` };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ─── PUBLIC PAGES CONTENT MAP ────────────────────────────────────────────────

const PUBLIC_PAGES_MARKDOWN = {
    about: `# About Us - Go-Cycle (Gocycle.ng)
- **Vision**: Turn e-waste and scrap batteries into high-value secondary resources by digitalizing and formalizing the informal recycling market in Africa.
- **Leadership**: 
  - **Emmanuel Okoegwale**: Distribution Network Architect. Masters last-mile fintech-style logistics with 20+ years experience (ex Save the Children, MobileMoneyAfrica).
  - **Adetunwase Adenle**: E-waste Innovator. 4x Guinness World Record holder, drives creative environmental initiatives.
- **Current Scale**: Scaling in Lagos across 5 Local Government Areas (LGAs) with 20+ professionalized collectors under a strict chain of custody.
- **Contact Details**: hello@gocycle.ng | +234 704-728-3000 | Lagos, Nigeria.`,

    faq: `# Frequently Asked Questions (FAQ)
- **What is Go-Cycle?** An escrow-secured e-waste marketplace connecting scrap battery sellers (users, businesses) with certified material recovery buyers.
- **How to sell scrap batteries?** List the battery on the portal (specifying amps, type, brand). Once approved, buyers place orders, pick up at your verified location, and enter your verification code to release escrow.
- **What battery types are accepted?** Wet cell cars and truck batteries, dry cell inverter batteries, and wet cell inverter batteries.
- **What is Escrow?** Funds are held securely when an order is placed and are only released to the seller's wallet once the buyer inspects the battery and confirms pickup via the verification code.`,

    sustainability: `# Sustainability & Sourcing Policy
- **Ecological Mission**: Diverting hazardous lead-acid materials and sulfuric acid from landfills and local soil, preventing lead poisoning.
- **Recycling Protocol**: 100% of collected items enter authorized smelters following international environmental safety guidelines.
- **Carbon Offset**: Tracking battery recycling logs allows Go-Cycle to map carbon offset savings and calculate industrial sustainability indexes.`,

    terms: `# Terms & Conditions (Platform Agreement)
- **Escrow Release Conditions**: Payouts are released immediately to seller wallets upon entering the verified pickup collection token in the dashboard.
- **Anti-Fraud Policy**: All sellers must undergo QoreID verification (NIN/CAC checks) before their store is activated.
- **Platform Fees**: Go-Cycle charges a 5% commission on successful sales, with the remaining 95% credited directly to the seller's balance.`,

    pricing: `# Standard Pricing Sheets
- Batteries are priced based on Type (Wet vs Dry) and Capacity (Amps).
- **Cars and Truck batt (Wet cell)**: 36AH (₦5,000) to 220AH (₦40,000).
- **Inverter Batt (Dry cell)**: 100AH (₦30,000) to 250AH (₦70,000).
- **Inverter Batt (Wet Cell)**: 200AH (₦50,000) to 250AH (₦60,000).
- Administrators can override these standard prices globally under the Settings tab.`,

    "trade-process": `# Trade & Collection Process
1. **Listing**: Seller creates a listing with photos, capacity (amps), and verified location address.
2. **Order & Escrow**: Buyer purchases the listing; funds are secured in escrow.
3. **Logistics/Pickup**: Buyer coordinates pickup dates on their dashboard.
4. **Exchange**: Seller hands over battery; buyer provides verification code to seller.
5. **Clearance**: Seller inputs verification code, triggering instant payout release.`,

    "sourcing-policy": `# Sourcing Integrity Protocol
We source only from verified users who confirm clean ownership and provide physical ID verification to prevent trading stolen goods. All listings undergo strict quality inspections.`,

    "payment-logistics": `# Payment & Escrow Operations
Transactions are handled via manual transfer verification, Stripe, or Flutterwave. Payouts are safely held in escrow and released automatically once collection verification is complete.`,

    "sell4me": `# Sell-For-Me (S4M) Concierge Service
Go-Cycle direct selling helper. Under S4M, Go-Cycle handles the listing, collection, testing, verification, and sale of the user's scrap batteries, directly paying them once the transaction completes.`
};

/**
 * 16. Read content of public pages
 */
async function readPublicPage({ pageName }) {
    try {
        const normalized = pageName.toLowerCase().trim();
        const content = PUBLIC_PAGES_MARKDOWN[normalized];
        if (!content) {
            return {
                success: false,
                error: `Page "${pageName}" not found. Available pages to read: ${Object.keys(PUBLIC_PAGES_MARKDOWN).join(", ")}`
            };
        }
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 17. List all affiliates in the system with their stats.
 */
async function listAffiliates() {
    try {
        const affiliates = await prisma.affiliate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        
        const enriched = await Promise.all(affiliates.map(async (aff) => {
            const referralCount = await prisma.user.count({
                where: { referredByCode: aff.referralCode, role: 'SELLER' }
            });
            return {
                id: aff.id,
                name: aff.name,
                email: aff.email,
                phone: aff.phone,
                referralCode: aff.referralCode,
                status: aff.status,
                walletBalance: aff.walletBalance,
                totalEarned: aff.totalEarned,
                referralCount,
                createdAt: aff.createdAt
            };
        }));

        return { success: true, affiliates: enriched };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 18. Audit a specific affiliate profile, earnings, and payout history in detail.
 */
async function auditAffiliate({ emailOrCodeOrId }) {
    try {
        const affiliate = await prisma.affiliate.findFirst({
            where: {
                OR: [
                    { id: emailOrCodeOrId },
                    { email: emailOrCodeOrId },
                    { referralCode: emailOrCodeOrId },
                    { name: { contains: emailOrCodeOrId, mode: 'insensitive' } }
                ]
            }
        });

        if (!affiliate) {
            return { success: false, error: `Affiliate matching query "${emailOrCodeOrId}" not found.` };
        }

        const earnings = await prisma.affiliateEarning.findMany({
            where: { affiliateId: affiliate.id },
            orderBy: { createdAt: 'desc' }
        });

        const payoutRequests = await prisma.affiliatePayoutRequest.findMany({
            where: { affiliateId: affiliate.id },
            orderBy: { createdAt: 'desc' }
        });

        const referredSellers = await prisma.user.findMany({
            where: { referredByCode: affiliate.referralCode, role: 'SELLER' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                accountStatus: true
            }
        });

        return {
            success: true,
            affiliate: {
                id: affiliate.id,
                name: affiliate.name,
                email: affiliate.email,
                phone: affiliate.phone,
                referralCode: affiliate.referralCode,
                status: affiliate.status,
                walletBalance: affiliate.walletBalance,
                totalEarned: affiliate.totalEarned,
                bankName: affiliate.bankName,
                accountNumber: affiliate.accountNumber,
                accountName: affiliate.accountName,
                createdAt: affiliate.createdAt
            },
            earnings,
            payoutRequests,
            referredSellers,
            stats: {
                referralCount: referredSellers.length,
                totalEarned: affiliate.totalEarned,
                walletBalance: affiliate.walletBalance,
                pendingPayouts: payoutRequests.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 19. Approve or reject a pending affiliate payout request.
 */
async function manageAffiliatePayout({ requestId, action, note = "" }) {
    try {
        const { approveAffiliatePayout, rejectAffiliatePayout } = await import("./admin-affiliates");
        let res;
        if (action === "approve") {
            res = await approveAffiliatePayout(requestId);
        } else if (action === "reject") {
            res = await rejectAffiliatePayout(requestId, note);
        } else {
            return { success: false, error: `Invalid action "${action}". Use 'approve' or 'reject'.` };
        }
        return res;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 20. Suspend or unsuspend an affiliate account.
 */
async function toggleAffiliateSuspensionAction({ affiliateId }) {
    try {
        const { toggleAffiliateSuspension } = await import("./admin-affiliates");
        const res = await toggleAffiliateSuspension(affiliateId);
        return res;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Router/mapper for tools
async function executeTool(name, args, adminUserId) {
    console.log(`[AI_ASSISTANT] Executing tool: ${name} with args:`, args);
    switch (name) {
        case "getSystemHealth":
            return await getSystemHealth();
        case "emailWebDeveloper":
            return await emailWebDeveloper(args);
        case "sendEmailToUser":
            return await sendEmailToUser(args);
        case "deleteOrBlockUser":
            return await deleteOrBlockUser(args);
        case "getVerificationCodes":
            return await getVerificationCodes(args);
        case "auditAccount":
            return await auditAccount(args);
        case "getDashboardStats":
            return await getDashboardStats();
        case "getPricingConfiguration":
            return await getPricingConfiguration();
        case "updateBatteryPrice":
            return await updateBatteryPrice(args);
        case "listBlogs":
            return await listBlogs();
        case "createOrUpdateBlog":
            return await createOrUpdateBlog(args, adminUserId);
        case "deleteBlogAction":
            return await deleteBlogAction(args);
        case "editOrDeleteProduct":
            return await editOrDeleteProduct(args);
        case "editOrDeleteStore":
            return await editOrDeleteStore(args);
        case "editOrDeleteOrder":
            return await editOrDeleteOrder(args);
        case "readPublicPage":
            return await readPublicPage(args);
        case "listAffiliates":
            return await listAffiliates();
        case "auditAffiliate":
            return await auditAffiliate(args);
        case "manageAffiliatePayout":
            return await manageAffiliatePayout(args);
        case "toggleAffiliateSuspensionAction":
            return await toggleAffiliateSuspensionAction(args);
        default:
            throw new Error(`Tool ${name} not found.`);
    }
}

// Tool definitions for Groq API
const assistantTools = [
    {
        type: "function",
        function: {
            name: "getSystemHealth",
            description: "Check system database connection, check active disputes, environment variables configuration, and overall health.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "emailWebDeveloper",
            description: "Email the web developer professorprecious03@gmail.com about diagnostic errors or system issues to fix.",
            parameters: {
                type: "object",
                properties: {
                    errorMessage: {
                        type: "string",
                        description: "The description of the error/diagnostic failure to email to the developer."
                    }
                },
                required: ["errorMessage"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "sendEmailToUser",
            description: "Send a support, verification, or notification email to any user email address. Falls back to console simulation if SMTP credentials are offline.",
            parameters: {
                type: "object",
                properties: {
                    to: { type: "string", description: "The recipient's email address." },
                    subject: { type: "string", description: "Subject of the email." },
                    body: { type: "string", description: "The body content of the email." }
                },
                required: ["to", "subject", "body"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteOrBlockUser",
            description: "Delete or block/ban/unblock a buyer or seller account based on admin instruction.",
            parameters: {
                type: "object",
                properties: {
                    emailOrPhoneOrId: { type: "string", description: "The user's ID, email address, or phone number." },
                    action: {
                        type: "string",
                        enum: ["delete", "block", "unblock"],
                        description: "The action to perform: delete (permanent), block (ban), unblock (restore)."
                    }
                },
                required: ["emailOrPhoneOrId", "action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getVerificationCodes",
            description: "Retrieve verification codes, collection tokens, or transaction reference codes for a buyer, seller, or order.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Order transaction ID, user email, or phone number to look up verification codes." }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "auditAccount",
            description: "Look up a buyer/seller account by email, phone, or ID and get details of products uploaded, orders bought, upload/buy dates, and sent notifications history.",
            parameters: {
                type: "object",
                properties: {
                    emailOrPhoneOrId: { type: "string", description: "The email, phone number, or user ID to audit." }
                },
                required: ["emailOrPhoneOrId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getDashboardStats",
            description: "Retrieve core dashboard statistics including user counts, active stores, pending cashouts/payouts, best-selling sellers, and recent contact message complaints.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "getPricingConfiguration",
            description: "Retrieve the current battery recycling pricing configuration table (mapping types and capacities to scrap value).",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "updateBatteryPrice",
            description: "Update the global recycle price of a specific battery type and capacity size under admin instruction.",
            parameters: {
                type: "object",
                properties: {
                    batteryType: {
                        type: "string",
                        description: "Name of the battery type exactly as mapped in pricing options (e.g. 'Cars and Truck batt (Wet cell)', 'Inverter Batt (Dry cell)', 'Inverter Batt (Wet Cell)')."
                    },
                    amps: { type: "string", description: "The capacity in Amp-hours (e.g. '36', '45', '100', '200')." },
                    price: { type: "number", description: "The new numeric price value in Naira (₦)." }
                },
                required: ["batteryType", "amps", "price"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "listBlogs",
            description: "List all blog articles inside the Go-Cycle database.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "createOrUpdateBlog",
            description: "Create a new blog post or update/edit an existing blog post under admin command.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "Optional. The ID of the blog to edit. Omit this if creating a new blog." },
                    title: { type: "string", description: "The title of the blog post." },
                    content: { type: "string", description: "The markdown or text content of the blog post." },
                    status: { type: "string", enum: ["published", "draft"], description: "Publishing status." },
                    headlineImage: { type: "string", description: "Optional headline image URL." }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteBlogAction",
            description: "Delete an existing blog post by its database ID.",
            parameters: {
                type: "object",
                properties: {
                    id: { type: "string", description: "The database ID of the blog post to delete." }
                },
                required: ["id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "editOrDeleteProduct",
            description: "Edit/modify details (name, price, status, brand, description) or delete a product by its ID under admin instruction.",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "string", description: "The database ID of the product." },
                    action: { type: "string", enum: ["edit", "delete"], description: "The action to perform." },
                    name: { type: "string", description: "New name of the product." },
                    price: { type: "number", description: "New price in Naira." },
                    status: { type: "string", description: "New status ('pending', 'approved', 'rejected')." },
                    brand: { type: "string", description: "New brand name." },
                    condition: { type: "string", description: "New condition ('SCRAP', 'USED', 'NEW')." },
                    inStock: { type: "boolean", description: "Stock status." },
                    description: { type: "string", description: "New description text." }
                },
                required: ["productId", "action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "editOrDeleteStore",
            description: "Edit details (name, status, active status, description, address, contact) or delete a seller's store by its ID.",
            parameters: {
                type: "object",
                properties: {
                    storeId: { type: "string", description: "The database ID of the store." },
                    action: { type: "string", enum: ["edit", "delete"], description: "The action to perform." },
                    name: { type: "string", description: "New name of the store." },
                    status: { type: "string", description: "New status ('pending', 'approved', 'rejected')." },
                    isActive: { type: "boolean", description: "Active activation status." },
                    description: { type: "string", description: "New store description." },
                    address: { type: "string", description: "New store address." },
                    contact: { type: "string", description: "New contact phone." },
                    email: { type: "string", description: "New store email." }
                },
                required: ["storeId", "action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "editOrDeleteOrder",
            description: "Edit status fields (status, collectionStatus, payoutStatus, total) or delete a transaction order by its ID.",
            parameters: {
                type: "object",
                properties: {
                    orderId: { type: "string", description: "The database ID of the order." },
                    action: { type: "string", enum: ["edit", "delete"], description: "The action to perform." },
                    status: { type: "string", description: "New OrderStatus (e.g. 'ORDER_PLACED', 'PAID', 'APPROVED', 'COMPLETED', 'CANCELLED')." },
                    collectionStatus: { type: "string", description: "New collection/pickup status (e.g. 'PENDING', 'COLLECTED', 'DISPUTED')." },
                    payoutStatus: { type: "string", description: "New payout status ('none', 'pending', 'released')." },
                    total: { type: "number", description: "New order total amount." }
                },
                required: ["orderId", "action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "readPublicPage",
            description: "Read the static markdown contents of public info pages like About Us, FAQ, Sustainability, Sourcing Policy, Pricing, Trade Process, etc.",
            parameters: {
                type: "object",
                properties: {
                    pageName: {
                        type: "string",
                        enum: ["about", "faq", "sustainability", "terms", "pricing", "trade-process", "sourcing-policy", "payment-logistics", "sell4me"],
                        description: "The name of the public page to retrieve."
                    }
                },
                required: ["pageName"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "listAffiliates",
            description: "List all registered Go-Cycle partner affiliates, showing their referral code, stats, earnings, and suspension statuses.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "auditAffiliate",
            description: "Audit a specific affiliate partner by their email, ID, or referral code, showing referred sellers, earnings log, and payout requests history.",
            parameters: {
                type: "object",
                properties: {
                    emailOrCodeOrId: { type: "string", description: "The email, referral code, or database ID of the affiliate." }
                },
                required: ["emailOrCodeOrId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "manageAffiliatePayout",
            description: "Approve or reject a pending affiliate payout request by database ID under admin instruction.",
            parameters: {
                type: "object",
                properties: {
                    requestId: { type: "string", description: "The database ID of the affiliate payout request." },
                    action: { type: "string", enum: ["approve", "reject"], description: "The action to perform." },
                    note: { type: "string", description: "Optional rejection note/reason." }
                },
                required: ["requestId", "action"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "toggleAffiliateSuspensionAction",
            description: "Suspend or reactivate an affiliate account by ID.",
            parameters: {
                type: "object",
                properties: {
                    affiliateId: { type: "string", description: "The database ID of the affiliate to toggle suspension." }
                },
                required: ["affiliateId"]
            }
        }
    }
];

const SYSTEM_PROMPT = `You are the Go-Cycle AI Admin Co-pilot (Assistant), a premium intelligence interface built into the admin console of the Go-Cycle Battery Recycling Marketplace.
Your primary role is to assist super administrators in tracking metrics, monitoring system diagnostics, editing battery prices, managing blogs, auditing and deleting/editing database entities (products, stores, orders, blogs, users, affiliates, payouts), reading public informational pages, and sending emails.

GUIDELINES:
1. When asked about system errors or if you run "getSystemHealth" and find any database failure or warning, ALWAYS politely ask the admin: "Should I email professorprecious03@gmail.com, the web developer, to fix this error?"
2. You can send emails to any user. If sending fails or SMTP is offline, explain that it was logged/simulated.
3. You can edit battery scrap prices globally via the updateBatteryPrice tool.
4. You can read public pages (About us, FAQ, Sourcing Policy, Sustainability, trade process) using readPublicPage tool.
5. You can delete or edit anything (blogs, products, stores, orders, users) under the command of the admin. Before performing a permanent delete, ensure you have received explicit instruction to delete it.
6. Be professional, concise, and formatting-oriented (use lists, bold values, and Markdown tables where appropriate).
7. ALWAYS include the exact date and time (timestamps) in your responses for any actions, updates, or events mentioned (such as the date a product was listed, the date an email/notification was sent, the date/time a product was verified/approved, when a payment was approved, when a cashout/payout was released, etc.).
8. Do NOT generate XML or HTML function call blocks (e.g. <function=...>). Only invoke tools via the official JSON tool-call schema.
9. You have tools to manage the partner affiliate network (listAffiliates, auditAffiliate, manageAffiliatePayout, toggleAffiliateSuspensionAction). You can answer questions about partner earnings, referred sellers, and process their payout withdrawals directly.
`;

/**
 * Handle administrative assistant message requests.
 * Runs the tool-calling execution loop on the server.
 */
export async function handleAssistantMessage(chatHistory) {
    // 1. Session Authorization Check (Zero Trust)
    let adminUserId = "mock-admin-id";
    if (process.env.CLI_TEST_MODE !== 'true') {
        const auth = await authorize(null, ['ADMIN', 'SUPER_ADMIN']);
        if (!auth.success) {
            return {
                success: false,
                content: "Unauthorized: You must be logged in as an Administrator to use the Co-pilot."
            };
        }
        adminUserId = auth.user.id;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return {
            success: false,
            content: "The GROQ_API_KEY is not configured in the server environment variables (.env). Please set it to proceed."
        };
    }

    try {
        // Build messages queue, pre-pending system prompt if not present
        const messages = [];
        const systemMessage = chatHistory.find(m => m.role === 'system');
        if (!systemMessage) {
            messages.push({ role: 'system', content: SYSTEM_PROMPT });
        }
        
        // Add chat history (limit to last 20 messages for context safety)
        const historySlice = chatHistory.slice(-20);
        messages.push(...historySlice.map(msg => ({
            role: msg.role,
            content: msg.content,
            tool_calls: msg.tool_calls,
            tool_call_id: msg.tool_call_id,
            name: msg.name
        })));

        let toolLogs = [];
        let loopAttempts = 0;
        const maxLoopAttempts = 5;
        let assistantResponseContent = "";

        while (loopAttempts < maxLoopAttempts) {
            loopAttempts++;
            console.log(`[AI_ASSISTANT] Groq API Request loop ${loopAttempts}...`);

            let response;
            let retriesLeft = 5;
            while (retriesLeft > 0) {
                response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: messages,
                        tools: assistantTools,
                        tool_choice: "auto",
                        temperature: 0.1, // low temperature for precise tool calls and factual responses
                        max_tokens: 2000
                    })
                });

                if (response.status === 429) {
                    retriesLeft--;
                    const retryAfterHeader = response.headers.get("retry-after");
                    const waitTimeSec = retryAfterHeader ? parseFloat(retryAfterHeader) : 3;
                    console.warn(`[AI_ASSISTANT] Groq API Rate Limit (429) encountered. Retrying in ${waitTimeSec} seconds... (${retriesLeft} retries left)`);
                    await new Promise(resolve => setTimeout(resolve, (waitTimeSec + 0.5) * 1000));
                    continue;
                }
                break;
            }

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const choice = data.choices[0];
            const message = choice.message;

            // Log tool_calls if any
            if (message.tool_calls && message.tool_calls.length > 0) {
                console.log(`[AI_ASSISTANT] Model requested tool call:`, message.tool_calls);
                
                // Add the assistant's request for tool calls to the context
                messages.push(message);

                for (const toolCall of message.tool_calls) {
                    const toolName = toolCall.function.name;
                    let toolArgs = {};
                    try {
                        toolArgs = JSON.parse(toolCall.function.arguments);
                    } catch (e) {
                        console.warn("[AI_ASSISTANT] Failed to parse tool arguments:", toolCall.function.arguments);
                    }

                    // Log action in toolLogs for frontend timeline display
                    toolLogs.push({
                        id: toolCall.id,
                        tool: toolName,
                        args: toolArgs,
                        timestamp: new Date().toLocaleTimeString()
                    });

                    // Execute tool
                    let toolResult;
                    try {
                        toolResult = await executeTool(toolName, toolArgs, adminUserId);
                    } catch (err) {
                        console.error(`[AI_ASSISTANT] Error running tool ${toolName}:`, err);
                        toolResult = { error: err.message };
                    }

                    // Push the tool execution result back to the LLM context
                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolName,
                        content: JSON.stringify(toolResult)
                    });
                }
                
                // Continue the loop to let the model generate the conversational response based on tool results
                continue;
            }

            // If no tool call, this is the final text response
            assistantResponseContent = message.content;
            break;
        }

        return {
            success: true,
            content: assistantResponseContent || "I was unable to complete the request.",
            toolLogs: toolLogs
        };

    } catch (error) {
        logger.error("AI Assistant Server Action Exception", error);
        return {
            success: false,
            content: `An error occurred while communicating with the AI service: ${error.message}`
        };
    }
}
