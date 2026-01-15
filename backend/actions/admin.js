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
                isActive: true
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
        return { success: true }
    } catch (error) {
        console.error("Error rejecting seller:", error)
        return { success: false, error: "Failed to reject seller" }
    }
}
