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
        let store;
        if (sellerId) {
            store = await prisma.store.findUnique({
                where: { userId: sellerId }
            })
        } else {
            // Find store via product
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: { store: true }
            })
            store = product?.store
        }

        if (!store) {
            return { success: false, error: "Seller store not found. Please ensure the product is listed by a valid seller." }
        }

        // Verify Buyer Status
        const buyer = await prisma.user.findUnique({
            where: { id: buyerId }
        })

        if (!buyer) {
            return { success: false, error: "Buyer account not found." }
        }

        if (buyer.role === 'USER' && buyer.accountStatus !== 'approved') {
            return { success: false, error: "Your account is pending verification. You cannot place orders until approved by admin." }
        }

        const order = await prisma.order.create({
            data: {
                total: totalAmount,
                status: 'ORDER_PLACED',
                collectionStatus: 'PENDING',
                collectionToken: collectionToken,
                collectionDate: collectionDate,
                userId: buyerId,
                storeId: store.id,
                isPaid: true,
                paymentMethod: 'STRIPE', // Mocked as Stripe
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
            sellerId || store.userId,
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

        return { success: true, order }
    } catch (error) {
        console.error("Create Order Error:", error)
        return { success: false, error: "Failed to create order: " + error.message }
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

        // Sanitize orders to remove collectionToken before sending to buyer
        const sanitizedOrders = orders.map(order => {
            const { collectionToken, ...safeOrder } = order
            return safeOrder
        })

        return { success: true, data: sanitizedOrders }
    } catch (error) {
        console.error("Error fetching user orders:", error)
        return { success: false, error: "Failed to fetch orders" }
    }
}

export async function getSellerOrders(userId) {
    try {
        if (!userId) {
            return { success: true, orders: [] }
        }

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

        if (order.collectionToken !== token) {
            return { success: false, error: "Invalid collection token" }
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PICKED_UP',
                collectionStatus: 'COLLECTED',
                payoutStatus: 'pending' // Changed from 'released' to require admin approval
            }
        })

        // Notify Admin of successful collection and payout
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        })

        for (const admin of admins) {
            await createNotification(
                admin.id,
                "Order Collected - Payout Pending",
                `Order ${orderId} has been successfully collected. Please review and approve payout of ₦${order.total.toLocaleString()} to vendor.`,
                "PAYMENT"
            )
        }

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

export async function requestReschedule(orderId, newDate) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                collectionStatus: 'RESCHEDULE_REQUESTED',
                proposedDate: newDate
            },
            include: { store: true }
        })

        // Notify Buyer
        await createNotification(
            order.userId,
            "Reschedule Requested",
            `Vendor at ${order.store.name} has requested to reschedule your pickup to ${newDate}. Please review and accept or propose another date.`,
            "ORDER"
        )

        revalidatePath('/seller/orders')
        revalidatePath('/buyer/orders')
        revalidatePath('/seller')
        revalidatePath('/buyer')

        return { success: true, order }
    } catch (error) {
        console.error("Request Reschedule Error:", error)
        return { success: false, error: "Failed to request reschedule" }
    }
}

export async function respondToReschedule(orderId, action, alternateDate = null) {
    try {
        let updateData = {}
        let notificationTitle = ""
        let notificationMessage = ""

        if (action === 'ACCEPT') {
            const order = await prisma.order.findUnique({ where: { id: orderId } })
            updateData = {
                collectionDate: order.proposedDate,
                collectionStatus: 'PENDING',
                proposedDate: null
            }
            notificationTitle = "Reschedule Accepted"
            notificationMessage = `The buyer has accepted the rescheduled date of ${order.proposedDate}.`
        } else if (action === 'RESCHEDULE') {
            updateData = {
                proposedDate: alternateDate,
                collectionStatus: 'RESCHEDULE_REQUESTED'
            }
            notificationTitle = "Buyer Proposed New Date"
            notificationMessage = `The buyer has proposed a different date: ${alternateDate}.`
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                user: true,
                store: true
            }
        })

        // Notify Seller
        await createNotification(
            updatedOrder.store.userId,
            notificationTitle,
            notificationMessage,
            "ORDER"
        )

        revalidatePath('/seller/orders')
        revalidatePath('/buyer/orders')
        revalidatePath('/seller')
        revalidatePath('/buyer')

        return { success: true, order: updatedOrder }
    } catch (error) {
        console.error("Respond to Reschedule Error:", error)
        return { success: false, error: "Failed to respond to reschedule" }
    }
}

