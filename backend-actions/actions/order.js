'use server'
// Force rebuild 1

import { ApiResponse } from "@/backend-actions/lib/api-response"
import { logger, generateTransactionId, generateOrderId } from "@/backend-actions/lib/api-utils"
import { sendEmail, orderConfirmationEmail, buyerReceiptEmail, sellerNewOrderEmail } from "@/backend-actions/lib/email"
import { createNotification } from "./notification"
import { generatePaymentRef } from "@/backend-actions/lib/flutterwave"
import { revalidatePath, revalidateTag } from "next/cache"
import prisma from "@/backend-actions/lib/prisma"

export async function createOrder(orderData) {
    try {
        const { buyerId, sellerId, productId, quantity, totalAmount, collectionDate, subtotal, buyerFee, paymentSenderName, paymentMethod = 'MANUAL_TRANSFER' } = orderData

        logger.info("Creating order", { buyerId, productId, quantity, totalAmount })
        if (!buyerId || !productId || quantity <= 0) {
            return ApiResponse.error("Invalid order data", 400)
        }

        const collectionToken = Math.floor(100000 + Math.random() * 900000).toString()

        // Fetch product with store info and validate
        const product = await prisma.product.findUnique({ 
            where: { id: productId },
            include: { store: true }
        })
        
        if (!product) {
            return ApiResponse.error("Product not found", 404)
        }
        
        if (product.status !== 'approved') {
            return ApiResponse.error("Product is not available for purchase", 400)
        }
        
        if (product.quantity < quantity) {
            return ApiResponse.error(`Insufficient quantity. Only ${product.quantity} available.`, 400)
        }

        const [store, buyer] = await Promise.all([
            sellerId 
                ? prisma.store.findUnique({ where: { userId: sellerId } })
                : Promise.resolve(product.store),
            prisma.user.findUnique({ where: { id: buyerId } })
        ])

        if (!store) return ApiResponse.error("Seller store not found", 404)
        if (!buyer) return ApiResponse.error("Buyer account not found", 404)

        if (buyer.role === 'USER' && buyer.accountStatus !== 'approved') {
            return ApiResponse.error("Your account is pending verification. Orders are restricted.", 403)
        }

        if (buyer.role === 'ADMIN' || buyer.role === 'SUPER_ADMIN') {
            return ApiResponse.error("Administrators are not permitted to make purchases.", 403)
        }

        // Calculate seller fee and net payout
        const sellerFee = Math.round(subtotal * 0.05)
        const payoutAmount = subtotal - sellerFee
        const paymentReference = paymentMethod === 'FLUTTERWAVE' ? generatePaymentRef() : null
        const orderId = generateOrderId()
        const transactionId = orderId
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

        let order;
        try {
            // Parallelize Order creation and Product update
            const [newOrder] = await Promise.all([
                prisma.order.create({
                    data: {
                        id: orderId,
                        transactionId,
                        total: totalAmount,
                        subtotal,
                        buyerFee,
                        sellerFee,
                        payoutAmount,
                        status: 'ORDER_PLACED',
                        collectionStatus: 'PENDING',
                        collectionToken,
                        collectionDate,
                        userId: buyerId,
                        storeId: store.id,
                        isPaid: false,
                        paymentMethod,
                        paymentSenderName: paymentSenderName || null,
                        paymentReference,
                        paymentStatus: paymentMethod === 'FLUTTERWAVE' ? 'awaiting_gateway' : 'pending',
                        verificationCode,
                        verificationStatus: 'PENDING',
                        orderItems: {
                            create: [{
                                productId,
                                quantity,
                                price: subtotal / quantity
                            }]
                        }
                    },
                    include: { user: true, store: true }
                }),
                prisma.product.update({ 
                    where: { id: productId }, 
                    data: { 
                        quantity: { decrement: quantity },
                        status: product.quantity - quantity === 0 ? 'sold' : 'approved'
                    } 
                })
            ])
            order = newOrder;
        } catch (dbError) {
            logger.error("DB Error during order creation", dbError);
            throw dbError;
        }

        // 1. Fetch common data for notifications/emails
        const productInfo = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } });
        const productName = productInfo?.name || "Battery Product";
        const sellerUser = await prisma.user.findUnique({ where: { id: store.userId } });

        // 2. In-app notifications — include rich data for the popup
        try {
            const sellerMsg = `BUYER:${buyer.name}|PHONE:${buyer.phone || 'N/A'}|AMOUNT:${totalAmount}|CODE:${verificationCode}|DATE:${collectionDate || 'TBD'}|ORDER:${transactionId}|QTY:${quantity}|PROD:${productName}`;
            await createNotification(store.userId, "New Purchase Request", sellerMsg, "ORDER");
            
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
            await Promise.all(admins.map(admin => createNotification(admin.id, "New Platform Sale", `Order #${transactionId} placed. Total: ₦${totalAmount.toLocaleString()}`, "ORDER")));
        } catch (e) { 
            logger.warn("Order notifications failed", e); 
        }

        // 3. Emails — buyer always gets confirmation; seller always gets alert
        try {
            // Buyer email
            if (buyer.email) {
                if (paymentMethod === 'MANUAL_TRANSFER') {
                    await sendEmail({
                        to: buyer.email,
                        subject: "[Go-Cycle] Order Received - Payment Verification Pending",
                        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;"><h1 style="color:#05DF72;font-size:22px;">Order Received</h1><p>Hello ${buyer.name},</p><p>We have received your order. Transaction ID: <b>${transactionId}</b>. Our team will verify your bank transfer within 24-48 hours.</p></div>`
                    });
                } else {
                    const emailTemplate = orderConfirmationEmail({ 
                        buyerName: buyer.name, 
                        orderId: transactionId, 
                        productName: productName, 
                        amount: totalAmount, 
                        collectionDate: collectionDate || 'TBD', 
                        token: collectionToken,
                        sellerName: sellerUser?.name,
                        sellerPhone: sellerUser?.phone,
                        sellerAddress: store.address
                    });
                    await sendEmail({ to: buyer.email, ...emailTemplate });
                }
            }

            // Seller email
            if (sellerUser?.email) {
                const sellerEmailTemplate = sellerNewOrderEmail({ sellerName: sellerUser.name, orderId: transactionId, productName: "Battery", amount: totalAmount, quantity, collectionDate: collectionDate || 'TBD', token: collectionToken, buyerName: buyer.name });
                await sendEmail({ to: sellerUser.email, ...sellerEmailTemplate });
            }
        } catch (e) {
            logger.warn("Order emails failed", e);
        }

        revalidatePath('/buyer')
        revalidatePath('/buyer/orders')
        revalidatePath('/seller/orders'); revalidateTag(`seller-stats-${order.store.userId}`); revalidateTag(`buyer-stats-${order.userId}`)
        revalidatePath('/admin/orders')
        
        return ApiResponse.success({ ...order, paymentReference, collectionToken }, "Order placed successfully")

    } catch (error) {
        logger.error("Create Order Error", error)
        return ApiResponse.error(`Order creation failed: ${error.message}`)
    }
}

