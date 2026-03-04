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

        const store = await prisma.store.findUnique({
            where: { userId },
            select: { id: true, status: true }
        })
        if (!store) return ApiResponse.error("Store not found", 404)

        // 1. Total Products Count
        const totalProducts = await prisma.product.count({
            where: { storeId: store.id }
        })

        // 2. Orders Stats
        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            select: {
                status: true,
                payoutStatus: true,
                payoutAmount: true,
                total: true
            }
        })

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

        // 3. Recent Orders (Latest 5)
        const recentOrders = await prisma.order.findMany({
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
