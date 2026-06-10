'use server'

import { ApiResponse } from "@/backend-actions/lib/api-response"
import { logger } from "@/backend-actions/lib/api-utils"
import { sendEmail, sellerWalletCreditEmail, buyerVerifiedEmail, buyerRejectedEmail } from "@/backend-actions/lib/email"
import { revalidatePath, revalidateTag } from "next/cache"
import prisma, { withRetry } from "@/backend-actions/lib/prisma"
import bcrypt from "bcryptjs"
import { generateId } from "@/backend-actions/lib/api-utils"
import { sendOTP, sendVerificationSMS } from "@/backend-actions/lib/sms"

export async function getPendingSellers() {
    try {
        const stores = await prisma.store.findMany({
            where: { status: 'pending' },
            include: { user: true }
        })
        return ApiResponse.success({ stores, data: stores })
    } catch (error) {
        logger.error("Get Pending Sellers Error", error)
        return ApiResponse.error("Failed to fetch pending sellers")
    }
}

export async function approveSeller(storeId) {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        await prisma.$transaction([
            prisma.store.update({
                where: { id: storeId },
                data: { status: 'approved', isActive: true, isVerified: true }
            }),
            prisma.user.update({
                where: { id: store.userId },
                data: { role: 'SELLER' }
            })
        ])

        const { createNotification } = await import('./notification')
        await createNotification(
            store.userId,
            "Store Approved! 🎉",
            "Congratulations! Your store application has been approved. You can now start listing products.",
            "SYSTEM"
        )

        revalidatePath('/admin/approve')
        revalidatePath('/')
        revalidatePath('/shop')
        revalidateTag('admin-stats')
        return ApiResponse.success(null, "Seller approved successfully")
    } catch (error) {
        logger.error("Approve Seller Error", error)
        return ApiResponse.error("Failed to approve seller")
    }
}

export async function rejectSeller(storeId, reason) {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        await prisma.store.update({
            where: { id: storeId },
            data: {
                status: 'rejected',
                isActive: false,
                rejectionReason: reason || "Your store application did not meet our requirements."
            }
        })

        const { createNotification } = await import('./notification')
        await createNotification(
            store.userId,
            "Store Application Rejected",
            `We're sorry, but your store application was not approved. Reason: ${reason || "Please contact support."}`,
            "SYSTEM"
        )

        revalidatePath('/admin/approve')
        revalidatePath('/')
        revalidateTag('admin-stats')
        return ApiResponse.success(null, "Seller application rejected")
    } catch (error) {
        logger.error("Reject Seller Error", error)
        return ApiResponse.error("Failed to reject seller")
    }
}

export async function getVerifiedSellers() {
    try {
        const stores = await prisma.store.findMany({
            where: { status: 'approved', isActive: true },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        })
        return ApiResponse.success({ stores, data: stores })
    } catch (error) {
        logger.error("Get Verified Sellers Error", error)
        return ApiResponse.error("Failed to fetch verified sellers")
    }
}

export async function updateSellerWallet(storeId, amount, type = 'CREDIT') {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        const currentBalance = store.walletBalance || 0
        const newBalance = type === 'CREDIT' ? currentBalance + amount : currentBalance - amount

        if (newBalance < 0) return ApiResponse.error("Insufficient wallet balance", 400)

        const adminAdjustment = type === 'CREDIT' ? -amount : amount

        await prisma.$transaction([
            prisma.store.update({
                where: { id: storeId },
                data: { walletBalance: newBalance }
            }),
            prisma.user.updateMany({
                where: { role: 'ADMIN' },
                data: { walletBalance: { increment: adminAdjustment } }
            })
        ])

        const { createNotification } = await import('./notification')
        await createNotification(
            store.userId,
            "Wallet Balance Updated",
            `Your seller wallet has been ${type === 'CREDIT' ? 'credited' : 'debited'} with ₦${amount.toLocaleString()}. New balance: ₦${newBalance.toLocaleString()}`,
            "PAYMENT"
        )

        revalidatePath('/admin/sellers')
        revalidatePath('/seller')
        revalidateTag('admin-stats')
        return ApiResponse.success({ newBalance }, "Wallet updated successfully")
    } catch (error) {
        logger.error("Update Seller Wallet Error", error)
        return ApiResponse.error("Failed to update wallet balance")
    }
}

