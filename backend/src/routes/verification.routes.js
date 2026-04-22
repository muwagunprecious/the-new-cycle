const express = require('express');
const router = express.Router();
const {
    verifyUserNIN,
    verifyUserCAC
} = require('../controllers/verification.controller');

router.post('/nin', verifyUserNIN);
router.post('/cac', verifyUserCAC);

module.exports = router;
