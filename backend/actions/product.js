'use server'

import { ApiResponse } from "@/backend/lib/api-response"
import { mapProductToFrontend, logger } from "@/backend/lib/api-utils"
import { revalidatePath } from "next/cache"
import prisma from "@/backend/lib/prisma"
import { sendEmail, productApprovedEmail, productRejectedEmail } from "@/backend/lib/email"

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
                inStock: true,
                status: "pending"
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

export async function getSellerProducts(userId, page = 1, limit = 50) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.success({ products: [], data: [], pagination: { page, totalPages: 0, totalCount: 0 } }, "No store found")

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
                    updatedAt: true
                    // Excluding images for list view efficiency
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.product.count({ where: { storeId: store.id } })
        ])

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

export async function getAllProducts() {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: 'approved',
                store: { status: 'approved', isActive: true },
                inStock: true
            },
            include: {
                store: {
                    select: { name: true, address: true, isVerified: true, status: true, isActive: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formatted = products.map(mapProductToFrontend)
        return ApiResponse.success({ products: formatted, data: formatted })
    } catch (error) {
        logger.error("Get All Products Error", error)
        return ApiResponse.error("Failed to fetch products")
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
        console.log("SERVER: Product MAPPED successfully. Image count:", mapped.images?.length || 0)
        return ApiResponse.success(mapped)
    } catch (error) {
        console.error("SERVER: getProductById EXCEPTION:", error)
        return ApiResponse.error("Failed to fetch product details")
    }
}

export async function getAdminProducts(page = 1, limit = 50) {
    try {
        const skip = (page - 1) * limit
        const [products, total] = await Promise.all([
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
        ])

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
        const skip = (page - 1) * limit
        const [products, total] = await Promise.all([
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
        ])

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

export async function adminApproveProduct(productId) {
    try {
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

export async function adminRejectProduct(productId, reason) {
    try {
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
