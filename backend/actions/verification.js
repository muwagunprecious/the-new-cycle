'use server'

import { ApiResponse } from "@/backend/lib/api-response"
import { logger } from "@/backend/lib/api-utils"
import { verifyNIN, verifyCAC } from "@/backend/lib/qoreid"
import { revalidatePath } from "next/cache"
import prisma from "@/backend/lib/prisma"

/**
 * Server action to verify NIN
 */
export async function performNINVerification(userId, nin, userData) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        let isVerified = false
        let result = null

        // TEST MODE BYPASS for NIN
        if (nin === '70123456789') {
            logger.info('TEST MODE: Bypassing QoreID for NIN', { userId })
            isVerified = true
            result = { status: 'success', summary: { status: 'VERIFIED', description: 'Test Mode Bypass' } }
        } else {
            result = await verifyNIN(nin, userData)
            isVerified = result.status === 'success' ||
                result.status?.status === 'verified' ||
                result.status?.state === 'complete' ||
                result.summary?.status === 'VERIFIED' ||
                result.summary?.nin_check?.status === 'EXACT_MATCH'
        }

        if (isVerified) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    ninDocument: nin,
                    isPhoneVerified: true,
                    accountStatus: 'pending',
                    verifiedAt: new Date()
                }
            })

            revalidatePath('/admin/verify-buyers')
            return ApiResponse.success(result, "NIN verification successful")
        }

        const errorMessage = result.summary?.description || result.message || result.error || 'NIN verification failed'
        return ApiResponse.error(errorMessage, 400)
    } catch (error) {
        logger.error('NIN Verification Action Error', error)
        return ApiResponse.error(error.message)
    }
}

/**
 * Server action to verify CAC
 */
export async function performCACVerification(userId, rcNumber, companyName) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const result = await verifyCAC(rcNumber, companyName)
        const isVerified = result.status === 'success' ||
            result.status?.status === 'verified' ||
            result.status?.state === 'complete' ||
            result.summary?.status === 'VERIFIED'

        if (isVerified) {
            const store = await prisma.store.findUnique({ where: { userId } })
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

            await prisma.user.update({
                where: { id: userId },
                data: {
                    cacDocument: rcNumber,
                    verifiedAt: new Date()
                }
            })

            revalidatePath('/admin/verify-buyers')
            return ApiResponse.success(result, "CAC verification successful")
        }

        const errorMessage = result.summary?.description || result.message || result.error || 'CAC verification failed'
        return ApiResponse.error(errorMessage, 400)
    } catch (error) {
        logger.error('CAC Verification Action Error', error)
        return ApiResponse.error(error.message)
    }
}
