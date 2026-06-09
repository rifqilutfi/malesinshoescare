const { Router } = require('express');
const { track } = require('../controllers/tracking.controller');

const router = Router();

// Public
router.get('/:orderCode', track);

module.exports = router;
