'use server'

import { ApiResponse } from "@/backend/lib/api-response"
import { logger } from "@/backend/lib/api-utils"
import { sendEmail, orderConfirmationEmail, buyerReceiptEmail } from "@/backend/lib/email"
import { createNotification } from "./notification"
import { revalidatePath } from "next/cache"
import prisma from "@/backend/lib/prisma"

export async function createOrder(orderData) {
    try {
        const { buyerId, sellerId, productId, quantity, totalAmount, collectionDate } = orderData

        if (!buyerId || !productId || quantity <= 0) {
            return ApiResponse.error("Invalid order data", 400)
        }

        const collectionToken = Math.floor(100000 + Math.random() * 900000).toString()

        let store;
        if (sellerId) {
            store = await prisma.store.findUnique({ where: { userId: sellerId } })
        } else {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: { store: true }
            })
            store = product?.store
        }

        if (!store) return ApiResponse.error("Seller store not found", 404)

        const buyer = await prisma.user.findUnique({ where: { id: buyerId } })
        if (!buyer) return ApiResponse.error("Buyer account not found", 404)

        if (buyer.role === 'USER' && buyer.accountStatus !== 'approved') {
            return ApiResponse.error("Your account is pending verification. Orders are restricted.", 403)
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
                paymentMethod: 'STRIPE',
                orderItems: {
                    create: [{
                        productId: productId,
                        quantity: quantity,
                        price: totalAmount / quantity
                    }]
                }
            },
            include: { user: true, store: true }
        })

        // Notify Stakeholders
        await createNotification(
            store.userId,
            "New Order Received!",
            `You have a new order for ${quantity} unit(s). Total: ₦${totalAmount.toLocaleString()}`,
            "ORDER"
        )

        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
        for (const admin of admins) {
            await createNotification(
                admin.id,
                "New Platform Sale",
                `Order #${order.id.slice(-6)} placed. Total: ₦${totalAmount.toLocaleString()}`,
                "ORDER"
            )
        }

        revalidatePath('/buyer/orders')
        revalidatePath('/seller/orders')
        revalidatePath('/admin/orders')

        // Send confirmation email to buyer
        if (buyer.email) {
            const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
            const emailTemplate = orderConfirmationEmail({
                buyerName: buyer.name,
                orderId: order.id,
                productName: product?.name || 'Battery',
                amount: totalAmount,
                collectionDate: collectionDate ? new Date(collectionDate).toLocaleDateString('en-NG', { dateStyle: 'long' }) : 'TBD',
                token: collectionToken
            })
            sendEmail({ to: buyer.email, ...emailTemplate }).catch(err =>
                logger.warn("Order confirmation email failed", err)
            )
        }

        return ApiResponse.success(order, "Order placed successfully")
    } catch (error) {
        logger.error("Create Order Error", error)
        return ApiResponse.error(`Order creation failed: ${error.message}`)
    }
}

export async function getUserOrders(userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                store: true,
                orderItems: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Sanitize sensitive tokens
        const sanitizedOrders = orders.map(({ collectionToken, ...safeOrder }) => safeOrder)
        return ApiResponse.success({ orders: sanitizedOrders, data: sanitizedOrders })
    } catch (error) {
        logger.error("Get User Orders Error", error)
        return ApiResponse.error("Failed to fetch order history")
    }
}

export async function getSellerOrders(userId) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.success({ orders: [], data: [] })

        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                user: { select: { id: true, name: true, email: true, image: true, phone: true } },
                orderItems: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return ApiResponse.success({ orders: orders, data: orders })
    } catch (error) {
        logger.error("Get Seller Orders Error", error)
        return ApiResponse.error("Failed to fetch seller orders")
    }
}

export async function updateOrderStatus(orderId, status) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        })

        revalidatePath('/seller/orders')
        revalidatePath('/admin/orders')
        revalidatePath('/buyer/orders')

        return ApiResponse.success(order, "Order status updated")
    } catch (error) {
        logger.error("Update Order Status Error", error)
        return ApiResponse.error("Failed to update status")
    }
}

