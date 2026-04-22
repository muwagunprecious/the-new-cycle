'use server'

import { ApiResponse } from "@/backend-actions/lib/api-response"
import { logger } from "@/backend-actions/lib/api-utils"
import { verifyNIN, verifyCAC } from "@/backend-actions/lib/qoreid"
import { revalidatePath } from "next/cache"
import prisma from "@/backend-actions/lib/prisma"

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
export async function performCACVerification(userId, rcNumber) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        // Fetch user to get NIN details for director matching
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        // TEST MODE BYPASS for CAC
        if (rcNumber === 'RC0000000') {
            logger.info('TEST MODE: Bypassing QoreID for CAC', { userId })
            
            const mockResult = {
                success: true,
                status: 'success',
                cac: {
                    companyName: "GO-CYCLE TEST CORP",
                    companyType: "PRIVATE LIMITED COMPANY",
                    rcNumber: "RC0000000",
                    status: "ACTIVE",
                    directors: [
                        { firstname: user?.name?.split(' ')[0] || "Test", lastname: user?.name?.split(' ').pop() || "Director" }
                    ]
                }
            };

            // Using our logic with mock data
            const businessData = mockResult.cac;
            const businessName = businessData.companyName;
            const businessType = businessData.companyType;
            const isDirectorVerified = true; // Force true for test mode

            // Update Store
            const store = await prisma.store.findUnique({ where: { userId } })
            if (store) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: {
                        cac: rcNumber,
                        status: 'approved',
                        isVerified: true,
                        isDirectorVerified: isDirectorVerified
                    }
                })
            }

            // Update User
            await prisma.user.update({
                where: { id: userId },
                data: {
                    cacDocument: rcNumber,
                    businessName: businessName,
                    businessType: businessType,
                    isDirectorVerified: isDirectorVerified,
                    verifiedAt: new Date()
                }
            })

            return ApiResponse.success({
                ...mockResult,
                businessName,
                businessType,
                isDirectorVerified
            }, "CAC verification successful (TEST MODE)")
        }

        const result = await verifyCAC(rcNumber)
        
        // QoreID Premium response structure handling
        const isVerified = result.status === 'success' || 
                          result.status?.status === 'verified' || 
                          result.summary?.cac_check === 'verified' ||
                          result.summary?.status === 'VERIFIED';

        if (isVerified) {
            const businessData = result.cac || result.data || {};
            const businessName = businessData.companyName || businessData.entityName || "Unknown Business";
            const businessType = businessData.companyType || businessData.entityType || "N/A";
            
            // Director Matching Logic
            let isDirectorVerified = false;
            const directors = businessData.directors || businessData.fiduciaries || [];
            
            if (user && user.ninDocument && directors.length > 0) {
                // We use the names from the user profile (which should ideally be verified via NIN)
                const userFullName = (user.fullName || user.name || "").toLowerCase();
                
                isDirectorVerified = directors.some(director => {
                    const dFirst = (director.firstname || director.first_name || "").toLowerCase();
                    const dLast = (director.lastname || director.last_name || director.surname || "").toLowerCase();
                    
                    // Simple check: if both names are present in the user's full name
                    return (dFirst.length > 1 && userFullName.includes(dFirst)) && 
                           (dLast.length > 1 && userFullName.includes(dLast));
                });
                
                logger.info('Director Matching result', { userId, businessName, isDirectorVerified });
            }

            // Update Store if it exists
            const store = await prisma.store.findUnique({ where: { userId } })
            if (store) {
                await prisma.store.update({
                    where: { id: store.id },
                    data: {
                        cac: rcNumber,
                        status: 'approved',
                        isVerified: true,
                        isDirectorVerified: isDirectorVerified
                    }
                })
            }

            // Update User
            await prisma.user.update({
                where: { id: userId },
                data: {
                    cacDocument: rcNumber,
                    businessName: businessName,
                    businessType: businessType,
                    isDirectorVerified: isDirectorVerified,
                    verifiedAt: new Date()
                }
            })

            revalidatePath('/admin/verify-buyers')
            return ApiResponse.success({
                ...result,
                businessName,
                businessType,
                isDirectorVerified
            }, "CAC verification successful")
        }

        const errorMessage = result.summary?.description || result.message || result.error || 'CAC verification failed'
        return ApiResponse.error(errorMessage, 400)
    } catch (error) {
        logger.error('CAC Verification Action Error', error)
        return ApiResponse.error(error.message)
    }
}
