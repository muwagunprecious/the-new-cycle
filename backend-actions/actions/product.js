'use server'

import { ApiResponse, handleDbError } from "@/backend-actions/lib/api-response"
import { mapProductToFrontend, logger } from "@/backend-actions/lib/api-utils"
import { revalidatePath } from "next/cache"
import prisma, { withRetry } from "@/backend-actions/lib/prisma"
import { logToFile } from "@/backend-actions/lib/server-logger"
import { verifyIsBattery } from "@/backend-actions/lib/ai-service"


import { sendEmail, productApprovedEmail, productRejectedEmail } from "@/backend-actions/lib/email"
import { BATTERY_TYPE_MAPPING } from "@/lib/pricing"
import { rateLimit } from "../lib/rate-limit"
import { headers } from "next/headers"

export async function createProduct(data, userId) {
    logger.info("Creating new product", { userId, productName: data.name })
    try {
        const headerList = await headers()
        const ip = headerList.get('x-forwarded-for') || 'unknown'
        await rateLimit(`create_product_${userId || ip}`, 10) // Limit product uploads
        console.log("SERVER: Received createProduct request", { userId, batteryType: data.batteryType, amps: data.amps })
        if (!userId) return ApiResponse.unauthorized("Authentication required")
        if (!data.collectionDates?.length) return ApiResponse.error("Please select at least one collection date", 400)

        const price = parseFloat(data.price)
        const units = parseInt(data.unitsAvailable) || 0
        const amps = parseInt(data.amps) || 0

        if (isNaN(price) || price <= 0) return ApiResponse.error("Invalid price", 400)
        if (units < 0) return ApiResponse.error("Invalid quantity", 400)
        const store = await withRetry(() => prisma.store.findUnique({ where: { userId } }))
        if (!store) return ApiResponse.error("Store not found. Please create a store first.", 404)
        if (store.status !== 'approved' || !store.isActive) {
            return ApiResponse.error("Your store must be 'Approved' and 'Active' to list batteries.", 403)
        }

        const collectionDateStart = data.collectionDates?.length ? new Date(data.collectionDates[0]) : new Date()
        const collectionDateEnd = data.collectionDates?.length ? new Date(data.collectionDates[data.collectionDates.length - 1]) : new Date()

        logToFile(`CREATING PRODUCT: ${data.name}`, { 
            imageCount: data.images?.length || 0,
            payloadSize: JSON.stringify(data).length 
        });

        console.log(`SERVER: Attempting DB create for product: ${data.name}. Image count: ${data.images?.length || 0}`);

        // AI Verification Step
        const aiResult = await verifyIsBattery(data.images || []);
        let initialStatus = 'pending';
        let rejectionReason = null;

        if (!aiResult.isBattery) {
            initialStatus = 'rejected';
            rejectionReason = `AI Verification Failed: ${aiResult.reason}`;
            logToFile(`PRODUCT_AUTO_REJECTED: ${data.name}`, aiResult);
        }
        const product = await withRetry(() => prisma.product.create({
            data: {
                name: data.name,
                description: data.comments || "",
                mrp: price * 1.2,
                price: price,
                images: data.images || [],
                category: "Battery",
                type: BATTERY_TYPE_MAPPING[data.batteryType] || 'CAR_TRUCK_WET',
                brand: data.brand || "",
                amps: amps,
                condition: data.condition || "SCRAP",
                pickupAddress: `${data.address}${data.lga ? ` | ${data.lga}` : ''}`,
                collectionDateStart,
                collectionDateEnd,
                collectionDates: data.collectionDates,
                quantity: units,
                status: initialStatus,
                rejectionReason: rejectionReason,
                storeId: store.id,
                inStock: true
            }
        }))
        
        logToFile(`SERVER: DB create successful for: ${product.id}`);
        console.log(`SERVER: DB create successful for: ${product.id}`);



        // Notify Admins
        try {
            const { createNotification } = await import('./notification')
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
            
            const notificationMsg = initialStatus === 'rejected' 
                ? `AUTO-REJECTED: ${store.name} tried listing a non-battery item: ${data.name}`
                : `${store.name} has listed a new product: ${data.name}. Approval required.`;

            for (const admin of admins) {
                await createNotification(
                    admin.id,
                    initialStatus === 'rejected' ? "Auto-Rejection Alert" : "New Product Listing",
                    notificationMsg,
                    "SYSTEM"
                )
            }
        } catch (notifyError) {
            logger.warn("Failed to notify admins", notifyError)
        }

        if (initialStatus === 'rejected') {
            return ApiResponse.error(`Listing rejected: Our AI detected that this image is not a battery. (${aiResult.reason})`, 400);
        }

        revalidatePath('/seller/products')
        revalidatePath('/')
        revalidatePath('/shop')

        return ApiResponse.success(product, "Product created successfully")
    } catch (error) {
        logger.error("Create Product Error", error)
        return handleDbError(error, "createProduct")
    }
}

