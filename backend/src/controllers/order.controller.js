const prisma = require('../config/prisma');
const { logger, generateOrderId } = require('../lib/api-utils');
const { sendEmail, orderConfirmationEmail, buyerReceiptEmail, sellerNewOrderEmail } = require('../lib/email');
const { createNotification } = require('../services/notification.service');

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
                }
            },
            include: { user: true, store: true }
        });

        // Reserve the product
        await prisma.product.update({
            where: { id: productId },
            data: { inStock: false, status: 'sold' }
        });

        // Notifications
        await createNotification(store.userId, "New Order Received!", `You have a new order for ${quantity} unit(s).`, "ORDER");
        
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
 * @desc    Verify bank transfer (Admin)
 */
exports.verifyOrderPayment = async (req, res) => {
    // This will be migrated from admin.js logic
    res.status(501).json({ message: 'Not implemented yet' });
};
