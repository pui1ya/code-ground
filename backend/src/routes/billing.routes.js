const express = require('express');
const router = express.Router();
const controller = require('../controllers/billing.controller');

router.post('/charge', controller.charge);

module.exports = router;
