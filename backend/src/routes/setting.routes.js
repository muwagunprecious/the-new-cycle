const express = require('express');
const router = express.Router();
const {
    getSettingsByGroup,
    updateSettings,
    testTermii,
    testQoreID
} = require('../controllers/setting.controller');

router.get('/:group', getSettingsByGroup);
router.post('/', updateSettings);
router.post('/test-termii', testTermii);
router.post('/test-qoreid', testQoreID);

module.exports = router;
