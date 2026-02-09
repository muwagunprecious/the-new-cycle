'use server'

import prisma from "@/backend/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Update store bank details for persistence
 */
export async function updateStoreBankDetails(userId, bankDetails) {
    try {
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return { success: false, error: "Seller store not found" }
        }

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
        return { success: true }
    } catch (error) {
        console.error("Update Bank Details Error:", error)
        return { success: false, error: "Failed to save bank details" }
    }
}

/**
 * Fetch store details including bank info
 */
export async function getStoreDetails(userId) {
    try {
        const store = await prisma.store.findUnique({
            where: { userId }
        })
        return { success: true, data: store }
    } catch (error) {
        console.error("Get Store Details Error:", error)
        return { success: false, error: "Failed to fetch store details" }
    }
}
