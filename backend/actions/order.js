'use server'
import prisma from "@/backend/lib/prisma"
import { createNotification } from "./notification"
import { revalidatePath } from "next/cache"

export async function createOrder(orderData) {
    try {
        const { buyerId, sellerId, productId, quantity, totalAmount, collectionDate, paymentReference } = orderData

        // Generate collection token
        const collectionToken = Math.floor(100000 + Math.random() * 900000).toString()

        // Get store of the seller
        const store = await prisma.store.findUnique({
            where: { userId: sellerId }
        })

        if (!store) {
            return { success: false, error: "Seller store not found" }
        }

        const order = await prisma.order.create({
            data: {
                total: totalAmount,
                status: 'ORDER_PLACED',
                pickupStatus: 'PENDING',
                pickupToken: collectionToken,
                userId: buyerId,
                storeId: store.id,
                isPaid: true,
                paymentMethod: 'STRIPE', // Mocked as Stripe
                addressId: "temp_address_id", // Placeholder as address selection is mock
                orderItems: {
                    create: [
                        {
                            productId: productId,
                            quantity: quantity,
                            price: totalAmount / quantity
                        }
                    ]
                }
            },
            include: {
                user: true,
                store: true
            }
        })

        // Notify Seller
        await createNotification(
            sellerId,
            "New Order Received!",
            `You have a new order for ${quantity} battery(s). Total: ₦${totalAmount.toLocaleString()}`,
            "ORDER"
        )

        // Notify Admin
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        })

        for (const admin of admins) {
            await createNotification(
                admin.id,
                "New Platform Sale",
                `A new order has been placed on the platform. Total: ₦${totalAmount.toLocaleString()}`,
                "ORDER"
            )
        }

        revalidatePath('/buyer/orders')
        revalidatePath('/seller/orders')
        revalidatePath('/admin/orders')
        revalidatePath('/admin')
        revalidatePath('/seller')
        revalidatePath('/notifications')

        return { success: true, order, collectionToken }
    } catch (error) {
        console.error("Create Order Error:", error)
        return { success: false, error: "Failed to create order" }
    }
}

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

const order = await prisma.order.update({
    where: { id: orderId },
    data: {
        status: status,
    }
})

revalidatePath('/seller/orders')
revalidatePath('/admin/orders')
revalidatePath('/buyer/orders')
revalidatePath('/admin')
revalidatePath('/seller')
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

        revalidatePath('/seller/orders')
        revalidatePath('/admin/orders')
        revalidatePath('/buyer/orders')
        revalidatePath('/admin')
        revalidatePath('/seller')
        return { success: true, order: updatedOrder }
    } catch (error) {
        console.error("Verify Collection Error:", error)
        return { success: false, error: "Verification failed" }
    }
}

export async function getAllOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
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
        console.error("Get All Orders Error:", error)
        return { success: false, error: "Failed to fetch all orders" }
    }
}

