const prisma = require('../config/prisma');
const { logger } = require('../lib/api-utils');

/**
 * @desc    Update store bank details
 * @route   PATCH /api/sellers/bank-details
 * @access  Private/Seller
 */
exports.updateStoreBankDetails = async (req, res) => {
    try {
        const { userId, bankDetails } = req.body;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) return res.status(404).json({ success: false, message: "Seller store not found" });

        await prisma.store.update({
            where: { id: store.id },
            data: {
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                accountName: bankDetails.accountName,
                isVerified: true
            }
        });

        res.status(200).json({ success: true, message: "Bank details updated successfully" });
    } catch (error) {
        logger.error("Update Bank Details Error", error);
        res.status(500).json({ success: false, message: "Failed to save bank details" });
    }
};

/**
 * @desc    Get store details for a user
 * @route   GET /api/sellers/store/:userId
 */
exports.getStoreDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        res.status(200).json({ success: true, data: store });
    } catch (error) {
        logger.error("Get Store Details Error", error);
        res.status(500).json({ success: false, message: "Failed to fetch store details" });
    }
};

/**
 * @desc    Get dashboard summary for a seller
 * @route   GET /api/sellers/dashboard/:userId
 */
exports.getSellerDashboardSummary = async (req, res) => {
    try {
        const { userId } = req.params;
        const store = await prisma.store.findUnique({
            where: { userId },
            select: { id: true, status: true }
        });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        const [totalProducts, orders, recentOrders] = await Promise.all([
            prisma.product.count({ where: { storeId: store.id } }),
            prisma.order.findMany({
                where: { storeId: store.id },
                select: { status: true, payoutStatus: true, payoutAmount: true, total: true }
            }),
            prisma.order.findMany({
                where: { storeId: store.id },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    orderItems: { include: { product: { select: { name: true } } } }
                }
            })
        ]);

        const pendingPickupStatuses = ['ORDER_PLACED', 'PAID', 'APPROVED', 'PROCESSING'];
        const completionStatuses = ['COMPLETED', 'PICKED_UP'];

        const stats = orders.reduce((acc, order) => {
            if (pendingPickupStatuses.includes(order.status)) acc.pendingPickups++;
            if (completionStatuses.includes(order.status)) {
                acc.completedOrdersCount++;
                acc.totalEarnings += (order.payoutAmount || order.total || 0);
            }
            if (order.payoutStatus === 'pending') acc.pendingPayouts += (order.payoutAmount || order.total || 0);
            return acc;
        }, { pendingPickups: 0, completedOrdersCount: 0, totalEarnings: 0, pendingPayouts: 0 });

        res.status(200).json({
            success: true,
            data: {
                totalProducts,
                totalEarnings: stats.totalEarnings,
                pendingPickups: stats.pendingPickups,
                completedOrdersCount: stats.completedOrdersCount,
                pendingPayouts: stats.pendingPayouts,
                recentOrders,
                storeStatus: store.status
            }
        });
    } catch (error) {
        logger.error("Get Seller Dashboard Summary Error", error);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard summary" });
    }
};

/**
 * @desc    Get payout history for a seller
 * @route   GET /api/sellers/payouts/:userId
 */
exports.getSellerPayoutHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const store = await prisma.store.findUnique({ where: { userId } });
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { storeId: store.id, payoutStatus: 'released' },
                skip, take: limit,
                orderBy: { updatedAt: 'desc' },
                include: { orderItems: { include: { product: { select: { name: true } } } } }
            }),
            prisma.order.count({ where: { storeId: store.id, payoutStatus: 'released' } })
        ]);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        logger.error("Get Seller Payout History Error", error);
        res.status(500).json({ success: false, message: "Failed to fetch payout history" });
    }
};