export async function getUserOrders(userId) {
    try {
        if (!userId) {
            logger.warn("getUserOrders called without userId")
            return ApiResponse.unauthorized()
        }

        // Read orders for the user
        const orders = await prisma.order.findMany({
            where: {
                userId,
                isPaid: true,
                status: {
                    in: ['PAID', 'APPROVED', 'PROCESSING', 'SHIPPED', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'ORDER_PLACED']
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                store: {
                    include: {
                        user: {
                            select: {
                                phone: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        logger.info(`Found ${orders.length} orders for user ${userId}`)

        // Sanitize sensitive tokens
        const sanitizedOrders = orders.map(({ collectionToken, ...safeOrder }) => safeOrder)
        return ApiResponse.success({ orders: sanitizedOrders, data: sanitizedOrders })
    } catch (error) {
        logger.error("Get User Orders Error", error)
        return ApiResponse.error("Failed to fetch order history")
    }
}

export async function getSellerOrders(userId, page = 1, limit = 50) {
    try {
        if (!userId) return ApiResponse.unauthorized()

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return ApiResponse.success({ orders: [], data: [], pagination: { page, totalPages: 0, totalCount: 0 } })

        const skip = (page - 1) * limit

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: { storeId: store.id },
                include: {
                    user: { select: { id: true, name: true, email: true, image: true, phone: true } },
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    category: true,
                                    type: true,
                                    brand: true
                                    // EXCLUDE heavy images field
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.order.count({ where: { storeId: store.id } })
        ])

        return ApiResponse.success({
            orders: orders,
            data: orders,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        })
    } catch (error) {
        logger.error("Get Seller Orders Error", error)
        return ApiResponse.error("Failed to fetch seller orders")
    }
}

export async function updateOrderStatus(orderId, status) {
    try {
        // Validate status against allowed enum values
        const validStatuses = ['ORDER_PLACED', 'PAID', 'APPROVED', 'PROCESSING', 'SHIPPED', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED']
        if (!validStatuses.includes(status)) {
            return ApiResponse.error(`Invalid status: ${status}`, 400)
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        })

        revalidatePath('/seller/orders'); revalidateTag(`seller-stats-${order.store.userId}`); revalidateTag(`buyer-stats-${order.userId}`)
        revalidatePath('/admin/orders')
        revalidatePath('/buyer/orders')

        return ApiResponse.success(order, "Order status updated")
    } catch (error) {
        logger.error("Update Order Status Error", error)
        return ApiResponse.error("Failed to update status")
    }
}

export async function verifyOrderCollection(orderId, token) {
    const cleanId = typeof orderId === 'string' ? orderId.trim() : orderId
    const cleanToken = typeof token === 'string' ? token.trim().toUpperCase() : token
    
    console.log("[VERIFY_COLLECTION] Received Request:", { orderId: cleanId, tokenType: typeof cleanToken })

    try {
        // Robust search: ID or TransactionID, Case-Insensitive
        console.log("[VERIFY_COLLECTION] Searching DB for:", cleanId)
        let order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: { equals: cleanId, mode: 'insensitive' } },
                    { transactionId: { equals: cleanId, mode: 'insensitive' } }
                ]
            },
            include: {
                user: true,
                store: true,
                orderItems: { include: { product: true } }
            }
        })

        if (!order) {

            console.error("[VERIFY_COLLECTION] ERROR: Order not found for ID:", cleanId)
            // Diagnostic: List some recent order IDs to see what we have
            const recentOrders = await prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true } })
            console.log("[VERIFY_COLLECTION] Recent IDs in DB:", recentOrders.map(o => o.id))
            return ApiResponse.error("Order not found", 404)
        }

        console.log("[VERIFY_COLLECTION] Order found:", order.id, "Expected Token:", order.verificationCode)

        // Normalize stored token to uppercase for comparison
        const storedToken = (order.verificationCode || '').toString().toUpperCase().trim()
        if (storedToken !== cleanToken) {
            console.warn("[VERIFY_COLLECTION] Token mismatch. Received:", cleanToken, "Expected:", order.verificationCode)
            return ApiResponse.error("Invalid verification code. Ask the seller for the correct code.", 400)
        }

        const validStatuses = ['ORDER_PLACED', 'PAID', 'APPROVED', 'PROCESSING', 'SHIPPED', 'PICKED_UP'];
        if (!validStatuses.includes(order.status)) {
            return ApiResponse.error(`Cannot verify collection for order in ${order.status} status`, 400)
        }

        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'COMPLETED',
                collectionStatus: 'COLLECTED',
                payoutStatus: 'pending'
            }
        })

        // Notify Admin of new payout request
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
        for (const admin of admins) {
            await createNotification(
                admin.id,
                "New Payout Request",
                `Order #${order.transactionId || order.id} has been collected. ₦${order.payoutAmount.toLocaleString()} is pending payout to the seller.`,
                "PAYMENT"
            )
        }

        revalidatePath('/seller/orders'); revalidateTag(`seller-stats-${order.store.userId}`); revalidateTag(`buyer-stats-${order.userId}`)
        revalidatePath('/admin')
        revalidatePath('/admin/orders')
        revalidatePath('/buyer/orders')

        // Send receipt email to buyer (must run before return)
        if (order.user?.email) {
            const firstItem = order.orderItems?.[0]
            const emailTemplate = buyerReceiptEmail({
                buyerName: order.user.name,
                orderId: order.transactionId || order.id,
                productName: firstItem?.product?.name || 'Battery',
                quantity: firstItem?.quantity || 1,
                unitPrice: firstItem?.price || order.total,
                totalAmount: order.total,
                collectionDate: new Date().toLocaleDateString('en-NG', { dateStyle: 'long' }),
                storeName: order.store?.name || 'Seller'
            })
            setTimeout(() => {
                sendEmail({ to: order.user.email, ...emailTemplate }).catch(err =>
                    logger.warn("Buyer receipt email failed", err)
                )
            }, 0)
        }

        return ApiResponse.success(updatedOrder, "Pickup Confirmed. Funds are now in pending payout status for Admin approval.")
    } catch (error) {
        logger.error("Verify Collection Error", error)
        return ApiResponse.error("Verification failed")
    }
}

