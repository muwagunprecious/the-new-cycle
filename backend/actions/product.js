'use server'

import prisma from "@/backend/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createProduct(data, userId) {
    try {
        console.log("Creating product for user:", userId)

        // 1. Get the store for this user
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            // Check if user exists to provide better error
            const userExists = await prisma.user.findUnique({ where: { id: userId } })
            if (!userExists) {
                return { success: false, error: "Session invalid: Your account was reset. Please Logout and Sign Up again." }
            }

            return { success: false, error: "No store found for this seller. Please create a store first." }
        }

        // 2. Create the product
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.comments || "",
                mrp: parseFloat(data.price) * 1.2, // Mock MRP calculation
                price: parseFloat(data.price),
                images: data.images,
                category: "Battery", // Default
                type: data.batteryType,
                brand: data.brand,
                condition: data.condition || "SCRAP",
                pickupAddress: data.address,
                collectionDateStart: new Date(data.collectionDates[0]),
                collectionDateEnd: new Date(data.collectionDates[data.collectionDates.length - 1]),
                quantity: parseInt(data.unitsAvailable),
                storeId: store.id,
                inStock: true
            }
        })

        revalidatePath('/seller/products')
        revalidatePath('/seller')

        return { success: true, product }

    } catch (error) {
        console.error("Create Product Error:", error)
        return { success: false, error: "Failed to create product: " + error.message }
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

        return { success: true, products }

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
