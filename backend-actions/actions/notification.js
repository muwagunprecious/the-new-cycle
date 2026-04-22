'use server'

import { ApiResponse } from "@/backend-actions/lib/api-response"
import { logger } from "@/backend-actions/lib/api-utils"
import prisma from "@/backend-actions/lib/prisma"

export async function createNotification(userId, title, message, type = "SYSTEM") {
    try {
        const notification = await prisma.notification.create({
            data: { userId, title, message, type }
        })
        return ApiResponse.success(notification)
    } catch (error) {
        logger.error("Create Notification Error", error)
        return ApiResponse.error("Failed to create notification")
    }
}

export async function getNotifications(userId) {
    try {
        if (userId === "seller_demo") {
            return ApiResponse.success({
                notifications: [
                    { id: "NT-S-001", title: "Welcome back!", message: "Your store dashboard is active.", type: "SYSTEM", createdAt: new Date().toISOString(), status: 'unread' },
                    { id: "NT-S-002", title: "New Order!", message: "You have a new pickup request.", type: "ORDER", createdAt: new Date().toISOString(), status: 'unread' }
                ],
                data: []
            })
        }
        if (userId === "buyer_demo") {
            return ApiResponse.success({
                notifications: [
                    { id: "NT-B-001", title: "Welcome back!", message: "Check out the latest deals in the marketplace.", type: "SYSTEM", createdAt: new Date().toISOString(), status: 'unread' },
                    { id: "NT-B-002", title: "Payment Verified", message: "Your order #ORD-B-DEMO-001 has been approved.", type: "PAYMENT", createdAt: new Date().toISOString(), status: 'unread' }
                ],
                data: []
            })
        }

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
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
