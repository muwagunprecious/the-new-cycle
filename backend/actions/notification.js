'use server'

import prisma from "@/backend/lib/prisma"

export async function createNotification(userId, title, message, type = "SYSTEM") {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        })
        return { success: true, data: notification }
    } catch (error) {
        console.error("Error creating notification:", error)
        return { success: false, error: "Failed to create notification" }
    }
}

export async function getNotifications(userId) {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: notifications }
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

export async function markNotificationAsRead(notificationId) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'read' }
        })
        return { success: true }
    } catch (error) {
        console.error("Error marking notification as read:", error)
        return { success: false, error: "Failed to mark notification as read" }
    }
}
