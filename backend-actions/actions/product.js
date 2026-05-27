'use server'
// Force rebuild 1

import { ApiResponse, handleDbError } from "@/backend-actions/lib/api-response"
import { mapProductToFrontend, logger } from "@/backend-actions/lib/api-utils"
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache"
import prisma, { withRetry } from "@/backend-actions/lib/prisma"
import { logToFile } from "@/backend-actions/lib/server-logger"
import { verifyIsBattery } from "@/backend-actions/lib/ai-service"
import { BATTERY_TYPE_MAPPING } from "@/lib/pricing"
import worker from "@/backend-actions/lib/worker"
import { rateLimit } from "@/backend-actions/lib/rate-limit"
import { headers } from "next/headers"


import { sendEmail, productApprovedEmail, productRejectedEmail } from "@/backend-actions/lib/email"

export async function createProduct(data, userId) {
    logger.info("Creating new product", { userId, productName: data.name })
    try {
        const headerList = await headers()
        const ip = headerList.get('x-forwarded-for') || 'unknown'
                // Rate limiting – return a friendly error if limit exceeded
        try {
            await rateLimit(`create_product_${userId || ip}`, 10);
        } catch (rlError) {
            logger.warn("Rate limit exceeded", rlError);
            return ApiResponse.error("Too many requests. Please try again later.", 429);
        }
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
                status: 'pending',
                storeId: store.id,
                inStock: true
            }
        }))
        
        logToFile(`SERVER: DB create successful for: ${product.id}`);

        // ─── AI Verification & Admin Notification (Awaited for Vercel) ───
        try {
            const aiResult = await verifyIsBattery(data.images || []);
            
            if (!aiResult.isBattery) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { 
                        status: 'rejected',
                        rejectionReason: `AI Verification Failed: ${aiResult.reason}`
                    }
                });
                logToFile(`PRODUCT_AUTO_REJECTED: ${data.name}`, aiResult);
            }

            // Notify Admins
            const { createNotification } = await import('./notification');
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
            
            const notificationMsg = !aiResult.isBattery 
                ? `AUTO-REJECTED: ${store.name} tried listing a non-battery item: ${data.name}`
                : `${store.name} has listed a new product: ${data.name}. Approval required.`;

            for (const admin of admins) {
                await createNotification(
                    admin.id,
                    !aiResult.isBattery ? "Auto-Rejection Alert" : "New Product Listing",
                    notificationMsg,
                    "SYSTEM"
                );
            }
        } catch (taskError) {
            console.warn("Background task for product creation failed", taskError);
        }

        try {
            const { revalidateTag } = await import("next/cache");
            revalidateTag('products')
            revalidateTag(`seller-${store.id}`)
            revalidatePath('/seller/products')
            revalidatePath('/')
            revalidatePath('/shop')
        } catch (revalError) {
            console.warn('Revalidate failed', revalError);
        }

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

        // Directly fetch products and total count without caching to avoid exceeding cache size limits
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: { storeId: store.id },
                select: {
                    id: true, name: true, description: true, mrp: true, price: true,
                    category: true, type: true, brand: true, amps: true, condition: true,
                    pickupAddress: true, collectionDateStart: true, collectionDateEnd: true,
                    collectionDates: true, quantity: true, inStock: true, status: true,
                    rejectionReason: true, storeId: true, createdAt: true, updatedAt: true,
                    images: true
                },
                orderBy: { createdAt: 'desc' },
                skip: skip,
                take: limit
            }),
            prisma.product.count({ where: { storeId: store.id } })
        ]);

        logToFile(`GET_SELLER_PRODUCTS: Found ${products.length} products (Total: ${totalCount})`);
        const formatted = products.map(mapProductToFrontend);

        return ApiResponse.success({
            data: {
                products: formatted,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            }
        })
    } catch (error) {
        logger.error("Get Seller Products Error", error)
        return ApiResponse.error("Failed to fetch products")
    }
}

