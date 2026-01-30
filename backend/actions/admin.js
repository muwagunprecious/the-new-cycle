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
        await prisma.order.update({
            where: { id: orderId },
            data: { payoutStatus: 'released' }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error("Release Payout Error:", error)
        return { success: false, error: "Failed to release payout" }
    }
}