export async function verifyOrderCollection(orderId, token) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                store: true,
                orderItems: { include: { product: true } }
            }
        })
        if (!order) return ApiResponse.error("Order not found", 404)
        if (order.collectionToken !== token) return ApiResponse.error("Invalid collection token", 400)

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PICKED_UP',
                collectionStatus: 'COLLECTED',
                payoutStatus: 'pending'
            }
        })

        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
        for (const admin of admins) {
            await createNotification(
                admin.id,
                "Order Collected - Payout Pending",
                `Order ${orderId.slice(-6)} collected. Review payout of ₦${order.total.toLocaleString()} to vendor.`,
                "PAYMENT"
            )
        }

        revalidatePath('/seller/orders')
        revalidatePath('/admin/orders')
        revalidatePath('/buyer/orders')

        // Send receipt email to buyer
        if (order.user?.email) {
            const firstItem = order.orderItems?.[0]
            const emailTemplate = buyerReceiptEmail({
                buyerName: order.user.name,
                orderId: order.id,
                productName: firstItem?.product?.name || 'Battery',
                quantity: firstItem?.quantity || 1,
                unitPrice: firstItem?.price || order.total,
                totalAmount: order.total,
                collectionDate: new Date().toLocaleDateString('en-NG', { dateStyle: 'long' }),
                storeName: order.store?.name || 'Seller'
            })
            sendEmail({ to: order.user.email, ...emailTemplate }).catch(err =>
                logger.warn("Buyer receipt email failed", err)
            )
        }

        return ApiResponse.success(updatedOrder, "Collection verified successfully")
    } catch (error) {
        logger.error("Verify Collection Error", error)
        return ApiResponse.error("Verification failed")
    }
}

export async function getAllOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                store: true,
                orderItems: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return ApiResponse.success({ orders: orders, data: orders })
    } catch (error) {
        logger.error("Get All Orders Error", error)
        return ApiResponse.error("Failed to fetch platform orders")
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

        await createNotification(
            order.userId,
            "Reschedule Requested",
            `Vendor at ${order.store.name} proposed a new pickup date: ${newDate}.`,
            "ORDER"
        )

        revalidatePath('/seller/orders')
        revalidatePath('/buyer/orders')

        return ApiResponse.success(order, "Reschedule request sent")
    } catch (error) {
        logger.error("Reschedule Request Error", error)
        return ApiResponse.error("Failed to request reschedule")
    }
}

export async function respondToReschedule(orderId, action, alternateDate = null) {
    try {
        let updateData = {}
        let notifyTitle = ""
        let notifyMsg = ""

        if (action === 'ACCEPT') {
            const order = await prisma.order.findUnique({ where: { id: orderId } })
            updateData = {
                collectionDate: order.proposedDate,
                collectionStatus: 'PENDING',
                proposedDate: null
            }
            notifyTitle = "Reschedule Accepted"
            notifyMsg = `The buyer accepted the rescheduled date: ${order.proposedDate}.`
        } else if (action === 'RESCHEDULE') {
            updateData = {
                proposedDate: alternateDate,
                collectionStatus: 'RESCHEDULE_REQUESTED'
            }
            notifyTitle = "Buyer Counter-Proposal"
            notifyMsg = `The buyer proposed an alternative date: ${alternateDate}.`
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: { store: true }
        })

        await createNotification(
            updatedOrder.store.userId,
            notifyTitle,
            notifyMsg,
            "ORDER"
        )

        revalidatePath('/seller/orders')
        revalidatePath('/buyer/orders')

        return ApiResponse.success(updatedOrder, "Reschedule response processed")
    } catch (error) {
        logger.error("Reschedule Response Error", error)
        return ApiResponse.error("Failed to process reschedule response")
    }
}
