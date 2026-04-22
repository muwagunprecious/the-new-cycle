'use server'

import { ApiResponse } from "@/backend/lib/api-response"
import { logger } from "@/backend/lib/api-utils"
import { revalidatePath } from "next/cache"
import prisma from "@/backend/lib/prisma"

/**
 * Update store bank details for persistence
 */
export async function updateStoreBankDetails(userId, bankDetails) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.error("Seller store not found", 404)

        await prisma.store.update({
            where: { id: store.id },
            data: {
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                accountName: bankDetails.accountName,
                isVerified: true
            }
        })

        revalidatePath('/seller')
        return ApiResponse.success(null, "Bank details updated successfully")
    } catch (error) {
        logger.error("Update Bank Details Error", error)
        return ApiResponse.error("Failed to save bank details")
    }
}

/**
 * Fetch store details including bank info
 */
export async function getStoreDetails(userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        if (userId === "seller_demo") {
            return ApiResponse.success({
                id: "demo_store",
                name: "Adebayo Kola's Store",
                username: "adebayo_demo",
                description: "Battery Vendor",
                address: "10 Industrial Way, Ikeja, Lagos",
                email: "adebayo@ecovolt.com",
                contact: "+234 800-000-0001",
                logo: "",
                status: "approved",
                isActive: true,
                userId: "seller_demo",
                bankName: "Guaranty Trust Bank",
                accountNumber: "0123456789",
                accountName: "Adebayo Kola"
            })
        }

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        return ApiResponse.success(store)
    } catch (error) {
        logger.error("Get Store Details Error", error)
        return ApiResponse.error("Failed to fetch store details")
    }
}

/**
 * Fetch aggregated dashboard summary for a seller
 */
export async function getSellerDashboardSummary(userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        if (userId === "seller_demo") {
            return ApiResponse.success({
                totalProducts: 12,
                totalEarnings: 850000,
                pendingPickups: 3,
                completedOrdersCount: 45,
                pendingPayouts: 120000,
                recentOrders: [
                    {
                        id: "ORD-DEMO-001",
                        status: "PENDING",
                        total: 45000,
                        createdAt: new Date().toISOString(),
                        orderItems: [{ product: { name: "Isuzu 12V 100AH Battery" } }]
                    },
                    {
                        id: "ORD-DEMO-002",
                        status: "COMPLETED",
                        total: 35000,
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        orderItems: [{ product: { name: "Luminous 12V 200AH Gel" } }]
                    }
                ],
                storeStatus: 'approved'
            })
        }

        const store = await prisma.store.findUnique({
            where: { userId },
            select: { id: true, status: true }
        })
        if (!store) return ApiResponse.error("Store not found", 404)

        // Run all 3 queries in parallel
        const [totalProducts, orders, recentOrders] = await Promise.all([
            // 1. Total Products Count
            prisma.product.count({
                where: { storeId: store.id }
            }),
            // 2. Orders Stats
            prisma.order.findMany({
                where: { storeId: store.id },
                select: {
                    status: true,
                    payoutStatus: true,
                    payoutAmount: true,
                    total: true
                }
            }),
            // 3. Recent Orders (Latest 5)
            prisma.order.findMany({
                where: { storeId: store.id },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: { name: true }
                            }
                        }
                    }
                }
            })
        ])

        const pendingPickupStatuses = ['ORDER_PLACED', 'PAID', 'APPROVED', 'PROCESSING']
        const completionStatuses = ['COMPLETED', 'PICKED_UP']

        const stats = orders.reduce((acc, order) => {
            if (pendingPickupStatuses.includes(order.status)) {
                acc.pendingPickups++
            }
            if (completionStatuses.includes(order.status)) {
                acc.completedOrdersCount++
                acc.totalEarnings += (order.payoutAmount || order.total || 0)
            }
            if (order.payoutStatus === 'pending') {
                acc.pendingPayouts += (order.payoutAmount || order.total || 0)
            }
            return acc
        }, {
            pendingPickups: 0,
            completedOrdersCount: 0,
            totalEarnings: 0,
            pendingPayouts: 0
        })

        return ApiResponse.success({
            totalProducts,
            totalEarnings: stats.totalEarnings,
            pendingPickups: stats.pendingPickups,
            completedOrdersCount: stats.completedOrdersCount,
            pendingPayouts: stats.pendingPayouts,
            recentOrders,
            storeStatus: store.status
        })
    } catch (error) {
        logger.error("Get Seller Dashboard Summary Error", error)
        return ApiResponse.error("Failed to fetch dashboard summary")
    }
}

/**
 * Update store address permanently
 */
export async function updateStoreAddress(userId, address) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        await prisma.store.update({
            where: { id: store.id },
            data: { address }
        })

        return ApiResponse.success(null, "Address saved permanently")
    } catch (error) {
        logger.error("Update Store Address Error", error)
        return ApiResponse.error("Failed to save address")
    }
}

export async function getSellerPayoutHistory(userId, page = 1, limit = 50) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        if (userId === "seller_demo") {
            const mockPayouts = [
                {
                    id: "PAY-DEMO-001",
                    updatedAt: new Date().toISOString(),
                    payoutAmount: 45000,
                    orderItems: [{ product: { name: "Isuzu 12V 100AH Battery" } }]
                },
                {
                    id: "PAY-DEMO-002",
                    updatedAt: new Date(Date.now() - 172800000).toISOString(),
                    payoutAmount: 35000,
                    orderItems: [{ product: { name: "Luminous 12V 200AH Gel" } }]
                }
            ]
            return ApiResponse.success({
                orders: mockPayouts,
                data: mockPayouts,
                pagination: { page: 1, limit: 50, total: 2, totalPages: 1 }
            })
        }

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        const skip = (page - 1) * limit
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { storeId: store.id, payoutStatus: 'released' },
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    orderItems: { include: { product: { select: { name: true } } } }
                }
            }),
            prisma.order.count({ where: { storeId: store.id, payoutStatus: 'released' } })
        ])

        return ApiResponse.success({ 
            orders, 
            data: orders, 
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } 
        })
    } catch (error) {
        logger.error("Get Seller Payout History Error", error)
        return ApiResponse.error("Failed to fetch payout history")
    }
}
