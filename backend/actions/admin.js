'use server'

import prisma from "@/backend/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPendingSellers() {
    try {
        const stores = await prisma.store.findMany({
            where: {
                status: 'pending'
            },
            include: {
                user: true
            }
        })
        return { success: true, data: stores }
    } catch (error) {
        console.error("Error fetching pending sellers:", error)
        return { success: false, error: "Failed to fetch pending sellers" }
    }
}

export async function approveSeller(storeId) {
    try {
        await prisma.store.update({
            where: { id: storeId },
            data: {
                status: 'approved',
                isActive: true,
                isVerified: true
            }
        })

        // Optionally upgrade user role to SELLER if not already
        // This depends on if store.userId is valid and we want to sync roles.
        // Let's fetch store first to get userId or assume relation usage.

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (store && store.userId) {
            await prisma.user.update({
                where: { id: store.userId },
                data: { role: 'SELLER' }
            })
        }

        revalidatePath('/admin/approve')
        revalidatePath('/')
        revalidatePath('/shop')
        return { success: true }
    } catch (error) {
        console.error("Error approving seller:", error)
        return { success: false, error: "Failed to approve seller" }
    }
}

export async function rejectSeller(storeId) {
    try {
        await prisma.store.update({
            where: { id: storeId },
            data: {
                status: 'rejected',
                isActive: false
            }
        })
        revalidatePath('/admin/approve')
        revalidatePath('/')
        revalidatePath('/shop')
        return { success: true }
    } catch (error) {
        console.error("Error rejecting seller:", error)
        return { success: false, error: "Failed to reject seller" }
    }
}

export async function getAllUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        })
        return { success: true, data: users }
    } catch (error) {
        console.error("Get All Users Error:", error)
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function banUser(userId, isBanned) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: isBanned ? 'banned' : 'active' }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Ban User Error:", error)
        return { success: false, error: "Failed to update user status" }
    }
}

export async function releasePayout(orderId) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        })

        if (!order) {
            return { success: false, error: "Order not found" }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { payoutStatus: 'released' }
        })

        // Notify vendor about payout approval
        const { createNotification } = await import('./notification')
        await createNotification(
            order.store.userId,
            "Payout Approved!",
            `Your payout of ₦${order.total.toLocaleString()} for order ${orderId} has been approved and will be credited to ${order.store.accountNumber || 'your account'}.`,
            "PAYMENT"
        )

        revalidatePath('/admin')
        revalidatePath('/admin/orders')
        revalidatePath('/seller')
        revalidatePath('/notifications')
        return { success: true }
    } catch (error) {
        console.error("Release Payout Error:", error)
        return { success: false, error: "Failed to release payout" }
    }
}

export async function getPendingBuyers() {
    try {
        const buyers = await prisma.user.findMany({
            where: {
                role: 'USER',
                accountStatus: 'pending'
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: buyers }
    } catch (error) {
        console.error("Get Pending Buyers Error:", error)
        return { success: false, error: "Failed to fetch pending buyers" }
    }
}

export async function approveBuyer(userId) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                accountStatus: 'approved',
                verifiedAt: new Date()
            }
        })

        // Send notification to buyer
        const { createNotification } = await import('./notification')
        await createNotification(
            userId,
            "Account Verified! 🎉",
            "Your buyer account has been verified by our admin team. You can now place orders and enjoy all platform features!",
            "SYSTEM"
        )

        revalidatePath('/admin/verify-buyers')
        revalidatePath('/buyer')
        return { success: true }
    } catch (error) {
        console.error("Approve Buyer Error:", error)
        return { success: false, error: "Failed to approve buyer" }
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

        // Send notification to buyer
        const { createNotification } = await import('./notification')
        await createNotification(
            userId,
            "Account Verification Not Approved",
            `We're sorry, but your account verification was not approved. Reason: ${reason || "Please contact support for more information."}`,
            "SYSTEM"
        )

        revalidatePath('/admin/verify-buyers')
        return { success: true }
    } catch (error) {
        console.error("Reject Buyer Error:", error)
        return { success: false, error: "Failed to reject buyer" }
    }
}

