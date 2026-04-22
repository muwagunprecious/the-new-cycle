const express = require('express');
const router = express.Router();
const {
    updateStoreBankDetails,
    getStoreDetails,
    getSellerDashboardSummary,
    getSellerPayoutHistory
} = require('../controllers/seller.controller');

router.patch('/bank-details', updateStoreBankDetails);
router.get('/store/:userId', getStoreDetails);
router.get('/dashboard/:userId', getSellerDashboardSummary);
router.get('/payouts/:userId', getSellerPayoutHistory);

module.exports = router;