/**
 * Performance-optimized aggregate summary for the admin dashboard.
 * Bypasses fetching all records by using Prisma aggregate/count functions.
 */

/**
 * Performance-optimized aggregate summary for the admin dashboard.
 * Uses Next.js unstable_cache to prevent heavy DB load on every refresh.
 */
export const getAdminDashboardSummary = async () => {
    try {
        logger.info("Calculating Admin Dashboard Summary...");
        const [
            sellerCount,
            productCount,
            orderCount,
            revenueData,
            verifiedBuyerCount,
            buyerCount,
            pendingPayoutsData,
            recentOrders,
            pendingVerifications,
            adminUser
        ] = await withRetry(() => prisma.$transaction([
            prisma.user.count({ where: { role: 'SELLER' } }),
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: { total: true }
            }),
            prisma.user.count({ where: { role: 'USER', accountStatus: 'approved' } }),
            prisma.user.count(),
            prisma.order.aggregate({
                where: { status: 'COMPLETED', payoutStatus: 'pending' },
                _sum: {
                    total: true,
                    subtotal: true,
                    buyerFee: true,
                    sellerFee: true,
                    payoutAmount: true
                }
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    total: true,
                    createdAt: true,
                    user: { select: { name: true } },
                    store: { select: { name: true } }
                }
            }),
            prisma.order.findMany({
                where: { paymentStatus: 'pending' },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    total: true,
                    paymentSenderName: true,
                    createdAt: true,
                    user: { select: { name: true } },
                    store: { select: { name: true } }
                }
            }),
            prisma.user.findFirst({
                where: { role: 'ADMIN' },
                select: { walletBalance: true }
            })
        ]), 1, 20000)

        const adminBalance = adminUser?.walletBalance || 0

                const stats = {
                    products: productCount,
                    revenue: revenueData._sum.total || 0,
                    orders: orderCount,
                    stores: sellerCount,
                    pendingPayouts: pendingPayoutsData._sum.payoutAmount || 0,
                    adminBalance: adminBalance,
                    pendingStats: {
                        subtotal: pendingPayoutsData._sum.subtotal || 0,
                        total: pendingPayoutsData._sum.total || 0,
                        sellerFee: pendingPayoutsData._sum.sellerFee || 0,
                        buyerFee: pendingPayoutsData._sum.buyerFee || 0,
                        payoutAmount: pendingPayoutsData._sum.payoutAmount || 0,
                        platformEarnings: (pendingPayoutsData._sum.buyerFee || 0) + (pendingPayoutsData._sum.sellerFee || 0),
                        adminBalance: adminBalance
                    },
                    verifiedUsers: verifiedBuyerCount,
                    unverifiedUsers: buyerCount - verifiedBuyerCount,
                    totalUsers: buyerCount,
                    recentOrders: recentOrders,
                    pendingVerifications: pendingVerifications || []
                };

        return ApiResponse.success(stats);
    } catch (error) {
        logger.error("Get Dashboard Summary Error", error)
        return ApiResponse.error("Failed to fetch dashboard stats")
    }
};


export async function getAllUsers(page = 1, limit = 50, filters = {}) {
    try {
        const skip = (page - 1) * limit
        const where = {}
        if (filters.role) where.role = filters.role
        if (filters.accountStatus) where.accountStatus = filters.accountStatus

        const [users, total] = await withRetry(() => prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    accountStatus: true,
                    // createdAt: true
                    // Exclude heavy fields like 'image' if not needed in the list
                }
            }),
            prisma.user.count({ where })
        ]))

        return ApiResponse.success({
            users,
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logger.error("Get All Users Error", error)
        return ApiResponse.error("Failed to fetch users")
    }
}