export async function getAllOrders(page = 1, limit = 50) {
    try {
        const skip = (page - 1) * limit
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                skip,
                take: limit,
                include: {
                    user: { select: { name: true, email: true } },
                    store: { select: { name: true, bankName: true, accountName: true, accountNumber: true } }
                    // Only include necessary product details indirectly through orderItems if needed, 
                    // or keep it simple for the list.
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.order.count()
        ])
        return ApiResponse.success({
            orders,
            data: orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        logger.error("Get All Orders Error", error)
        return ApiResponse.error("Failed to fetch platform orders")
    }
}

export async function requestReschedule(orderId, newDate, requestedBy = 'SELLER', message = null) {
    try {
        // Resolve the real database ID if a transactionId (GCY-...) was provided
        const targetOrder = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: orderId },
                    { transactionId: orderId }
                ]
            }
        })

        if (!targetOrder) {
            return ApiResponse.error("Order record not found", 404)
        }

        const order = await prisma.order.update({
            where: { id: targetOrder.id },
            data: {
                collectionStatus: 'RESCHEDULE_REQUESTED',
                proposedDate: newDate,
                proposedBy: requestedBy
            },
            include: { store: true, user: true }
        })

        // Notify the OTHER party
        const notifyUserId = requestedBy === 'SELLER' ? order.userId : order.store.userId
        const notifyTitle = requestedBy === 'SELLER' ? "Seller Reschedule Request" : "Buyer Reschedule Request"
        const notifyMsg = requestedBy === 'SELLER' 
            ? `${order.store.name} has proposed a new pickup date: ${newDate}.${message ? ` \n\nNote: "${message}"` : ""} Please review and respond.` 
            : `${order.user.name} has requested a new pickup date: ${newDate}.${message ? ` \n\nNote: "${message}"` : ""} Please accept or suggest an alternative.`

        await createNotification(
            notifyUserId,
            notifyTitle,
            notifyMsg,
            "RESCHEDULE"
        )

        // Send email to the other party
        const emailTo = requestedBy === 'SELLER' ? order.user?.email : order.store?.email
        const emailName = requestedBy === 'SELLER' ? order.user?.name : order.store?.name
        
        if (emailTo) {
            const { rescheduleRequestEmail } = await import('@/backend-actions/lib/email')
            setTimeout(() => {
                sendEmail({
                    to: emailTo, ...rescheduleRequestEmail({
                        recipientName: emailName,
                        proposedDate: newDate,
                        proposedBy: requestedBy === 'SELLER' ? order.store.name : order.user.name,
                        orderId: order.transactionId || order.id
                    })
                }).catch(err => logger.warn('Reschedule email failed', err))
            }, 0)
        }

        revalidatePath('/seller/orders'); revalidateTag(`seller-stats-${order.store.userId}`); revalidateTag(`buyer-stats-${order.userId}`)
        revalidatePath('/buyer/orders')

        return ApiResponse.success(order, "Reschedule request sent")
    } catch (error) {
        logger.error("Reschedule Request Error", error)
        return ApiResponse.error("Failed to request reschedule")
    }
}

