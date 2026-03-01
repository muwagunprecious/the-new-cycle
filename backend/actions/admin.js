'use server'

import { ApiResponse } from "@/backend/lib/api-response"
import { logger } from "@/backend/lib/api-utils"
import { sendEmail, sellerWalletCreditEmail } from "@/backend/lib/email"
import { revalidatePath } from "next/cache"
import prisma from "@/backend/lib/prisma"

export async function getPendingSellers() {
    try {
        const stores = await prisma.store.findMany({
            where: { status: 'pending' },
            include: { user: true }
        })
        return ApiResponse.success({ stores, data: stores })
    } catch (error) {
        logger.error("Get Pending Sellers Error", error)
        return ApiResponse.error("Failed to fetch pending sellers")
    }
}

export async function approveSeller(storeId) {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        await prisma.$transaction([
            prisma.store.update({
                where: { id: storeId },
                data: { status: 'approved', isActive: true, isVerified: true }
            }),
            prisma.user.update({
                where: { id: store.userId },
                data: { role: 'SELLER' }
            })
        ])

        const { createNotification } = await import('./notification')
        await createNotification(
            store.userId,
            "Store Approved! 🎉",
            "Congratulations! Your store application has been approved. You can now start listing products.",
            "SYSTEM"
        )

        revalidatePath('/admin/approve')
        revalidatePath('/')
        revalidatePath('/shop')
        return ApiResponse.success(null, "Seller approved successfully")
    } catch (error) {
        logger.error("Approve Seller Error", error)
        return ApiResponse.error("Failed to approve seller")
    }
}

export async function rejectSeller(storeId, reason) {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        await prisma.store.update({
            where: { id: storeId },
            data: {
                status: 'rejected',
                isActive: false,
                rejectionReason: reason || "Your store application did not meet our requirements."
            }
        })

        const { createNotification } = await import('./notification')
        await createNotification(
            store.userId,
            "Store Application Rejected",
            `We're sorry, but your store application was not approved. Reason: ${reason || "Please contact support."}`,
            "SYSTEM"
        )

        revalidatePath('/admin/approve')
        revalidatePath('/')
        return ApiResponse.success(null, "Seller application rejected")
    } catch (error) {
        logger.error("Reject Seller Error", error)
        return ApiResponse.error("Failed to reject seller")
    }
}

export async function getVerifiedSellers() {
    try {
        const stores = await prisma.store.findMany({
            where: { status: 'approved', isActive: true },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        })
        return ApiResponse.success({ stores, data: stores })
    } catch (error) {
        logger.error("Get Verified Sellers Error", error)
        return ApiResponse.error("Failed to fetch verified sellers")
    }
}

export async function updateSellerWallet(storeId, amount, type = 'CREDIT') {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store) return ApiResponse.error("Store not found", 404)

        const currentBalance = store.walletBalance || 0
        const newBalance = type === 'CREDIT' ? currentBalance + amount : currentBalance - amount

        if (newBalance < 0) return ApiResponse.error("Insufficient wallet balance", 400)

        await prisma.store.update({
            where: { id: storeId },
            data: { walletBalance: newBalance }
        })

        const { createNotification } = await import('./notification')
        await createNotification(
            store.userId,
            "Wallet Balance Updated",
            `Your seller wallet has been ${type === 'CREDIT' ? 'credited' : 'debited'} with ₦${amount.toLocaleString()}. New balance: ₦${newBalance.toLocaleString()}`,
            "PAYMENT"
        )

        revalidatePath('/admin/sellers')
        revalidatePath('/seller')
        return ApiResponse.success({ newBalance }, "Wallet updated successfully")
    } catch (error) {
        logger.error("Update Seller Wallet Error", error)
        return ApiResponse.error("Failed to update wallet balance")
    }
}

export async function getAllUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        })
        return ApiResponse.success({ users, data: users })
    } catch (error) {
        logger.error("Get All Users Error", error)
        return ApiResponse.error("Failed to fetch users")
    }
}

export async function banUser(userId, isBanned) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: isBanned ? 'banned' : 'active' }
        })
        revalidatePath('/admin/users')
        return ApiResponse.success(null, `User ${isBanned ? 'banned' : 'unbanned'} successfully`)
    } catch (error) {
        logger.error("Ban User Error", error)
        return ApiResponse.error("Failed to update user status")
    }
}

export async function releasePayout(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        })

        if (!order) return ApiResponse.error("Order not found", 404)
        if (order.payoutStatus === 'released') return ApiResponse.error("Payout already released", 400)

        const commission = order.total * 0.05
        const netPayout = order.total - commission

        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { payoutStatus: 'released' }
            }),
            prisma.store.update({
                where: { id: order.storeId },
                data: { walletBalance: { increment: netPayout } }
            })
        ])

        // Credit commission to Admin
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) {
            await prisma.user.update({
                where: { id: admin.id },
                data: { walletBalance: { increment: commission } }
            })
        }

        const { createNotification } = await import('./notification')
        await createNotification(
            order.store.userId,
            "Payout Approved! 💰",
            `Your payout of ₦${netPayout.toLocaleString()} (after 5% platform fee) for order ${orderId.slice(-6)} has been approved.`,
            "PAYMENT"
        )

        revalidatePath('/admin')
        revalidatePath('/admin/orders')
        revalidatePath('/seller')

        // Send wallet credit email to seller
        if (order.store?.user?.email) {
            // Fetch updated store balance
            const updatedStore = await prisma.store.findUnique({ where: { id: order.storeId } })
            const emailTemplate = sellerWalletCreditEmail({
                sellerName: order.store.user.name,
                amount: netPayout,
                newBalance: updatedStore?.walletBalance || netPayout,
                orderId,
                creditType: 'PAYOUT'
            })
            sendEmail({ to: order.store.user.email, ...emailTemplate }).catch(err =>
                logger.warn("Seller credit email failed", err)
            )
        }

        return ApiResponse.success({ netPayout }, "Payout released successfully")
    } catch (error) {
        logger.error("Release Payout Error", error)
        return ApiResponse.error("Failed to release payout")
    }
}