export async function getUserProfile(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                store: true,
                Address: true,
            }
        })
        if (!user) return ApiResponse.error("User not found", 404)
        // Strip password before returning
        const { password, ...safeUser } = user
        return ApiResponse.success(safeUser)
    } catch (error) {
        logger.error("Get User Profile Error", error)
        return ApiResponse.error("Failed to fetch user profile")
    }
}

export async function banUser(userId, isBanned) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: isBanned ? 'banned' : 'active' }
        })
        revalidatePath('/admin/users')
        return ApiResponse.success(null, `User ${isBanned ? 'banned' : 'unbanned'} successfully`)
    } catch (error) {
        logger.error("Ban User Error", error)
        return ApiResponse.error("Failed to update user status")
    }
}

export async function deleteUser(userId) {
    try {
        logger.info(`Starting deletion of user: ${userId}`)
        
        await prisma.$transaction(async (tx) => {
            // 1. Check for Store
            const store = await tx.store.findUnique({
                where: { userId }
            })
            
            if (store) {
                logger.info(`User has store: ${store.id}. Deleting store-related records...`)
                
                // Delete store orders (which cascades to OrderItem)
                await tx.order.deleteMany({
                    where: { storeId: store.id }
                })
                
                // Delete store products
                await tx.product.deleteMany({
                    where: { storeId: store.id }
                })
                
                // Delete the store itself
                await tx.store.delete({
                    where: { id: store.id }
                })
            }
            
            // 2. Delete buyer orders (which cascades to OrderItem)
            await tx.order.deleteMany({
                where: { userId }
            })
            
            // 3. Delete authored blogs
            await tx.blog.deleteMany({
                where: { authorId: userId }
            })
            
            // 4. Finally delete the user (will cascade to Address, Notification, Rating)
            await tx.user.delete({
                where: { id: userId }
            })
        })
        
        logger.info(`User ${userId} deleted successfully`)
        revalidatePath('/admin/users')
        return ApiResponse.success(null, "User deleted successfully")
    } catch (error) {
        logger.error("Delete User Error", error)
        return ApiResponse.error(error.message || "Failed to delete user")
    }
}

export async function releasePayout(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: { include: { user: true } } }
        })

        if (!order) return ApiResponse.error("Order not found", 404)
        if (order.payoutStatus === 'released') return ApiResponse.error("Payout already released", 400)

        const commission = order.sellerFee || (order.total * 0.05)
        const netPayout = order.payoutAmount || (order.total - commission)

        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { payoutStatus: 'released' }
            }),
            prisma.store.update({
                where: { id: order.storeId },
                data: { walletBalance: { increment: netPayout } }
            })
        ])

        // Credit commission to Admin
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) {
            await prisma.user.update({
                where: { id: admin.id },
                data: { walletBalance: { increment: commission } }
            })
        }

        const { createNotification } = await import('./notification')
        await createNotification(
            order.store.userId,
            "Payout Approved! 💰",
            `Your payout of ₦${netPayout.toLocaleString()} (after 5% platform fee) for order ${orderId.slice(-6)} has been approved.`,
            "PAYMENT"
        )

        revalidatePath('/admin')
        revalidatePath('/admin/orders')
        revalidatePath('/seller')

        // Send wallet credit email to seller
        if (order.store?.user?.email) {
            // Fetch updated store balance
            const updatedStore = await prisma.store.findUnique({ where: { id: order.storeId } })
            const emailTemplate = sellerWalletCreditEmail({
                sellerName: order.store.user.name,
                amount: netPayout,
                newBalance: updatedStore?.walletBalance || netPayout,
                orderId,
                creditType: 'PAYOUT'
            })
            await sendEmail({ to: order.store.user.email, ...emailTemplate }).catch(err =>
                logger.warn("Seller credit email failed", err)
            )
        }

        revalidateTag('admin-stats')
        return ApiResponse.success({ netPayout }, "Payout released successfully")
    } catch (error) {
        logger.error("Release Payout Error", error)
        return ApiResponse.error("Failed to release payout")
    }
}