export async function updateProduct(productId, data, userId) {
    logger.info("Updating product", { productId, userId, productName: data.name })
    try {
        if (!userId) return ApiResponse.unauthorized("Authentication required")
        
        const store = await withRetry(() => prisma.store.findUnique({ where: { userId } }))
        if (!store) return ApiResponse.error("Store not found", 404)

        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product || product.storeId !== store.id) {
            return ApiResponse.error("Product not found or unauthorized", 404)
        }

        const price = parseFloat(data.price)
        const units = parseInt(data.unitsAvailable) || 0
        const amps = parseInt(data.amps) || 0

        if (isNaN(price) || price <= 0) return ApiResponse.error("Invalid price", 400)
        
        const collectionDateStart = data.collectionDates?.length ? new Date(data.collectionDates[0]) : new Date()
        const collectionDateEnd = data.collectionDates?.length ? new Date(data.collectionDates[data.collectionDates.length - 1]) : new Date()

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name: data.name,
                description: data.comments || "",
                price: price,
                mrp: price * 1.2,
                images: data.images || [],
                type: BATTERY_TYPE_MAPPING[data.batteryType] || 'CAR_TRUCK_WET',
                brand: data.brand || "",
                amps: amps,
                pickupAddress: `${data.address}${data.lga ? ` | ${data.lga}` : ''}`,
                collectionDateStart,
                collectionDateEnd,
                collectionDates: data.collectionDates,
                quantity: units,
                status: 'pending', // Always reset to pending for re-approval
                inStock: units > 0
            }
        })

        const { revalidateTag } = await import("next/cache");
        revalidateTag('products')
        revalidateTag(`seller-${store.id}`)
        revalidatePath('/seller/products')
        revalidatePath('/')
        revalidatePath('/shop')
        revalidatePath(`/product/${productId}`)

        return ApiResponse.success(updatedProduct, "Listing updated successfully. It is now pending re-approval.")
    } catch (error) {
        logger.error("Update Product Error", error)
        return handleDbError(error, "updateProduct")
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

        const { revalidateTag } = await import("next/cache");
        revalidateTag('products')
        revalidateTag(`seller-${store.id}`)
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
        // Attempt to fetch from the separate backend first (for speed and decoupled hosting)
        // Use Promise.race with timeout to prevent slow fallback blocking
        const STANDALONE_TIMEOUT = 500; // 0.5 seconds max
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
        const isProduction = process.env.NODE_ENV === 'production';
        
        try {
            // Skip standalone fetch in production if it points to localhost to avoid 5s wait
            if (!(isProduction && isLocalhost)) {
                const apiPromise = fetch(`${apiUrl}/products`, {
                    next: { revalidate: 60 }, // Cache for 1 minute
                    signal: AbortSignal.timeout(STANDALONE_TIMEOUT)
                });
                
                // Race against timeout
                const apiRes = await Promise.race([
                    apiPromise,
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Standalone backend timeout')), STANDALONE_TIMEOUT)
                    )
                ]);
                
                if (apiRes.ok) {
                    const result = await apiRes.json();
                    const bridgeProducts = result.products || result.data || [];
                    if (result.success && bridgeProducts.length > 0) {
                        console.log("[BRIDGE] Fetched products from standalone backend");
                        return result;
                    }
                    console.log("[BRIDGE] Standalone backend returned no products; falling back to Prisma");
                }
            }
        } catch (apiErr) {
            // Silent fail for the bridge, we fallback to internal DB instantly
        }


        // Fallback to internal Prisma logic. Keep this uncached so newly approved
        // inventory appears in the marketplace immediately.
        const prismaProducts = await withRetry(() => prisma.product.findMany({
            where: { status: 'approved', inStock: true, store: { status: 'approved', isActive: true } },
            select: {
                id: true, name: true, description: true, price: true, mrp: true, images: true,
                category: true, type: true, brand: true, amps: true, condition: true,
                pickupAddress: true, quantity: true, rejectionReason: true,
                status: true, inStock: true, collectionDates: true,
                collectionDateStart: true, collectionDateEnd: true,
                store: { select: { name: true, address: true, isVerified: true, status: true, isActive: true, userId: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        }));

        const formatted = prismaProducts.map(mapProductToFrontend);
        return ApiResponse.success({ products: formatted, data: formatted });

    } catch (error) {
        console.error("[CRITICAL] getAllProducts failed:", error.message);
        return ApiResponse.success({ products: [], data: [] });
    }
}

export async function getProductById(productId) {
    try {
        console.log("SERVER: Fetching product by ID:", productId)

        const getCachedProduct = unstable_cache(
            async (id) => {
                return prisma.product.findUnique({
                    where: { id: id },
                    include: {
                        store: {
                            select: { name: true, address: true, isVerified: true, logo: true, status: true }
                        }
                    }
                })
            },
            [`product-${productId}`],
            { tags: ['products', `product-${productId}`], revalidate: 60 }
        );

        const product = await getCachedProduct(productId);

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
        const { unstable_cache } = await import("next/cache");

        const getCachedAdminProducts = unstable_cache(
            async (skipItems, limitItems) => {
                return Promise.all([
                    prisma.product.findMany({
                        skip: skipItems,
                        take: limitItems,
                        select: {
                            id: true, name: true, description: true, price: true, mrp: true,
                            category: true, type: true, brand: true, amps: true, condition: true,
                            status: true, inStock: true, createdAt: true, storeId: true,
                            collectionDates: true, collectionDateStart: true, collectionDateEnd: true,
                            store: { select: { id: true, name: true, email: true, user: { select: { name: true, email: true } } } }
                        },
                        orderBy: { createdAt: 'desc' }
                    }),
                    prisma.product.count()
                ]);
            },
            [`admin-products-${page}-${limit}`],
            { tags: ['products', 'admin-products'], revalidate: 60 }
        );

        const [products, total] = await getCachedAdminProducts(skip, limit);

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
        const { unstable_cache } = await import("next/cache");

        const getCachedPendingProducts = unstable_cache(
            async (skipItems, limitItems) => {
                return Promise.all([
                    prisma.product.findMany({
                        where: { status: 'pending' },
                        skip: skipItems,
                        take: limitItems,
                        select: {
                            id: true, name: true, description: true, price: true, mrp: true,
                            category: true, type: true, brand: true, amps: true, condition: true,
                            status: true, inStock: true, createdAt: true, storeId: true,
                            collectionDates: true, collectionDateStart: true, collectionDateEnd: true,
                            store: { select: { id: true, name: true, email: true, user: { select: { name: true, email: true } } } }
                        },
                        orderBy: { createdAt: 'desc' }
                    }),
                    prisma.product.count({ where: { status: 'pending' } })
                ]);
            },
            [`admin-pending-products-${page}-${limit}`],
            { tags: ['products', 'admin-products'], revalidate: 60 }
        );

        const [products, total] = await getCachedPendingProducts(skip, limit);

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
        if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
            return ApiResponse.unauthorized("Only admins can delete products")
        }

        await prisma.product.delete({ where: { id: productId } })
        revalidatePath('/admin/products')
        revalidatePath('/admin/pending-products')
        revalidatePath('/')
        revalidatePath('/shop')
        revalidateTag('products')
        revalidateTag('admin-products')
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
        if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
            return ApiResponse.unauthorized("Only admins can approve products")
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

        // ─── Notify Seller & In-App (Awaited for Vercel) ───
        try {
            if (product.store?.user?.email) {
                const { subject, html } = productApprovedEmail({
                    sellerName: product.store.name,
                    productName: product.name
                })
                await sendEmail({ to: product.store.user.email, subject, html }).catch(err => logger.warn("Approval email failed", err))
            }
            const { createNotification } = await import('./notification')
            await createNotification(product.store.userId, "Listing Approved! 🎉", `Your product "${product.name}" has been approved and is now live.`, "SYSTEM")
        } catch (e) {
            console.warn("Side effects for product approval failed", e);
        }

        revalidatePath('/admin/products')
        revalidatePath('/admin/pending-products')
        revalidatePath('/seller/products')
        revalidatePath('/')
        revalidatePath('/shop')
        revalidateTag('products')
        revalidateTag('admin-products')
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
        if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
            return ApiResponse.unauthorized("Only admins can reject products")
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

        // ─── Notify Seller & In-App (Awaited for Vercel) ───
        try {
            if (product.store?.user?.email) {
                const { subject, html } = productRejectedEmail({
                    sellerName: product.store.name,
                    productName: product.name,
                    reason: reason || "Listing does not meet guidelines."
                })
                await sendEmail({ to: product.store.user.email, subject, html }).catch(err => logger.warn("Rejection email failed", err))
            }
            const { createNotification } = await import('./notification')
            await createNotification(product.store.userId, "Listing Rejected", `Your product "${product.name}" was not approved. Reason: ${reason || "Does not meet guidelines."}`, "SYSTEM")
        } catch (e) {
            console.warn("Side effects for product rejection failed", e);
        }

        revalidatePath('/admin/products')
        revalidatePath('/admin/pending-products')
        revalidatePath('/seller/products')
        revalidatePath('/')
        revalidatePath('/shop')
        revalidateTag('products')
        revalidateTag('admin-products')
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