export async function getPendingBuyers() {
    try {
        const buyers = await prisma.user.findMany({
            where: { role: 'USER', accountStatus: 'pending' },
            orderBy: { name: 'asc' }
        })
        return ApiResponse.success({ buyers, data: buyers })
    } catch (error) {
        logger.error("Get Pending Buyers Error", error)
        return ApiResponse.error("Failed to fetch pending buyers")
    }
}

export async function approveBuyer(userId) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: 'approved', verifiedAt: new Date() }
        })

        const { createNotification } = await import('./notification')
        await createNotification(
            userId,
            "Account Verified! 🎉",
            "Your buyer account has been verified. You can now place orders on the platform.",
            "SYSTEM"
        )

        revalidatePath('/admin/verify-buyers')
        revalidatePath('/buyer')
        return ApiResponse.success(null, "Buyer verified successfully")
    } catch (error) {
        logger.error("Approve Buyer Error", error)
        return ApiResponse.error("Failed to approve buyer")
    }
}

export async function rejectBuyer(userId, reason) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                accountStatus: 'rejected',
                verificationNotes: reason || "Your verification documents did not meet our requirements."
            }
        })

        const { createNotification } = await import('./notification')
        await createNotification(
            userId,
            "Account Verification Not Approved",
            `We're sorry, but your account verification was not approved. Reason: ${reason || "Please contact support."}`,
            "SYSTEM"
        )

        revalidatePath('/admin/verify-buyers')
        return ApiResponse.success(null, "Buyer application rejected")
    } catch (error) {
        logger.error("Reject Buyer Error", error)
        return ApiResponse.error("Failed to reject buyer")
    }
}

/**
 * Send notification to one or more users.
 * @param {Object} options
 * @param {'specific' | 'all' | 'buyers' | 'sellers'} options.target - Who to notify
 * @param {string} [options.userId] - Required if target is 'specific'
 * @param {string} options.title
 * @param {string} options.message
 * @param {'SYSTEM'|'ORDER'|'PAYMENT'|'PROMO'} [options.type] - Notification type
 * @param {boolean} [options.sendEmail] - Whether to also send an email
 */
export async function sendAdminNotification({ target, userId, title, message, type = 'SYSTEM', sendEmail: withEmail = false }) {
    try {
        if (!title?.trim() || !message?.trim()) {
            return ApiResponse.error("Title and message are required", 400)
        }

        const { createNotification } = await import('./notification')

        let recipients = []

        if (target === 'specific') {
            if (!userId) return ApiResponse.error("User ID is required for specific target", 400)
            const user = await prisma.user.findUnique({ where: { id: userId } })
            if (!user) return ApiResponse.error("User not found", 404)
            recipients = [user]
        } else if (target === 'all') {
            recipients = await prisma.user.findMany({ where: { role: { not: 'ADMIN' } } })
        } else if (target === 'buyers') {
            recipients = await prisma.user.findMany({ where: { role: 'USER' } })
        } else if (target === 'sellers') {
            recipients = await prisma.user.findMany({ where: { role: 'SELLER' } })
        } else {
            return ApiResponse.error("Invalid target", 400)
        }

        if (recipients.length === 0) {
            return ApiResponse.error("No recipients found for the selected target", 404)
        }

        // Send in-app notifications
        await Promise.all(recipients.map(user =>
            createNotification(user.id, title, message, type)
        ))

        // Optionally send email
        if (withEmail) {
            const { sendEmail: mailer } = await import('@/backend/lib/email')
            const emailRecipients = recipients.filter(u => u.email)
            await Promise.all(emailRecipients.map(user =>
                mailer({
                    to: user.email,
                    subject: `[Go-Cycle] ${title}`,
                    html: `
                    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                        <div style="background:#0f172a;padding:24px;text-align:center;">
                            <h1 style="color:#05DF72;margin:0;font-size:22px;">Go-Cycle</h1>
                        </div>
                        <div style="padding:28px;">
                            <h2 style="color:#0f172a;margin-top:0;">${title}</h2>
                            <p style="color:#475569;white-space:pre-line;">${message}</p>
                        </div>
                        <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                            <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} Go-Cycle Nigeria.</p>
                        </div>
                    </div>`
                }).catch(err => logger.warn(`Email failed for ${user.email}`, err))
            ))
        }

        logger.info(`Admin notification sent to ${recipients.length} user(s)`, { target, title })
        return ApiResponse.success(
            { count: recipients.length },
            `Notification sent to ${recipients.length} user${recipients.length !== 1 ? 's' : ''}`
        )
    } catch (error) {
        logger.error("Send Admin Notification Error", error)
        return ApiResponse.error("Failed to send notification")
    }
}
