const express = require('express');
const router = express.Router();
const controller = require('../controllers/execution.controller');

router.post('/run', controller.run);

module.exports = router;
