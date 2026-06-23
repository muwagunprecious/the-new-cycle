'use server'

import prisma from '@/backend-actions/lib/prisma'
import { ApiResponse } from '@/backend-actions/lib/api-response'

// ─── Get All Affiliates ───────────────────────────────────────────────────────
export async function getAllAffiliates({ page = 1, limit = 20 } = {}) {
    try {
        const skip = (page - 1) * limit
        const [affiliates, total] = await Promise.all([
            prisma.affiliate.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { earnings: true, payoutRequests: true } }
                }
            }),
            prisma.affiliate.count()
        ])

        // Enrich with referral counts
        const enriched = await Promise.all(affiliates.map(async (aff) => {
            const referralCount = await prisma.user.count({
                where: { referredByCode: aff.referralCode }
            })
            return {
                ...aff,
                password: undefined,
                referralCount,
                earningsCount: aff._count.earnings,
                payoutRequestsCount: aff._count.payoutRequests
            }
        }))

        return ApiResponse.success({ affiliates: enriched, total, page, pages: Math.ceil(total / limit) })
    } catch (error) {
        console.error('[ADMIN AFFILIATES]', error)
        return ApiResponse.error('Failed to load affiliates', 500)
    }
}

// ─── Get Single Affiliate Detail ──────────────────────────────────────────────
export async function getAffiliateDetail(affiliateId) {
    try {
        const [affiliate, earnings, payoutRequests, referredUsers] = await Promise.all([
            prisma.affiliate.findUnique({
                where: { id: affiliateId },
                select: {
                    id: true, name: true, email: true, phone: true,
                    referralCode: true, status: true, walletBalance: true,
                    totalEarned: true, bankName: true, accountNumber: true,
                    accountName: true, isPhoneVerified: true, createdAt: true
                }
            }),
            prisma.affiliateEarning.findMany({
                where: { affiliateId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.affiliatePayoutRequest.findMany({
                where: { affiliateId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.findMany({
                where: { referredByCode: null }, // placeholder, filled below
                select: { id: true, name: true, phone: true, createdAt: true }
            })
        ])

        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        // Fetch users referred by this affiliate's code
        const referred = await prisma.user.findMany({
            where: { referredByCode: affiliate.referralCode },
            select: { id: true, name: true, phone: true, email: true, createdAt: true, accountStatus: true }
        })

        return ApiResponse.success({
            affiliate,
            earnings,
            payoutRequests,
            referredUsers: referred,
            stats: {
                referralCount: referred.length,
                totalEarned: affiliate.totalEarned,
                walletBalance: affiliate.walletBalance,
                pendingPayouts: payoutRequests.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
            }
        })
    } catch (error) {
        console.error('[ADMIN AFFILIATE DETAIL]', error)
        return ApiResponse.error('Failed to load affiliate details', 500)
    }
}

// ─── Approve Payout ───────────────────────────────────────────────────────────
export async function approveAffiliatePayout(requestId) {
    try {
        const request = await prisma.affiliatePayoutRequest.findUnique({
            where: { id: requestId },
            include: { affiliate: true }
        })
        if (!request) return ApiResponse.error('Payout request not found', 404)
        if (request.status !== 'pending') return ApiResponse.error('This request is no longer pending', 400)
        if (request.amount > request.affiliate.walletBalance) {
            return ApiResponse.error('Insufficient wallet balance for this payout', 400)
        }

        await prisma.$transaction([
            prisma.affiliatePayoutRequest.update({
                where: { id: requestId },
                data: { status: 'approved' }
            }),
            prisma.affiliate.update({
                where: { id: request.affiliateId },
                data: { walletBalance: { decrement: request.amount } }
            }),
            // Mark related earnings as paid
            prisma.affiliateEarning.updateMany({
                where: { affiliateId: request.affiliateId, status: 'pending' },
                data: { status: 'paid' }
            })
        ])

        return ApiResponse.success({ message: `Payout of ₦${request.amount.toLocaleString()} approved for ${request.affiliate.name}` })
    } catch (error) {
        console.error('[ADMIN APPROVE PAYOUT]', error)
        return ApiResponse.error('Failed to approve payout', 500)
    }
}

// ─── Reject Payout ────────────────────────────────────────────────────────────
export async function rejectAffiliatePayout(requestId, reason = '') {
    try {
        const request = await prisma.affiliatePayoutRequest.findUnique({ where: { id: requestId } })
        if (!request) return ApiResponse.error('Payout request not found', 404)
        if (request.status !== 'pending') return ApiResponse.error('This request is no longer pending', 400)

        await prisma.affiliatePayoutRequest.update({
            where: { id: requestId },
            data: { status: 'rejected', note: reason }
        })

        return ApiResponse.success({ message: 'Payout request rejected' })
    } catch (error) {
        console.error('[ADMIN REJECT PAYOUT]', error)
        return ApiResponse.error('Failed to reject payout', 500)
    }
}

// ─── Suspend / Unsuspend Affiliate ────────────────────────────────────────────
export async function toggleAffiliateSuspension(affiliateId) {
    try {
        const affiliate = await prisma.affiliate.findUnique({ 
            where: { id: affiliateId }, 
            select: { name: true, email: true, phone: true, status: true } 
        })
        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        const newStatus = affiliate.status === 'active' ? 'suspended' : 'active'
        await prisma.affiliate.update({ where: { id: affiliateId }, data: { status: newStatus } })

        // Send notifications if affiliate is suspended
        if (newStatus === 'suspended') {
            const smsMessage = `Dear ${affiliate.name || 'Partner'}, your Go-Cycle partner account has been suspended. Please contact support at admin@gocycle.ng for more details.`
            
            // Dynamic import of sendNotificationSMS to avoid import graph complexity
            try {
                const { sendNotificationSMS } = await import('@/backend-actions/lib/sms')
                if (affiliate.phone) {
                    await sendNotificationSMS(affiliate.phone, smsMessage)
                }
            } catch (smsErr) {
                console.error('[SUSPEND SMS ERROR]', smsErr)
            }

            // Dynamic import of sendEmail
            try {
                const { sendEmail } = await import('@/backend-actions/lib/email')
                if (affiliate.email) {
                    await sendEmail({
                        to: affiliate.email,
                        subject: 'Partner Account Suspended - Go-Cycle',
                        html: `
                        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                            <div style="background:#0f172a;padding:24px;text-align:center;">
                                <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                            </div>
                            <div style="padding:28px;">
                                <h2 style="color:#0f172a;margin-top:0;">Account Status Update</h2>
                                <p style="color:#475569;line-height:1.6;">Dear ${affiliate.name || 'Partner'},</p>
                                <p style="color:#475569;line-height:1.6;">We write to inform you that your Go-Cycle Partner Affiliate account has been <strong>suspended</strong> by the administrator.</p>
                                <p style="color:#475569;line-height:1.6;">As a result, your referral links will be temporarily inactive and payouts will be paused. If you believe this is a mistake or have questions regarding the suspension, please contact us at <a href="mailto:admin@gocycle.ng" style="color:#05DF72;text-decoration:none;font-weight:bold;">admin@gocycle.ng</a>.</p>
                                <p style="color:#475569;line-height:1.6;margin-top:20px;">Regards,<br/>The Go-Cycle Support Team</p>
                            </div>
                            <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                                <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle. All rights reserved.</p>
                            </div>
                        </div>`
                    })
                }
            } catch (emailErr) {
                console.error('[SUSPEND EMAIL ERROR]', emailErr)
            }
        }

        return ApiResponse.success({ status: newStatus, message: `Affiliate ${newStatus === 'active' ? 'unsuspended' : 'suspended'}` })
    } catch (error) {
        console.error('[ADMIN TOGGLE AFFILIATE]', error)
        return ApiResponse.error('Failed to update affiliate status', 500)
    }
}

// ─── Delete Affiliate ────────────────────────────────────────────────────────
export async function deleteAffiliate(affiliateId) {
    try {
        const affiliate = await prisma.affiliate.findUnique({ where: { id: affiliateId } })
        if (!affiliate) return ApiResponse.error('Affiliate not found', 404)

        // Perform cascade delete inside transaction
        await prisma.$transaction([
            prisma.affiliateEarning.deleteMany({ where: { affiliateId } }),
            prisma.affiliatePayoutRequest.deleteMany({ where: { affiliateId } }),
            prisma.affiliate.delete({ where: { id: affiliateId } })
        ])

        return ApiResponse.success({ message: `Affiliate ${affiliate.name} has been successfully deleted.` })
    } catch (error) {
        console.error('[ADMIN DELETE AFFILIATE]', error)
        return ApiResponse.error('Failed to delete affiliate', 500)
    }
}

// ─── Admin Stats Summary ──────────────────────────────────────────────────────
export async function getAffiliateAdminStats() {
    try {
        const [totalAffiliates, activeAffiliates, totalCommissions, pendingPayouts] = await Promise.all([
            prisma.affiliate.count(),
            prisma.affiliate.count({ where: { status: 'active' } }),
            prisma.affiliateEarning.aggregate({ _sum: { commission: true } }),
            prisma.affiliatePayoutRequest.aggregate({
                where: { status: 'pending' },
                _sum: { amount: true },
                _count: true
            })
        ])

        return ApiResponse.success({
            totalAffiliates,
            activeAffiliates,
            totalCommissionsPaid: totalCommissions._sum.commission || 0,
            pendingPayoutAmount: pendingPayouts._sum.amount || 0,
            pendingPayoutCount: pendingPayouts._count || 0
        })
    } catch (error) {
        return ApiResponse.error('Failed to load stats', 500)
    }
}

// ─── Get Pending Affiliate Payout Requests ────────────────────────────────────
export async function getPendingAffiliatePayouts() {
    try {
        const payouts = await prisma.affiliatePayoutRequest.findMany({
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' },
            include: {
                affiliate: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        walletBalance: true
                    }
                }
            }
        })
        const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0)
        return ApiResponse.success({ payouts, totalAmount, count: payouts.length })
    } catch (error) {
        console.error('[ADMIN GET PENDING AFFILIATE PAYOUTS]', error)
        return ApiResponse.error('Failed to load pending affiliate payouts', 500)
    }
}

// ─── Get Released/Historical Affiliate Payouts ───────────────────────────────
export async function getReleasedAffiliatePayouts({ page = 1, limit = 30 } = {}) {
    try {
        const skip = (page - 1) * limit
        const [payouts, total] = await Promise.all([
            prisma.affiliatePayoutRequest.findMany({
                where: { status: { in: ['approved', 'rejected'] } },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    affiliate: {
                        select: {
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            }),
            prisma.affiliatePayoutRequest.count({
                where: { status: { in: ['approved', 'rejected'] } }
            })
        ])
        return ApiResponse.success({ payouts, total, page, pages: Math.ceil(total / limit) })
    } catch (error) {
        console.error('[ADMIN GET HISTORICAL AFFILIATE PAYOUTS]', error)
        return ApiResponse.error('Failed to load historical affiliate payouts', 500)
    }
}
