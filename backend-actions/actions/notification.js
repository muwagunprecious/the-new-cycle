'use server'

import { ApiResponse } from "@/backend-actions/lib/api-response"
import { logger } from "@/backend-actions/lib/api-utils"
import prisma, { withRetry } from "@/backend-actions/lib/prisma"

export async function createNotification(userId, title, message, type = "SYSTEM") {
    try {
        const notification = await withRetry(() => prisma.notification.create({
            data: { userId, title, message, type }
        }))
        return ApiResponse.success(notification)
    } catch (error) {
        logger.error("Create Notification Error", error)
        return ApiResponse.error("Failed to create notification")
    }
}

export async function getNotifications(userId) {
    logger.info("Fetching notifications", { userId })
    try {
        const notifications = await withRetry(() => prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        }))
        return ApiResponse.success({ notifications, data: notifications })
    } catch (error) {
        logger.error("Get Notifications Error", error)
        return ApiResponse.error("Failed to fetch notifications")
    }
}

export async function markNotificationAsRead(notificationId) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'read' }
        })
        return ApiResponse.success(null, "Notification marked as read")
    } catch (error) {
        logger.error("Mark Read Error", error)
        return ApiResponse.error("Failed to update notification")
    }
}
