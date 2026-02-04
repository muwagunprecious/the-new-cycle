'use server'

import prisma from "@/backend/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createProduct(data, userId) {
    const startTime = Date.now()
    const log = (msg) => console.log(`[${new Date().toISOString()}] SERVER PRODUCT: ${msg}`)

    try {
        log(`[START] Creating product for UserID: ${userId}`)
        log(`PAYLOAD_KEYS: ${Object.keys(data).join(', ')}`)

        // 1. Basic validation
        if (!userId) {
            log("ERROR: User ID missing from session context")
            return { success: false, error: "Authentication Error: Please re-login" }
        }
        if (!data.collectionDates || data.collectionDates.length === 0) {
            log("ERROR: No collection dates provided")
            return { success: false, error: "Please select at least one collection date" }
        }

        const price = parseFloat(data.price)
        const units = parseInt(data.unitsAvailable)
        const amps = parseInt(data.amps) || 0

        if (isNaN(price)) { log("ERROR: Price is NaN"); return { success: false, error: "Invalid price" } }
        if (isNaN(units)) { log("ERROR: Units is NaN"); return { success: false, error: "Invalid units/quantity" } }

        log(`VALIDATED: Price=${price}, Units=${units}, Amps=${amps}`)
        if (data.images) log(`IMAGES: Count=${data.images.length}, TotalLen=${JSON.stringify(data.images).length}`)

        // 2. Database Lookup: Store
        log("DB: Looking up store for seller...")
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            log(`ERROR: Store not found for user ${userId}`)
            return { success: false, error: "Store not found. Please create a store first." }
        }
        log(`STORE: Found ID ${store.id}, Status: ${store.status}`)

        if (store.status !== 'approved' || !store.isActive) {
            log(`ERROR: Store not ready. Status=${store.status}, Active=${store.isActive}`)
            return { success: false, error: "Your store must be 'Approved' and 'Active' to list batteries." }
        }

        // 3. Prepare Dates
        const startRaw = data.collectionDates[0]
        const collectionDateStart = new Date(startRaw)
        const collectionDateEnd = new Date(data.collectionDates[data.collectionDates.length - 1])

        if (isNaN(collectionDateStart.getTime())) {
            log(`ERROR: Date conversion failed for ${startRaw}`)
            return { success: false, error: "Invalid collection date format" }
        }

        // 4. Create Product
        log("DB: Attempting product creation...")
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.comments || "",
                mrp: price * 1.2,
                price: price,
                images: data.images || [],
                category: "Battery",
                type: data.batteryType === 'Car Battery' ? 'CAR_BATTERY' :
                    data.batteryType === 'Inverter Battery' ? 'INVERTER_BATTERY' : 'HEAVY_DUTY_BATTERY',
                brand: data.brand || "",
                amps: amps,
                condition: data.condition || "SCRAP",
                pickupAddress: data.address,
                collectionDateStart,
                collectionDateEnd,
                collectionDates: data.collectionDates,
                quantity: units,
                storeId: store.id,
                inStock: true
            }
        })
        log(`SUCCESS: Product created with ID ${product.id}`)

        // 5. Safe Revalidation
        log("CACHE: Starting revalidation...")
        try {
            revalidatePath('/seller/products')
            // revalidatePath('/') // Skip heavy revalidation in dev to prevent hangs
        } catch (revalErr) {
            log(`CACHE_WARN: Revalidation non-fatal error: ${revalErr.message}`)
        }

        const duration = (Date.now() - startTime) / 1000
        log(`[DONE] Total server time: ${duration}s`)

        return { success: true, product }

    } catch (error) {
        log(`FATAL_ERROR: ${error.message}`)
        console.error(error)
        return { success: false, error: "Publication failed: " + (error.message || "Internal Server Error") }
    }
}

export async function getSellerProducts(userId) {
    try {
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return { success: true, products: [] } // No store = no products
        }

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' }
        })

        // Hydrate products for frontend compatibility
        const hydratedProducts = products.map(p => ({
            ...p,
            unitsAvailable: p.quantity,
            batteryType: p.type === 'CAR_BATTERY' ? 'Car Battery' :
                p.type === 'INVERTER_BATTERY' ? 'Inverter Battery' : 'Heavy Duty Battery'
        }))

        return { success: true, products: hydratedProducts }

    } catch (error) {
        console.error("Get Seller Products Error:", error)
        return { success: false, error: "Failed to fetch products" }
    }
}

export async function deleteProduct(productId, userId) {
    try {
        // Verify ownership via store
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if product belongs to this store
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product || product.storeId !== store.id) {
            return { success: false, error: "Product not found or unauthorized" }
        }

        await prisma.product.delete({
            where: { id: productId }
        })

        revalidatePath('/seller/products')
        return { success: true }

    } catch (error) {
        console.error("Delete Product Error:", error)
        return { success: false, error: "Failed to delete product" }
    }
}

export async function getAllProducts() {
    try {
        const products = await prisma.product.findMany({
            where: {
                store: {
                    status: 'approved',
                    isActive: true
                }
            },
            include: {
                store: {
                    select: {
                        name: true,
                        address: true,
                        isVerified: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Hydrate products for frontend compatibility
        const hydratedProducts = products.map(p => ({
            ...p,
            unitsAvailable: p.quantity,
            batteryType: p.type === 'CAR_BATTERY' ? 'Car Battery' :
                p.type === 'INVERTER_BATTERY' ? 'Inverter Battery' : 'Heavy Duty Battery'
        }))

        return { success: true, products: hydratedProducts }
    } catch (error) {
        console.error("Get All Products Error:", error)
        return { success: false, error: "Failed to fetch products" }
    }
}

export async function getProductById(productId) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                store: {
                    select: {
                        name: true,
                        address: true,
                        isVerified: true,
                        logo: true
                    }
                }
            }
        })

        if (!product) {
            return { success: false, error: "Product not found" }
        }

        // Hydrate product for frontend compatibility
        const hydratedProduct = {
            ...product,
            unitsAvailable: product.quantity,
            batteryType: product.type === 'CAR_BATTERY' ? 'Car Battery' :
                product.type === 'INVERTER_BATTERY' ? 'Inverter Battery' : 'Heavy Duty Battery'
        }

        return { success: true, product: hydratedProduct }

    } catch (error) {
        console.error("Get Product By Id Error:", error)
        return { success: false, error: "Failed to fetch product" }
    }
}

export async function getAdminProducts() {
    try {
        const products = await prisma.product.findMany({
            include: {
                store: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Hydrate products for admin view
        const hydratedProducts = products.map(p => ({
            ...p,
            unitsAvailable: p.quantity,
            batteryType: p.type === 'CAR_BATTERY' ? 'Car Battery' :
                p.type === 'INVERTER_BATTERY' ? 'Inverter Battery' : 'Heavy Duty Battery',
            // Since Product doesn't have status, we use store status or default to Approved
            status: p.store?.status === 'approved' ? 'Approved' : 'Pending'
        }))

        return { success: true, products: hydratedProducts }
    } catch (error) {
        console.error("Get Admin Products Error:", error)
        return { success: false, error: "Failed to fetch admin products" }
    }
}

export async function adminDeleteProduct(productId) {
    try {
        await prisma.product.delete({
            where: { id: productId }
        })
        revalidatePath('/admin/products')
        revalidatePath('/')
        revalidatePath('/shop')
        return { success: true }
    } catch (error) {
        console.error("Admin Delete Product Error:", error)
        return { success: false, error: "Failed to delete product" }
    }
}
