const prisma = require('../config/prisma');
const { logger } = require('../lib/api-utils');
const { 
    sendEmail, 
    sellerWalletCreditEmail, 
    buyerVerifiedEmail, 
    buyerRejectedEmail,
    orderConfirmationEmail,
    sellerNewOrderEmail
} = require('../lib/email');
const { createNotification } = require('../services/notification.service');

/**
 * @desc    Get pending seller applications
 */
exports.getPendingSellers = async (req, res) => {
    try {
        const stores = await prisma.store.findMany({
            where: { status: 'pending' },
            include: { user: true }
        });
        res.status(200).json({ success: true, data: stores });
    } catch (error) {
        logger.error("Get Pending Sellers Error", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending sellers" });
    }
};

/**
 * @desc    Approve seller application
 */
exports.approveSeller = async (req, res) => {
    try {
        const { storeId } = req.params;
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        await prisma.$transaction([
            prisma.store.update({
                where: { id: storeId },
                data: { status: 'approved', isActive: true, isVerified: true }
            }),
            prisma.user.update({
                where: { id: store.userId },
                data: { role: 'SELLER' }
            })
        ]);

        await createNotification(
            store.userId,
            "Store Approved! 🎉",
            "Congratulations! Your store application has been approved. You can now start listing products.",
            "SYSTEM"
        );

        res.status(200).json({ success: true, message: "Seller approved successfully" });
    } catch (error) {
        logger.error("Approve Seller Error", error);
        res.status(500).json({ success: false, message: "Failed to approve seller" });
    }
};

/**
 * @desc    Reject seller application
 */
exports.rejectSeller = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { reason } = req.body;
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        await prisma.store.update({
            where: { id: storeId },
            data: {
                status: 'rejected',
                isActive: false,
                rejectionReason: reason || "Your store application did not meet our requirements."
            }
        });

        await createNotification(
            store.userId,
            "Store Application Rejected",
            `We're sorry, but your store application was not approved. Reason: ${reason || "Please contact support."}`,
            "SYSTEM"
        );

        res.status(200).json({ success: true, message: "Seller application rejected" });
    } catch (error) {
        logger.error("Reject Seller Error", error);
        res.status(500).json({ success: false, message: "Failed to reject seller" });
    }
};

/**
 * @desc    Get aggregate summary for admin dashboard
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const [
            sellerCount,
            productCount,
            orderCount,
            revenueData,
            verifiedCount,
            userCount,
            pendingPayoutsData,
            recentOrders,
            pendingVerifications
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'SELLER' } }),
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { total: true } }),
            prisma.user.count({ where: { accountStatus: 'approved' } }),
            prisma.user.count(),
            prisma.order.aggregate({
                where: { status: 'COMPLETED', payoutStatus: 'pending' },
                _sum: { 
                    total: true,
                    subtotal: true,
                    buyerFee: true,
                    sellerFee: true,
                    payoutAmount: true
                }
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    store: { select: { name: true } }
                }
            }),
            prisma.order.findMany({
                where: { paymentStatus: 'pending' },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    store: { select: { name: true } }
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                products: productCount,
                revenue: revenueData._sum.total || 0,
                orders: orderCount,
                stores: sellerCount,
                pendingPayouts: pendingPayoutsData._sum.payoutAmount || 0,
                pendingStats: {
                    subtotal: pendingPayoutsData._sum.subtotal || 0,
                    total: pendingPayoutsData._sum.total || 0,
                    sellerFee: pendingPayoutsData._sum.sellerFee || 0,
                    buyerFee: pendingPayoutsData._sum.buyerFee || 0,
                    payoutAmount: pendingPayoutsData._sum.payoutAmount || 0,
                    platformEarnings: (pendingPayoutsData._sum.buyerFee || 0) + (pendingPayoutsData._sum.sellerFee || 0)
                },
                verifiedUsers: verifiedCount,
                unverifiedUsers: userCount - verifiedCount,
                totalUsers: userCount,
                recentOrders: recentOrders,
                pendingVerifications: pendingVerifications || []
            }
        });
    } catch (error) {
        logger.error("Get Dashboard Summary Error", error);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
    }
};

/**
 * @desc    Release payout to seller
 */
