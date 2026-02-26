'use server'

import { verifyNIN, verifyCAC } from "@/backend/lib/qoreid"
import prisma from "@/backend/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Server action to verify NIN
 */
export async function performNINVerification(userId, nin, userData) {
    try {
        const result = await verifyNIN(nin, userData)

        if (result.status === 'success' || (result.summary && result.summary.status === 'VERIFIED')) {
            // Update user in database
            await prisma.user.update({
                where: { id: userId },
                data: {
                    ninDocument: nin, // Store the verified NIN
                    isPhoneVerified: true, // If NIN is verified, we can trust the identity
                    accountStatus: 'approved', // Auto-approve if NIN matches? Or keep pending?
                    verifiedAt: new Date()
                }
            })

            revalidatePath('/admin/verify-buyers')
            return { success: true, data: result }
        } else {
            return { success: false, error: result.summary?.description || 'NIN verification failed' }
        }
    } catch (error) {
        console.error('Action Verification Error (NIN):', error)
        return { success: false, error: error.message }
    }
}

/**
 * Server action to verify CAC
 */
export async function performCACVerification(userId, rcNumber, companyName) {
    try {
        const result = await verifyCAC(rcNumber, companyName)

        if (result.status === 'success' || (result.summary && result.summary.status === 'VERIFIED')) {
            // If user has a store, update it
            const store = await prisma.store.findUnique({
                where: { userId }
            })

            if (store) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: {
                        cac: rcNumber,
                        status: 'approved',
                        isVerified: true
                    }
                })
            }

            // Also update user record
            await prisma.user.update({
                where: { id: userId },
                data: {
                    cacDocument: rcNumber,
                    verifiedAt: new Date()
                }
            })

            revalidatePath('/admin/verify-buyers')
            return { success: true, data: result }
        } else {
            return { success: false, error: result.summary?.description || 'CAC verification failed' }
        }
    } catch (error) {
        console.error('Action Verification Error (CAC):', error)
        return { success: false, error: error.message }
    }
}
