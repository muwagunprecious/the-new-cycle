const prisma = require('../config/prisma');
const { logger, generateOrderId } = require('../lib/api-utils');
const { sendEmail, orderConfirmationEmail, buyerReceiptEmail, sellerNewOrderEmail } = require('../lib/email');
const { createNotification } = require('../services/notification.service');
const { generateVerificationCode } = require('../lib/crypto');
const { emitToUser } = require('../lib/socket');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private/Buyer
 */
exports.createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const { buyerId, sellerId, productId, quantity, totalAmount, collectionDate, subtotal, buyerFee, paymentSenderName, paymentMethod = 'MANUAL_TRANSFER' } = orderData;

        if (!buyerId || !productId || quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        const collectionToken = Math.floor(100000 + Math.random() * 900000).toString();

        let store;
        if (sellerId) {
            store = await prisma.store.findUnique({ where: { userId: sellerId } });
        } else {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: { store: true }
            });
            store = product?.store;
        }

        if (!store) return res.status(404).json({ success: false, message: 'Seller store not found' });

        const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
        if (!buyer) return res.status(404).json({ success: false, message: 'Buyer account not found' });

        if (buyer.role === 'USER' && buyer.accountStatus !== 'approved') {
            return res.status(403).json({ success: false, message: 'Your account is pending verification. Orders are restricted.' });
        }

        const sellerFee = Math.round(subtotal * 0.05);
        const payoutAmount = subtotal - sellerFee;

        const orderId = generateOrderId();
        const transactionId = orderId;

        const order = await prisma.order.create({
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
                collectionToken: collectionToken,
                collectionDate: collectionDate,
                userId: buyerId,
                storeId: store.id,
                isPaid: paymentMethod === 'STRIPE',
                paymentMethod: paymentMethod,
                paymentSenderName: paymentSenderName || null,
                paymentStatus: paymentMethod === 'STRIPE' ? 'verified' : 'pending',
                orderItems: {
                    create: [{
                        productId: productId,
                        quantity: quantity,
                        price: subtotal / quantity
                    }]
                },
                verificationCode: generateVerificationCode(),
                verificationStatus: 'PENDING'
            },
            include: { user: true, store: true, orderItems: { include: { product: true } } }
        });

        // Reserve the product
        await prisma.product.update({
            where: { id: productId },
            data: { inStock: false, status: 'sold' }
        });

        // For manual transfers, defer seller notification until admin verifies payment.
        if (paymentMethod !== 'MANUAL_TRANSFER') {
            // Immediate notification for instant payments (e.g., Stripe)
            await createNotification(store.userId, "New Purchase Request", `ORDER:${order.id}|BUYER:${buyer.name}|PHONE:${buyer.phone || ''}|AMOUNT:${totalAmount}|PROD:${order.orderItems?.[0]?.product?.name || 'Battery'}|DATE:${collectionDate || 'Pending'}|CODE:${order.verificationCode}|QTY:${order.orderItems?.[0]?.quantity || 1}`, "ORDER");
            // Real-time emit to seller
            emitToUser(store.userId, 'NEW_PURCHASE', {
                orderId: order.id,
                buyerName: buyer.name,
                productName: order.orderItems?.[0]?.product?.name || 'Battery',
                amount: totalAmount,
                collectionDate: collectionDate || 'Pending',
                verificationCode: order.verificationCode
            });
        }
        
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await createNotification(admin.id, "New Platform Sale", `Order #${transactionId} placed.`, "ORDER");
        }

        // Email flow
        if (buyer.email) {
            const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } });
            if (paymentMethod === 'MANUAL_TRANSFER') {
                sendEmail({
                    to: buyer.email,
                    subject: "[Go-Cycle] Order Received - Payment Verification Pending",
                    html: `<h1>Order Received</h1><p>Hello ${buyer.name}, your payment is pending verification.</p>`
                }).catch(err => console.error("Email failed", err));
            } else {
                const emailParams = orderConfirmationEmail({
                    buyerName: buyer.name,
                    orderId: transactionId,
                    productName: product?.name || 'Battery',
                    amount: totalAmount,
                    collectionDate: collectionDate || 'TBD',
                    token: collectionToken
                });
                sendEmail({ to: buyer.email, ...emailParams }).catch(err => console.error("Email failed", err));
            }
        }

        res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: 'Order creation failed' });
    }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/user/:userId
 */
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                store: true,
                orderItems: { include: { product: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        // Sanitize sensitive tokens for list view
        const sanitized = orders.map(({ collectionToken, ...safeOrder }) => safeOrder);
        res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
        console.error("Get User Orders Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 */
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                skip,
                take: limit,
                include: {
                    user: { select: { name: true, email: true } },
                    store: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.order.count()
        ]);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error("Get All Orders Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch platform orders' });
    }
};

/**
 * @desc    Verify order with code (Seller)
 * @route   POST /api/orders/:id/verify-code
 */
exports.verifyOrderCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code } = req.body;

        const order = await prisma.order.findUnique({
            where: { id },
            include: { user: true, store: true }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        
        if (order.verificationStatus === 'VERIFIED') {
            return res.status(400).json({ success: false, message: 'Order already verified' });
        }

        if (order.verificationCode !== code?.toUpperCase()) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                verificationStatus: 'VERIFIED',
                collectionStatus: 'COLLECTED',
                payoutStatus: 'released'
            }
        });

        // Pay Seller
        await prisma.store.update({
            where: { id: order.storeId },
            data: { walletBalance: { increment: order.payoutAmount } }
        });

        // Pay Admin Fee
        const totalFee = order.buyerFee + order.sellerFee;
        await prisma.user.updateMany({
            where: { role: 'ADMIN' },
            data: { walletBalance: { increment: totalFee } }
        });

        // Notify Buyer
        await createNotification(order.userId, "Order Completed", `Your order #${order.id} has been verified and completed.`, "ORDER");

        res.status(200).json({ success: true, data: updatedOrder, message: 'Order verified and completed successfully' });
    } catch (error) {
        console.error("Verify Code Error:", error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};

/**
 * @desc    Verify order payment (Admin)
 * @route   POST /api/orders/:id/verify-payment
 */
exports.verifyOrderPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: { user: true, store: true }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.isPaid) return res.status(400).json({ success: false, message: 'Order already verified' });

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                isPaid: true,
                paymentStatus: 'verified',
                status: 'PAID'
            }
        });

        // Notifications
        await createNotification(order.userId, "Payment Verified!", `ORDER:${order.id}|BUYER:${order.user.name}|PHONE:${order.user.phone || ''}|AMOUNT:${order.total}|PROD:${order.orderItems?.[0]?.product?.name || 'Battery'}|DATE:${order.collectionDate || 'Pending'}|CODE:${order.verificationCode}|QTY:${order.orderItems?.[0]?.quantity || 1}`, "ORDER");
        await createNotification(order.store.userId, "New Paid Order!", `Order #${order.id} is now paid. You can prepare for pickup.`, "ORDER");
        // Emit real-time update to seller after payment verification
        emitToUser(order.store.userId, 'NEW_PURCHASE', {
            orderId: order.id,
            buyerName: order.user.name,
            productName: order.orderItems?.[0]?.product?.name || 'Battery',
            amount: order.total,
            collectionDate: order.collectionDate || 'Pending',
            verificationCode: order.verificationCode
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};