export async function getPendingBuyers() {
    try {
        const buyers = await prisma.user.findMany({
            where: { role: 'USER', accountStatus: 'pending' },
            orderBy: { name: 'asc' }
        })
        return ApiResponse.success({ buyers, data: buyers })
    } catch (error) {
        logger.error("Get Pending Buyers Error", error)
        return ApiResponse.error("Failed to fetch pending buyers")
    }
}

export async function approveBuyer(userId) {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                accountStatus: 'approved',
                verifiedAt: new Date(),
                isPhoneVerified: true,
                isEmailVerified: true
            }
        })

        const { createNotification } = await import('./notification')
        await createNotification(
            userId,
            "Account Verified! 🎉",
            "Your buyer account has been verified. You can now place orders on the platform.",
            "SYSTEM"
        )

        // Send Email Notification
        if (updatedUser.email) {
            const { subject, html } = buyerVerifiedEmail({ name: updatedUser.name })
            await sendEmail({
                to: updatedUser.email,
                subject,
                html
            })
        }

        revalidatePath('/admin/verify-buyers')
        revalidatePath('/buyer')
        revalidateTag('admin-stats')
        return ApiResponse.success(null, "Buyer verified successfully")
    } catch (error) {
        logger.error("Approve Buyer Error", error)
        return ApiResponse.error("Failed to approve buyer")
    }
}

export async function rejectBuyer(userId, reason) {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                accountStatus: 'rejected',
                verificationNotes: reason || "Your verification documents did not meet our requirements."
            }
        })

        const { createNotification } = await import('./notification')
        await createNotification(
            userId,
            "Account Verification Not Approved",
            `We're sorry, but your account verification was not approved. Reason: ${reason || "Please contact support."}`,
            "SYSTEM"
        )

        // Send Rejection Email
        if (updatedUser.email) {
            const { subject, html } = buyerRejectedEmail({
                name: updatedUser.name,
                reason: reason || "Your verification documents did not meet our requirements."
            })
            await sendEmail({
                to: updatedUser.email,
                subject,
                html
            }).catch(err => logger.warn("Buyer rejection email failed", err))
        }

        revalidatePath('/admin/verify-buyers')
        revalidateTag('admin-stats')
        return ApiResponse.success(null, "Buyer application rejected")
    } catch (error) {
        logger.error("Reject Buyer Error", error)
        return ApiResponse.error("Failed to reject buyer")
    }
}

/**
 * Send notification to one or more users.
 * @param {Object} options
 * @param {'specific' | 'all' | 'buyers' | 'sellers'} options.target - Who to notify
 * @param {string} [options.userId] - Required if target is 'specific'
 * @param {string} options.title
 * @param {string} options.message
 * @param {'SYSTEM'|'ORDER'|'PAYMENT'|'PROMO'} [options.type] - Notification type
 * @param {boolean} [options.sendEmail] - Whether to also send an email
 */
