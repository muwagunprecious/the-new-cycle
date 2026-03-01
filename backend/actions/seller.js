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
