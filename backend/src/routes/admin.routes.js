const express = require('express');
const router = express.Router();
const {
    getPendingSellers,
    approveSeller,
    rejectSeller,
    getDashboardSummary,
    releasePayout,
    verifyOrderPayment,
    getAllUsers,
    approveBuyer
} = require('../controllers/admin.controller');

// Dashboard
router.get('/summary', getDashboardSummary);

// Seller Management
router.get('/sellers/pending', getPendingSellers);
router.post('/sellers/:storeId/approve', approveSeller);
router.post('/sellers/:storeId/reject', rejectSeller);

// Payouts
router.post('/payouts/:orderId/release', releasePayout);

// Order Verification
router.post('/orders/:orderId/verify-payment', verifyOrderPayment);

// User Management
router.get('/users', getAllUsers);
router.post('/users/:userId/approve-buyer', approveBuyer);

module.exports = router;
