'use server'
import prisma from "@/backend/lib/prisma"


export async function getUserOrders(userId) {
    try {
        const orders = await prisma.order.findMany({
            where: { userId }, // user is the BUYER here
            include: {
                store: true,
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: orders }
    } catch (error) {
        console.error("Error fetching user orders:", error)
        return { success: false, error: "Failed to fetch orders" }
    }
}

export async function getSellerOrders(userId) {
    try {
        // Find store for this user
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return { success: true, orders: [] }
        }

        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                user: { // Buyer details
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        phone: true
                    }
                },
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, orders }

    } catch (error) {
        console.error("Get Seller Orders Error:", error)
        return { success: false, error: "Failed to fetch seller orders" }
    }
}

export async function updateOrderStatus(orderId, status) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: status,
                // If completing, maybe update payout status logic?
                // Keeping it simple for now as per minimal requirement
            }
        })

        // If pickup is verified (status changed to PICKED_UP), we might want to set pickedUpAt etc.
        // But for now, we just map the ENUM.

        return { success: true, order }
    } catch (error) {
        console.error("Update Order Status Error:", error)

        return { success: false, error: "Failed to update order status" }
    }
}

export async function verifyOrderCollection(orderId, token) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        })

        if (!order) {
            return { success: false, error: "Order not found" }
        }

        if (order.pickupToken !== token) {
            return { success: false, error: "Invalid collection token" }
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PICKED_UP',
                pickupStatus: 'COLLECTED'
            }
        })

        return { success: true, order: updatedOrder }
    } catch (error) {
        console.error("Verify Collection Error:", error)
        return { success: false, error: "Verification failed" }
    }
}
