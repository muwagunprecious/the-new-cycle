'use server'

import prisma from "@/backend/lib/prisma"
import { revalidatePath } from "next/cache"

// We assume there's a way to identify the current user/seller.
// Since Auth is not fully visible (using Clerk/NextAuth?), I'll assume we pass userId or storeId,
// or we might need to fetch the session.
// For now, I'll assume the client passes the necessary IDs or we rely on a future auth check.
// Looking at the schema, products belong to a store.
// The frontend `SellerProducts` page seems to manage "My Inventory".

export async function createProduct(productData, storeId) {
    try {
        // Validation: Verify store exists and is approved
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store) {
            return { success: false, error: "Store not found" }
        }

        if (store.status !== 'approved' || !store.isActive) {
            return { success: false, error: "Store is not approved for selling" }
        }

        // --- NEW VALIDATION ---

        // 1. Mandatory Battery Type
        const validTypes = ['CAR_BATTERY', 'INVERTER_BATTERY', 'HEAVY_DUTY_BATTERY']
        if (!productData.type || !validTypes.includes(productData.type)) {
            return { success: false, error: "Invalid or missing Battery Type" }
        }

        // 2. Image Requirement (Min 2)
        if (!productData.images || productData.images.length < 2) {
            return { success: false, error: "Minimum of 2 images required" }
        }

        // 3. Collection Dates Logic (Start date must be > 24 hours from now)
        const now = new Date()
        const minStartDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
        const startDate = new Date(productData.collectionDateStart)
        const endDate = new Date(productData.collectionDateEnd)

        if (startDate < minStartDate) {
            return { success: false, error: "Collection start date must be at least 24 hours from now" }
        }

        if (endDate <= startDate) {
            return { success: false, error: "End date must be after start date" }
        }

        // 4. Pickup Address (Mandatory)
        if (!productData.pickupAddress || productData.pickupAddress.trim() === '') {
            return { success: false, error: "Pickup address is required" }
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                name: productData.name || `${productData.brand || 'Generic'} ${productData.type.replace('_', ' ')}`, // Auto-generate name if simple
                description: productData.description || "",
                price: parseFloat(productData.price),
                mrp: parseFloat(productData.mrp || productData.price),
                category: productData.type, // Map type to category or keep separate
                type: productData.type,
                brand: productData.brand || null,
                condition: productData.condition || 'SCRAP',
                pickupAddress: productData.pickupAddress,
                collectionDateStart: startDate,
                collectionDateEnd: endDate,
                quantity: parseInt(productData.quantity) || 1,
                images: productData.images,
                storeId: storeId,
                inStock: true
            }
        })

        revalidatePath('/seller/products')
        return { success: true, data: product }
    } catch (error) {
        console.error("Error creating product:", error)
        return { success: false, error: "Failed to create product: " + error.message }
    }
}

export async function getSellerProducts(storeId) {
    try {
        const products = await prisma.product.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: products }
    } catch (error) {
        console.error("Error getting seller products:", error)
        return { success: false, error: "Failed to fetch products" }
    }
}

export async function deleteSellerProduct(productId, storeId) {
    try {
        // Verify ownership
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product || product.storeId !== storeId) {
            return { success: false, error: "Not authorized" }
        }

        await prisma.product.delete({
            where: { id: productId }
        })

        revalidatePath('/seller/products')
        return { success: true }
    } catch (error) {
        console.error("Error deleting product:", error)
        return { success: false, error: "Failed to delete product" }
    }
}


export async function getSellerStore(userId) {
    try {
        const store = await prisma.store.findUnique({
            where: { userId }
        })
        return { success: true, data: store }
    } catch (error) {
        console.error("Error fetching seller store:", error)
        return { success: false, error: "Failed to fetch store" }
    }
}

export async function verifyPickupToken(storeId, token) {
    try {
        // Find order with this token and store
        const order = await prisma.order.findFirst({
            where: {
                storeId: storeId,
                collectionToken: token,
                collectionStatus: 'PENDING'
            }
        })

        if (!order) {
            return { success: false, error: "Invalid token or order already collected" }
        }

        // Update Order Status
        await prisma.order.update({
            where: { id: order.id },
            data: {
                collectionStatus: 'COLLECTED',
                status: 'DELIVERED', // or 'COMPLETED'
                isPaid: true // Assuming platform releases funds internally or marks it paid to seller
            }
        })

        revalidatePath('/seller')
        return { success: true, message: `Pickup verified for Order #${order.id}` }
    } catch (error) {
        console.error("Error verifying pickup:", error)
        return { success: false, error: "Verification failed: " + error.message }
    }
}

export async function updateStore(storeId, data) {
    try {
        const store = await prisma.store.update({
            where: { id: storeId },
            data: {
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountName: data.accountName
            }
        })
        revalidatePath('/seller')
        return { success: true, store }
    } catch (error) {
        console.error("Update Store Error:", error)
        return { success: false, error: "Failed to update store" }
    }
}