export async function sendAdminNotification({ target, userId, title, message, type = 'SYSTEM', sendEmail: withEmail = false }) {
    try {
        if (!title?.trim() || !message?.trim()) {
            return ApiResponse.error("Title and message are required", 400)
        }

        const { createNotification } = await import('./notification')

        let recipients = []

        if (target === 'specific') {
            if (!userId) return ApiResponse.error("User ID is required for specific target", 400)
            const user = await prisma.user.findUnique({ where: { id: userId } })
            if (!user) return ApiResponse.error("User not found", 404)
            recipients = [user]
        } else if (target === 'all') {
            recipients = await prisma.user.findMany({ where: { role: { not: 'ADMIN' } } })
        } else if (target === 'buyers') {
            recipients = await prisma.user.findMany({ where: { role: 'USER' } })
        } else if (target === 'sellers') {
            recipients = await prisma.user.findMany({ where: { role: 'SELLER' } })
        } else {
            return ApiResponse.error("Invalid target", 400)
        }

        if (recipients.length === 0) {
            return ApiResponse.error("No recipients found for the selected target", 404)
        }

        // Send in-app notifications
        await Promise.all(recipients.map(user =>
            createNotification(user.id, title, message, type)
        ))

        // Optionally send email
        if (withEmail) {
            const { sendEmail: mailer } = await import('@/backend-actions/lib/email')
            const emailRecipients = recipients.filter(u => u.email)
            await Promise.all(emailRecipients.map(user =>
                mailer({
                    to: user.email,
                    subject: `[Go-Cycle] ${title}`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                        <div style="background:#0f172a;padding:24px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                        </div>
                        <div style="padding:28px;">
                            <h2 style="color:#0f172a;margin-top:0;">${title}</h2>
                            <p style="color:#475569;white-space:pre-line;">${message}</p>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle Nigeria.</p>
                        </div>
                    </div>`
                }).catch(err => logger.warn(`Email failed for ${user.email}`, err))
            ))
        }

        logger.info(`Admin notification sent to ${recipients.length} user(s)`, { target, title })
        return ApiResponse.success(
            { count: recipients.length },
            `Notification sent to ${recipients.length} user${recipients.length !== 1 ? 's' : ''}`
        )
    } catch (error) {
        logger.error("Send Admin Notification Error", error)
        return ApiResponse.error("Failed to send notification")
    }
}

export async function getAdminPayoutHistory(page = 1, limit = 50) {
    try {
        const skip = (page - 1) * limit
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { payoutStatus: 'released' },
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } },
                    store: { select: { name: true } }
                }
            }),
            prisma.order.count({ where: { payoutStatus: 'released' } })
        ])
        return ApiResponse.success({ 
            orders, 
            data: orders, 
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } 
        })
    } catch (error) {
        logger.error("Get Admin Payout History Error", error)
        return ApiResponse.error("Failed to fetch payout history")
    }
}

export async function verifyOrderPayment(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, store: { include: { user: true } }, orderItems: { include: { product: true } } }
        })

        if (!order) return ApiResponse.error("Order not found", 404)
        if (order.isPaid) return ApiResponse.error("Order is already paid and verified", 400)

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                paymentStatus: 'verified',
                status: 'PAID'
            }
        })

        const { createNotification } = await import('./notification')

        // Notify Buyer
        await createNotification(
            order.user.id,
            "Payment Verified!",
            `Your payment for Order #${order.transactionId} has been successfully verified.`,
            "PAYMENT"
        )

        // Notify Seller — NOW they get the full details (buyer info + verification code)
        const productName = order.orderItems[0]?.product?.name || 'Battery'
        const sellerMsg = `BUYER:${order.user.name}|PHONE:${order.user.phone || 'N/A'}|AMOUNT:${order.total}|CODE:${order.verificationCode}|DATE:${order.collectionDate || 'TBD'}|ORDER:${order.transactionId}|QTY:${order.orderItems[0]?.quantity || 1}|PROD:${productName}`;
        await createNotification(
            order.store.userId,
            "New Purchase — Payment Verified!",
            sellerMsg,
            "ORDER"
        )
        
        // Emails
        const { orderConfirmationEmail, sellerNewOrderEmail, sendEmail: mailer } = await import('@/backend-actions/lib/email')
        if (order.user.email) {
            const buyerTemplate = orderConfirmationEmail({
                buyerName: order.user.name,
                orderId: order.transactionId,
                productName: productName,
                amount: order.total,
                collectionDate: order.collectionDate ? new Date(order.collectionDate).toLocaleDateString('en-NG', { dateStyle: 'long' }) : 'TBD',
                token: order.collectionToken,
                sellerName: order.store.user?.name,
                sellerPhone: order.store.user?.phone,
                sellerAddress: order.store.address
            })
            mailer({ to: order.user.email, ...buyerTemplate }).catch(err => logger.warn("Approval email failed", err))
        }

        if (order.store.user.email) {
            const sellerTemplate = sellerNewOrderEmail({
                sellerName: order.store.user.name,
                orderId: order.transactionId,
                productName: productName,
                amount: order.total,
                quantity: order.orderItems[0]?.quantity || 1,
                collectionDate: order.collectionDate ? new Date(order.collectionDate).toLocaleDateString('en-NG', { dateStyle: 'long' }) : 'TBD',
                token: order.verificationCode,
                buyerName: order.user.name
            })
            mailer({ to: order.store.user.email, ...sellerTemplate }).catch(err => logger.warn("Seller notify email failed", err))
        }

        revalidatePath('/admin/orders')
        revalidatePath('/buyer')              // buyer dashboard — shows Verify Pickup banner
        revalidatePath('/buyer/orders')
        revalidatePath('/seller/orders')
        revalidateTag('orders')               // bust the user-orders cache
        revalidateTag(`buyer-${order.userId}`) // bust this specific buyer's order cache
        revalidateTag('admin-stats')

        // SMS: Buyer gets seller full details (name, phone, address)
        try {
            if (order.user?.phone) {
                const sellerPhone = order.store.user?.phone || 'N/A';
                const sellerAddress = order.store.address || 'N/A';
                const sellerName = order.store.user?.name || order.store.name;
                const buyerMsg = `GoCycle: Hi ${order.user.name}, your payment for Order #${order.transactionId} has been verified! Seller: ${sellerName}, Phone: ${sellerPhone}, Address: ${sellerAddress}. Collection date: ${order.collectionDate || 'TBD'}.`;
                await sendOTP(order.user.phone, buyerMsg).catch(e => logger.warn('Buyer payment verified SMS failed', e));
            }
        } catch (e) { logger.warn('Buyer payment SMS error', e); }

        // SMS: Seller gets verification code + buyer full details
        try {
            if (order.store.user?.phone) {
                const buyerPhone = order.user?.phone || 'N/A';
                const buyerName = order.user?.name;
                const code = order.verificationCode;
                await sendVerificationSMS(order.store.user.phone, buyerName, code, order.transactionId || order.id).catch(e => logger.warn('Seller verification SMS failed', e));
                // Also send buyer contact details to seller
                const sellerDetailsMsg = `GoCycle: New paid order #${order.transactionId}! Buyer: ${buyerName}, Phone: ${buyerPhone}. Pickup Code: ${code}. Keep it safe — verify code at collection.`;
                await sendOTP(order.store.user.phone, sellerDetailsMsg).catch(e => logger.warn('Seller details SMS failed', e));
            }
        } catch (e) { logger.warn('Seller SMS error', e); }

        return ApiResponse.success(null, "Order payment verified successfully")
    } catch (error) {
        logger.error("Verify Order Payment Error", error)
        return ApiResponse.error("Failed to verify order payment")
    }
}

export async function adminApproveOrderPickup(orderId) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                collectionStatus: 'COLLECTED',
                payoutStatus: 'pending'
            },
            include: { store: true }
        })

        // Notify Buyer
        const { createNotification } = await import('./notification')
        await createNotification(
            order.userId,
            "Pickup Confirmed by Admin",
            `Admin has verified and confirmed the collection of Order #${order.transactionId || order.id}. Your code verification is complete.`,
            "ORDER"
        )

        // Notify Seller
        await createNotification(
            order.store.userId,
            "Collection Approved by Admin",
            `Admin has approved the collection of Order #${order.transactionId || order.id}. Payout is now pending.`,
            "PAYMENT"
        )

        revalidatePath('/admin/orders')
        revalidatePath('/buyer')
        revalidatePath('/buyer/orders')
        revalidatePath('/seller/orders')
        revalidateTag('orders')
        revalidateTag(`buyer-${order.userId}`)
        revalidateTag(`seller-stats-${order.store.userId}`)
        return ApiResponse.success(order, "Order pickup approved and completed successfully.")
    } catch (error) {
        logger.error("Admin Approve Order Pickup Error", error)
        return ApiResponse.error("Failed to approve order pickup")
    }
}