export async function respondToReschedule(orderId, action, alternateDate = null, respondedBy = 'BUYER') {
    try {
        let updateData = {}
        let notifyUserId = ""
        let notifyTitle = ""
        let notifyMsg = ""
        let emailTo = ""
        let emailName = ""

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true, user: true }
        })
        if (!order) return ApiResponse.error("Order not found")

        if (action === 'ACCEPT') {
            updateData = {
                collectionDate: order.proposedDate,
                collectionStatus: 'PENDING',
                proposedDate: null,
                proposedBy: null
            }

            if (respondedBy === 'BUYER') {
                // Buyer accepted seller's date → notify seller
                notifyUserId = order.store.userId
                notifyTitle = "Pickup Date Confirmed"
                notifyMsg = `${order.user.name} accepted the proposed pickup date: ${order.proposedDate}.`
                emailTo = order.store?.email
                emailName = order.store?.name
            } else {
                // Seller accepted buyer's date → notify buyer
                notifyUserId = order.userId
                notifyTitle = "Pickup Date Confirmed"
                notifyMsg = `${order.store.name} confirmed the pickup date: ${order.proposedDate}.`
                emailTo = order.user?.email
                emailName = order.user?.name
            }
        } else if (action === 'COUNTER') {
            updateData = {
                proposedDate: alternateDate,
                proposedBy: respondedBy,
                collectionStatus: 'RESCHEDULE_REQUESTED'
            }

            if (respondedBy === 'BUYER') {
                notifyUserId = order.store.userId
                notifyTitle = "Buyer Counter-Proposal"
                notifyMsg = `${order.user.name} proposed an alternative date: ${alternateDate}.`
                emailTo = order.store?.email
                emailName = order.store?.name
            } else {
                notifyUserId = order.userId
                notifyTitle = "Seller Counter-Proposal"
                notifyMsg = `${order.store.name} proposed an alternative date: ${alternateDate}.`
                emailTo = order.user?.email
                emailName = order.user?.name
            }
        } else if (action === 'REJECT') {
            updateData = {
                collectionStatus: 'PENDING',
                proposedDate: null,
                proposedBy: null
            }

            if (respondedBy === 'BUYER') {
                notifyUserId = order.store.userId
                notifyTitle = "Reschedule Request Declined"
                notifyMsg = `${order.user.name} declined the proposed reschedule. The pickup date remains ${order.collectionDate || 'as previously agreed'}.`
                emailTo = order.store?.email
                emailName = order.store?.name
            } else {
                notifyUserId = order.userId
                notifyTitle = "Reschedule Request Declined"
                notifyMsg = `${order.store.name} declined your reschedule request. The pickup date remains ${order.collectionDate || 'as previously agreed'}.`
                emailTo = order.user?.email
                emailName = order.user?.name
            }
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: { store: true, user: true }
        })

        await createNotification(notifyUserId, notifyTitle, notifyMsg, "RESCHEDULE")

        // Send email
        if (emailTo) {
            if (action === 'ACCEPT') {
                const { rescheduleAcceptedEmail } = await import('@/backend-actions/lib/email')
                setTimeout(() => {
                    sendEmail({
                        to: emailTo, ...rescheduleAcceptedEmail({
                            recipientName: emailName,
                            confirmedDate: order.proposedDate,
                            orderId: order.transactionId || order.id
                        })
                    }).catch(err => logger.warn('Reschedule accepted email failed', err))
                }, 0)
            } else {
                const { rescheduleRequestEmail } = await import('@/backend-actions/lib/email')
                setTimeout(() => {
                    sendEmail({
                        to: emailTo, ...rescheduleRequestEmail({
                            recipientName: emailName,
                            proposedDate: alternateDate,
                            proposedBy: respondedBy === 'BUYER' ? order.user.name : order.store.name,
                            orderId: order.transactionId || order.id
                        })
                    }).catch(err => logger.warn('Reschedule counter email failed', err))
                }, 0)
            }
        }

        revalidatePath('/seller/orders'); revalidateTag(`seller-stats-${order.store.userId}`); revalidateTag(`buyer-stats-${order.userId}`)
        revalidatePath('/buyer/orders')

        return ApiResponse.success(updatedOrder, action === 'ACCEPT' ? "Date confirmed!" : (action === 'REJECT' ? "Reschedule declined" : "Counter-proposal sent"))
    } catch (error) {
        logger.error("Reschedule Response Error", error)
        return ApiResponse.error("Failed to process reschedule response")
    }
}
