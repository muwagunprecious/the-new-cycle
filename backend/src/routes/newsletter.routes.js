const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletter.controller');

router.post('/subscribe', subscribeNewsletter);

module.exports = router;