export async function adminRescheduleOrderPickup(orderId, newDate) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                collectionDate: newDate,
                proposedDate: newDate,
                proposedBy: 'ADMIN',
                collectionStatus: 'RESCHEDULE_REQUESTED'
            },
            include: { store: true }
        })

        // Notify Buyer
        const { createNotification } = await import('./notification')
        await createNotification(
            order.userId,
            "Pickup Rescheduled by Admin",
            `Admin has rescheduled the pickup date for Order #${order.transactionId || order.id} to ${newDate}.`,
            "RESCHEDULE"
        )

        // Notify Seller
        await createNotification(
            order.store.userId,
            "Pickup Rescheduled by Admin",
            `Admin has rescheduled the pickup date for Order #${order.transactionId || order.id} to ${newDate}.`,
            "RESCHEDULE"
        )

        revalidatePath('/admin/orders')
        revalidatePath('/buyer')
        revalidatePath('/buyer/orders')
        revalidatePath('/seller/orders')
        revalidateTag('orders')
        revalidateTag(`buyer-${order.userId}`)
        revalidateTag(`seller-stats-${order.store.userId}`)
        return ApiResponse.success(order, "Order pickup date rescheduled successfully.")
    } catch (error) {
        logger.error("Admin Reschedule Order Pickup Error", error)
        return ApiResponse.error("Failed to reschedule order pickup")
    }
}