export async function getSellerProducts(userId, page = 1, limit = 50) {
    try {
        if (!userId) return ApiResponse.unauthorized()


        const store = await withRetry(() => prisma.store.findUnique({ where: { userId } }))
        if (!store) {
            logToFile(`GET_SELLER_PRODUCTS: Store not found for user ${userId}`);
            return ApiResponse.success({ products: [], data: [], pagination: { page, totalPages: 0, totalCount: 0 } }, "No store found")
        }

        logToFile(`GET_SELLER_PRODUCTS: Fetching for store ${store.id}`, { userId });

        const skip = (page - 1) * limit

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: { storeId: store.id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    mrp: true,
                    price: true,
                    category: true,
                    type: true,
                    brand: true,
                    amps: true,
                    condition: true,
                    pickupAddress: true,
                    collectionDateStart: true,
                    collectionDateEnd: true,
                    collectionDates: true,
                    quantity: true,
                    inStock: true,
                    status: true,
                    rejectionReason: true,
                    storeId: true,
                    createdAt: true,
                    updatedAt: true,
                    images: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.product.count({ where: { storeId: store.id } })
        ])

        logToFile(`GET_SELLER_PRODUCTS: Found ${products.length} products (Total: ${totalCount})`);
        const formatted = products.map(mapProductToFrontend)

        return ApiResponse.success({
            products: formatted,
            data: formatted,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        })
    } catch (error) {
        logger.error("Get Seller Products Error", error)
        return ApiResponse.error("Failed to fetch products")
    }
}

export async function deleteProduct(productId, userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.unauthorized()

        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product || product.storeId !== store.id) {
            return ApiResponse.error("Product not found or unauthorized", 404)
        }

        await prisma.product.delete({ where: { id: productId } })

        revalidatePath('/seller/products')
        revalidatePath('/')
        return ApiResponse.success(null, "Product deleted successfully")
    } catch (error) {
        logger.error("Delete Product Error", error)
        return ApiResponse.error("Failed to delete product")
    }
}

import { supabase } from "@/backend-actions/lib/supabase"

// MOCK DATA REMOVED

