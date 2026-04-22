const prisma = require('../config/prisma');
const { logger } = require('../lib/api-utils');

/**
 * Internal service to create notifications
 */
exports.createNotification = async (userId, title, message, type = "SYSTEM") => {
    try {
        const notification = await prisma.notification.create({
            data: { userId, title, message, type }
        });
        return { success: true, data: notification };
    } catch (error) {
        logger.error("Create Notification Error", error);
        return { success: false, error: "Failed to create notification" };
    }
};

/**
 * Get notifications for a user
 */
exports.getNotifications = async (userId) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: notifications };
    } catch (error) {
        logger.error("Get Notifications Error", error);
        return { success: false, error: "Failed to fetch notifications" };
    }
};

/**
 * Mark notification as read
 */
exports.markNotificationAsRead = async (notificationId) => {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { status: 'read' }
        });
        return { success: true, message: "Notification marked as read" };
    } catch (error) {
        logger.error("Mark Read Error", error);
        return { success: false, error: "Failed to update notification" };
    }
};