export async function runEmergencyDBDiagnostic() {
    try {
        const url = process.env.DATABASE_URL || "NOT_SET";
        const hostInfo = url !== "NOT_SET" ? url.split('@')[1] : "UNKNOWN";
        
        // Run a raw query to check tables
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        
        return ApiResponse.success({
            host: hostInfo,
            tables: result.map(r => r.table_name)
        });
    } catch (error) {
        return ApiResponse.error(`Diag Error: ${error.message}`);
    }
}

export async function createAdminAccount(data) {
    try {
        const { name, email, phone, password } = data;
        
        if (!name || !email || !password || !phone) {
            return ApiResponse.error("Name, email, phone, and password are required.");
        }

        // Check for existing users
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            }
        });

        if (existingUser) {
            return ApiResponse.error("A user with this email or phone number already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.user.create({
            data: {
                id: generateId("admin"),
                name,
                fullName: name,
                email,
                password: hashedPassword,
                phone,
                role: 'ADMIN',
                image: "",
                isEmailVerified: true,
                isPhoneVerified: true,
                accountStatus: 'approved',
                status: 'active',
                needsPasswordChange: true
            }
        });

        revalidatePath('/admin/users');
        return ApiResponse.success({ user: newAdmin }, "Admin account created successfully");
    } catch (error) {
        logger.error("Create Admin Error", error);
        return ApiResponse.error("Failed to create admin account");
    }
}

/**
 * Fetch all COMPLETED orders with pending payouts, grouped by store.
 * Includes full bank account details so admin can verify before releasing.
 */
export async function getPendingCashouts() {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                payoutStatus: 'pending'
            },
            orderBy: { updatedAt: 'asc' }, // oldest first — FIFO payout
            include: {
                store: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                user: {
                    select: { name: true }
                }
            }
        })

        // Group orders by storeId so we see total owed per seller
        const grouped = {}
        for (const order of orders) {
            const sid = order.storeId
            if (!grouped[sid]) {
                grouped[sid] = {
                    storeId: sid,
                    storeName: order.store?.name || 'Unknown Store',
                    bankName: order.store?.bankName || null,
                    accountNumber: order.store?.accountNumber || null,
                    accountName: order.store?.accountName || null,
                    sellerName: order.store?.user?.name || null,
                    sellerEmail: order.store?.user?.email || null,
                    sellerPhone: order.store?.user?.phone || null,
                    walletBalance: order.store?.walletBalance || 0,
                    orders: [],
                    totalPayout: 0,
                    orderCount: 0
                }
            }
            const payout = order.payoutAmount || (order.total - (order.sellerFee || order.total * 0.05))
            grouped[sid].orders.push({
                id: order.id,
                transactionId: order.transactionId,
                total: order.total,
                payoutAmount: payout,
                sellerFee: order.sellerFee || order.total * 0.05,
                buyerName: order.user?.name || 'Unknown Buyer',
                completedAt: order.updatedAt,
                collectionDate: order.collectionDate
            })
            grouped[sid].totalPayout += payout
            grouped[sid].orderCount += 1
        }

        const cashouts = Object.values(grouped)

        return ApiResponse.success({
            cashouts,
            totalPendingAmount: cashouts.reduce((sum, g) => sum + g.totalPayout, 0),
            totalStores: cashouts.length,
            totalOrders: orders.length
        })
    } catch (error) {
        logger.error('Get Pending Cashouts Error', error)
        return ApiResponse.error('Failed to fetch pending cashouts')
    }
}