export async function getAllProducts() {
    try {
        if (supabase) {
            const { data: products, error: supabaseError } = await supabase
                .from('Product')
                .select(`
                    id, name, price, mrp, images, category, type, brand, amps, condition, 
                    storeId,
                    store:Store!inner (
                        name, address, isVerified, status, isActive
                    )
                `)
                .eq('status', 'approved')
                .eq('inStock', true)
                .eq('store.status', 'approved')
                .eq('store.isActive', true)
                .order('createdAt', { ascending: false })
                .limit(100)

            if (!supabaseError && products) {
                const standardizedProducts = products.map(p => ({
                    ...p,
                    store: Array.isArray(p.store) ? p.store[0] : p.store
                }))
                const formatted = standardizedProducts.map(mapProductToFrontend)
                return ApiResponse.success({ products: formatted, data: formatted })
            }
        }

        const prismaProducts = await prisma.product.findMany({
            where: { status: 'approved', inStock: true, store: { status: 'approved', isActive: true } },
            include: { store: { select: { name: true, address: true, isVerified: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        const formatted = prismaProducts.map(mapProductToFrontend)
        return ApiResponse.success({ products: formatted, data: formatted })


    } catch (error) {
        console.error("[CRITICAL] getAllProducts failed:", error.message)
        return ApiResponse.success({ products: [], data: [] })
    }
}

export async function getProductById(productId) {
    try {
        console.log("SERVER: Fetching product by ID:", productId)



        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                store: {
                    select: { name: true, address: true, isVerified: true, logo: true, status: true }
                }
            }
        })

        if (!product) {
            console.log("SERVER: Product NOT FOUND in database for ID:", productId)
            return ApiResponse.error("Product not found", 404)
        }

        console.log("SERVER: Product FOUND:", product.name)
        const mapped = mapProductToFrontend(product)
        return ApiResponse.success(mapped)
    } catch (error) {
        console.error("SERVER: getProductById EXCEPTION:", error)
        return ApiResponse.error("Failed to fetch product details")
    }
}

export async function getAdminProducts(page = 1, limit = 50) {
    try {
        const skip = (page - 1) * limit
        const [products, total] = await withRetry(() => Promise.all([
            prisma.product.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    mrp: true,
                    category: true,
                    type: true,
                    brand: true,
                    amps: true,
                    condition: true,
                    status: true,
                    inStock: true,
                    createdAt: true,
                    storeId: true,
                    images: true, // Include images for visual verification
                    store: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            user: { select: { name: true, email: true } }
                        }
                    }
                    // EXCLUDE heavy images field
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count()
        ]))

        logToFile(`GET_ADMIN_PRODUCTS: Found ${products.length} products (Total: ${total})`);
        const formatted = products.map(mapProductToFrontend)
        return ApiResponse.success({
            products: formatted,
            data: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logger.error("Get Admin Products Error", error)
        return ApiResponse.error("Failed to fetch admin products")
    }
}

export async function getPendingAdminProducts(page = 1, limit = 50) {
    try {
        // Demo Mode Check (Simplified for MVP)
        // If we are looking for pending products, and there might be some in DB, fetch them.
        // But for a better demo, if the DB is empty, provide a few.
        
        const skip = (page - 1) * limit
        const [products, total] = await withRetry(() => Promise.all([
            prisma.product.findMany({
                where: { status: 'pending' },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    mrp: true,
                    category: true,
                    type: true,
                    brand: true,
                    amps: true,
                    condition: true,
                    status: true,
                    inStock: true,
                    createdAt: true,
                    storeId: true,
                    images: true, // Include images for visual verification
                    store: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            user: { select: { name: true, email: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where: { status: 'pending' } })
        ]))

        logToFile(`GET_PENDING_ADMIN_PRODUCTS: Found ${products.length} products (Total: ${total})`);
        const formatted = products.map(mapProductToFrontend)
        return ApiResponse.success({
            products: formatted,
            data: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logger.error("Get Pending Admin Products Error", error)
        return ApiResponse.error("Failed to fetch pending admin products")
    }
}

export async function adminDeleteProduct(productId, adminId) {
    logger.warn("Admin deleting product", { productId, adminId })
    try {
        if (!adminId) return ApiResponse.unauthorized("Admin ID required")
        const admin = await prisma.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            // Check for demo admin
            if (adminId !== "admin_demo") {
                return ApiResponse.unauthorized("Only admins can delete products")
            }
        }

        await prisma.product.delete({ where: { id: productId } })
        revalidatePath('/admin/products')
        revalidatePath('/')
        revalidatePath('/shop')
        return ApiResponse.success(null, "Product deleted by admin successfully")
    } catch (error) {
        logger.error("Admin Delete Product Error", error)
        return ApiResponse.error("Failed to delete product")
    }
}

export async function adminApproveProduct(productId, adminId) {
    logger.info("Admin approving product", { productId, adminId })
    try {
        if (!adminId) return ApiResponse.unauthorized("Admin ID required")
        const admin = await prisma.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            if (adminId !== "admin_demo") {
                return ApiResponse.unauthorized("Only admins can approve products")
            }
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: { status: 'approved', rejectionReason: null },
            include: {
                store: {
                    include: { user: true }
                }
            }
        })

        if (product.store?.user?.email) {
            const { subject, html } = productApprovedEmail({
                sellerName: product.store.name,
                productName: product.name
            })
            sendEmail({
                to: product.store.user.email,
                subject,
                html
            }).catch(err => logger.warn("Failed to send product approval email", err))
        }

        // Notify Seller
        try {
            const { createNotification } = await import('./notification')
            await createNotification(
                product.store.userId,
                "Listing Approved! 🎉",
                `Your product "${product.name}" has been approved and is now live.`,
                "SYSTEM"
            )
        } catch (e) {}

        revalidatePath('/admin/products')
        revalidatePath('/seller/products')
        revalidatePath('/')
        revalidatePath('/shop')
        return ApiResponse.success(null, "Product approved successfully")
    } catch (error) {
        logger.error("Admin Approve Product Error", error)
        return ApiResponse.error("Failed to approve product")
    }
}

export async function adminRejectProduct(productId, reason, adminId) {
    try {
        if (!adminId) return ApiResponse.unauthorized("Admin ID required")
        const admin = await prisma.user.findUnique({ where: { id: adminId } })
        if (!admin || admin.role !== 'ADMIN') {
            if (adminId !== "admin_demo") {
                return ApiResponse.unauthorized("Only admins can reject products")
            }
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: { status: 'rejected', rejectionReason: reason || "Listing does not meet guidelines." },
            include: {
                store: {
                    include: { user: true }
                }
            }
        })

        if (product.store?.user?.email) {
            const { subject, html } = productRejectedEmail({
                sellerName: product.store.name,
                productName: product.name,
                reason: reason || "Listing does not meet guidelines."
            })
            sendEmail({
                to: product.store.user.email,
                subject,
                html
            }).catch(err => logger.warn("Failed to send product rejection email", err))
        }

        // Notify Seller
        try {
            const { createNotification } = await import('./notification')
            await createNotification(
                product.store.userId,
                "Listing Rejected",
                `Your product "${product.name}" was not approved. Reason: ${reason || "Does not meet guidelines."}`,
                "SYSTEM"
            )
        } catch (e) {}

        revalidatePath('/admin/products')
        revalidatePath('/seller/products')
        revalidatePath('/')
        revalidatePath('/shop')
        return ApiResponse.success(null, "Product rejected")
    } catch (error) {
        logger.error("Admin Reject Product Error", error)
        return ApiResponse.error("Failed to reject product")
    }
}
export async function verifyProductImages(images) {
    try {
        if (!images || images.length === 0) return ApiResponse.error("No images to verify", 400);
        const result = await verifyIsBattery(images);
        return ApiResponse.success(result);
    } catch (error) {
        logger.error("AI Verification Action Error", error);
        return ApiResponse.error("Failed to verify images");
    }
}