exports.releasePayout = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: { include: { user: true } } }
        });

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.payoutStatus === 'released') return res.status(400).json({ success: false, message: "Payout already released" });

        const commission = order.total * 0.05;
        const netPayout = order.total - commission;

        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { payoutStatus: 'released' }
            }),
            prisma.store.update({
                where: { id: order.storeId },
                data: { walletBalance: { increment: netPayout } }
            })
        ]);

        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (admin) {
            await prisma.user.update({
                where: { id: admin.id },
                data: { walletBalance: { increment: commission } }
            });
        }

        await createNotification(
            order.store.userId,
            "Payout Approved! 💰",
            `Your payout of ₦${netPayout.toLocaleString()} (after 5% platform fee) for order ${orderId.slice(-6)} has been approved.`,
            "PAYMENT"
        );

        if (order.store?.user?.email) {
            const updatedStore = await prisma.store.findUnique({ where: { id: order.storeId } });
            const emailTemplate = sellerWalletCreditEmail({
                sellerName: order.store.user.name,
                amount: netPayout,
                newBalance: updatedStore?.walletBalance || netPayout,
                orderId,
                creditType: 'PAYOUT'
            });
            sendEmail({ to: order.store.user.email, ...emailTemplate }).catch(err =>
                logger.warn("Seller credit email failed", err)
            );
        }

        res.status(200).json({ success: true, data: { netPayout }, message: "Payout released successfully" });
    } catch (error) {
        logger.error("Release Payout Error", error);
        res.status(500).json({ success: false, message: "Failed to release payout" });
    }
};

/**
 * @desc    Verify bank transfer payment
 */
exports.verifyOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, store: { include: { user: true } }, orderItems: { include: { product: true } } }
        });

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        if (order.isPaid) return res.status(400).json({ success: false, message: "Order is already paid" });

        await prisma.order.update({
            where: { id: orderId },
            data: { isPaid: true, paymentStatus: 'verified', status: 'PAID' }
        });

        await createNotification(order.user.id, "Payment Verified!", `Your payment for Order #${order.transactionId} has been verified.`, "PAYMENT");
        await createNotification(order.store.userId, "New Order Received!", `You have a new paid order! Order #${order.transactionId}.`, "ORDER");
        
        const productName = order.orderItems[0]?.product?.name || 'Battery';
        if (order.user.email) {
            const buyerTemplate = orderConfirmationEmail({
                buyerName: order.user.name,
                orderId: order.transactionId,
                productName,
                amount: order.total,
                collectionDate: order.collectionDate ? new Date(order.collectionDate).toLocaleDateString() : 'TBD',
                token: order.collectionToken
            });
            sendEmail({ to: order.user.email, ...buyerTemplate }).catch(err => logger.warn("Buyer email failed", err));
        }

        if (order.store.user.email) {
            const sellerTemplate = sellerNewOrderEmail({
                sellerName: order.store.user.name,
                orderId: order.transactionId,
                productName,
                amount: order.total,
                quantity: order.orderItems[0]?.quantity || 1,
                collectionDate: order.collectionDate ? new Date(order.collectionDate).toLocaleDateString() : 'TBD',
                token: order.collectionToken,
                buyerName: order.user.name
            });
            sendEmail({ to: order.store.user.email, ...sellerTemplate }).catch(err => logger.warn("Seller email failed", err));
        }

        res.status(200).json({ success: true, message: "Order payment verified successfully" });
    } catch (error) {
        logger.error("Verify Order Payment Error", error);
        res.status(500).json({ success: false, message: "Failed to verify order payment" });
    }
};

/**
 * @desc    Get all users (paginated)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                select: { id: true, name: true, email: true, role: true, accountStatus: true, createdAt: true }
            }),
            prisma.user.count()
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        logger.error("Get All Users Error", error);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

/**
 * @desc    Approve buyer verification
 */
exports.approveBuyer = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: 'approved', verifiedAt: new Date(), isPhoneVerified: true, isEmailVerified: true }
        });

        await createNotification(userId, "Account Verified! 🎉", "Your buyer account has been verified.", "SYSTEM");

        if (updatedUser.email) {
            const { subject, html } = buyerVerifiedEmail({ name: updatedUser.name });
            sendEmail({ to: updatedUser.email, subject, html }).catch(err => logger.warn("Email failed", err));
        }

        res.status(200).json({ success: true, message: "Buyer verified successfully" });
    } catch (error) {
        logger.error("Approve Buyer Error", error);
        res.status(500).json({ success: false, message: "Failed to approve buyer" });
    }
};
