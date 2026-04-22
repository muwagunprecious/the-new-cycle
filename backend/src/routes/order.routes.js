const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getAllOrders,
    verifyOrderPayment
} = require('../controllers/order.controller');

// Public/Auth routes
router.post('/', createOrder);
router.get('/user/:userId', getUserOrders);

// Admin routes
router.get('/', getAllOrders);
router.post('/:id/verify-payment', verifyOrderPayment);

module.exports = router;
