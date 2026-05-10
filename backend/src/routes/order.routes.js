const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    verifyOrderPayment,
    verifyOrderCode
} = require('../controllers/order.controller');

// Public/Auth routes
router.post('/', createOrder);
router.get('/user/:userId', getUserOrders);

// Admin routes
router.get('/', getAllOrders);
router.post('/:id/verify-payment', verifyOrderPayment);
router.post('/:id/verify-code', verifyOrderCode);
router.post('/:id/notify-seller', (req, res) => {
    const { sellerId, buyerName, productName, amount, collectionDate, verificationCode } = req.body;
    const { emitToUser } = require('../lib/socket');
    emitToUser(sellerId, 'NEW_PURCHASE', {
        orderId: req.params.id,
        buyerName,
        productName,
        amount,
        collectionDate,
        verificationCode
    });
    res.status(200).json({ success: true });
});

module.exports = router;
