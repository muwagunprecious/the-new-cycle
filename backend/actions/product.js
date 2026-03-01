'use server'

import { ApiResponse } from "@/backend/lib/api-response"
import { mapProductToFrontend, logger } from "@/backend/lib/api-utils"
import { revalidatePath } from "next/cache"
import prisma from "@/backend/lib/prisma"

export async function createProduct(data, userId) {
    try {
        console.log("SERVER: Received createProduct request", { userId, batteryType: data.batteryType, amps: data.amps })
        if (!userId) return ApiResponse.unauthorized("Authentication required")
        if (!data.collectionDates?.length) return ApiResponse.error("Please select at least one collection date", 400)

        const price = parseFloat(data.price)
        const units = parseInt(data.unitsAvailable) || 0
        const amps = parseInt(data.amps) || 0

        if (isNaN(price) || price <= 0) return ApiResponse.error("Invalid price", 400)
        if (units < 0) return ApiResponse.error("Invalid quantity", 400)

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.error("Store not found. Please create a store first.", 404)
        if (store.status !== 'approved' || !store.isActive) {
            return ApiResponse.error("Your store must be 'Approved' and 'Active' to list batteries.", 403)
        }

        const collectionDateStart = data.collectionDates?.length ? new Date(data.collectionDates[0]) : new Date()
        const collectionDateEnd = data.collectionDates?.length ? new Date(data.collectionDates[data.collectionDates.length - 1]) : new Date()

        // Update store bank details on every publish to ensure they are current
        await prisma.store.update({
            where: { id: store.id },
            data: {
                bankName: data.bankName || store.bankName,
                accountNumber: data.accountNumber || store.accountNumber,
                accountName: data.accountName || store.accountName
            }
        })

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.comments || "",
                mrp: price * 1.2,
                price: price,
                images: data.images || [],
                category: "Battery",
                type: data.batteryType === 'Cars and Truck batt (Wet cell)' ? 'CAR_TRUCK_WET' :
                    data.batteryType === 'Inverter Batt (Dry cell)' ? 'INVERTER_DRY' : 'INVERTER_WET',
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

        revalidatePath('/seller/products')
        revalidatePath('/')

        return ApiResponse.success(product, "Product created successfully")
    } catch (error) {
        logger.error("Create Product Error", error)
        return ApiResponse.error(`Publication failed: ${error.message}`)
    }
}

export async function getSellerProducts(userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.success({ products: [], data: [] }, "No store found")

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = products.map(mapProductToFrontend)
        return ApiResponse.success({ products: formatted, data: formatted })
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

export async function getAllProducts() {
    try {
        const products = await prisma.product.findMany({
            where: {
                store: { status: 'approved', isActive: true }
            },
            include: {
                store: {
                    select: { name: true, address: true, isVerified: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = products.map(mapProductToFrontend)
        return ApiResponse.success({ products: formatted, data: formatted })
    } catch (error) {
        logger.error("Get All Products Error", error)
        return ApiResponse.error("Failed to fetch products")
    }
}

export async function getProductById(productId) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                store: {
                    select: { name: true, address: true, isVerified: true, logo: true }
                }
            }
        })

        if (!product) return ApiResponse.error("Product not found", 404)

        return ApiResponse.success(mapProductToFrontend(product))
    } catch (error) {
        logger.error("Get Product By ID Error", error)
        return ApiResponse.error("Failed to fetch product details")
    }
}

export async function getAdminProducts() {
    try {
        const products = await prisma.product.findMany({
            include: {
                store: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const formatted = products.map(mapProductToFrontend)
        return ApiResponse.success({ products: formatted, data: formatted })
    } catch (error) {
        logger.error("Get Admin Products Error", error)
        return ApiResponse.error("Failed to fetch admin products")
    }
}

export async function adminDeleteProduct(productId) {
    try {
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