export async function getNewsletterSubscribers(page = 1, limit = 50) {
    try {
        const skip = (page - 1) * limit
        
        // Fetch explicit newsletter subscribers
        const subscribers = await prisma.newsletterSubscriber.findMany({
            select: { id: true, email: true, status: true, createdAt: true }
        })

        // Fetch all registered users (buyers and sellers)
        const users = await prisma.user.findMany({
            select: { id: true, email: true, createdAt: true },
            where: { email: { not: null } }
        })

        // Combine them and remove duplicates by email
        const emailMap = new Map()
        
        users.forEach(u => {
            emailMap.set(u.email, {
                id: u.id,
                email: u.email,
                status: 'active', // Registered users are active on the mailing list by default
                createdAt: u.createdAt,
                type: 'User Account'
            })
        })

        subscribers.forEach(s => {
            if (!emailMap.has(s.email)) {
                emailMap.set(s.email, {
                    id: s.id,
                    email: s.email,
                    status: s.status,
                    createdAt: s.createdAt,
                    type: 'Subscriber'
                })
            }
        })

        // Convert map to array and sort by createdAt descending
        const allSubscribers = Array.from(emailMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        const total = allSubscribers.length
        
        // Paginate manually
        const paginatedSubscribers = allSubscribers.slice(skip, skip + limit)

        return ApiResponse.success({
            subscribers: paginatedSubscribers,
            data: paginatedSubscribers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logger.error("Get Newsletter Subscribers Error", error)
        return ApiResponse.error("Failed to fetch newsletter subscribers")
    }
}

export async function searchDisputes(query) {
    try {
        if (!query || query.trim() === "") {
            return ApiResponse.success([])
        }
        
        const q = query.trim().toLowerCase()
        
        // Find matching orders by Order ID, Transaction ID, Buyer name/email/phone, Seller store name/email/contact
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { id: { contains: q, mode: 'insensitive' } },
                    { transactionId: { contains: q, mode: 'insensitive' } },
                    { user: { name: { contains: q, mode: 'insensitive' } } },
                    { user: { email: { contains: q, mode: 'insensitive' } } },
                    { user: { phone: { contains: q, mode: 'insensitive' } } },
                    { store: { name: { contains: q, mode: 'insensitive' } } },
                    { store: { email: { contains: q, mode: 'insensitive' } } },
                    { store: { contact: { contains: q, mode: 'insensitive' } } }
                ]
            },
            include: {
                user: true,
                store: {
                    include: {
                        user: true
                    }
                },
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        
        return ApiResponse.success(orders)
    } catch (error) {
        logger.error("Search Disputes Error", error)
        return ApiResponse.error("Failed to search disputes")
    }
}

export async function getAdminSidebarCounts() {
    try {
        const [
            manualVerifications,
            pendingProducts,
            pendingPickups,
            pendingCashouts
        ] = await Promise.all([
            prisma.manualVerification.count({ where: { status: 'pending' } }),
            prisma.product.count({ where: { status: 'pending' } }),
            prisma.order.count({ 
                where: { 
                    isPaid: true, 
                    status: { notIn: ['COMPLETED', 'CANCELLED'] } 
                } 
            }),
            prisma.order.count({ 
                where: { 
                    status: 'COMPLETED', 
                    payoutStatus: 'pending' 
                } 
            })
        ]);

        return ApiResponse.success({
            manualVerifications,
            pendingProducts,
            pendingPickups,
            pendingCashouts
        });
    } catch (error) {
        logger.error("Failed to fetch sidebar counts:", error);
        return ApiResponse.error("Failed to fetch sidebar counts");
    }
}

