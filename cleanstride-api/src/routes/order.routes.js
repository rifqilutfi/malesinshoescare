const { Router } = require('express');
const auth = require('../middleware/auth');
const { store, index, patchStatus } = require('../controllers/order.controller');

const router = Router();

// Public
router.post('/', store);

// Admin (protected)
router.get('/', auth, index);
router.patch('/:id/status', auth, patchStatus);

module.exports = router;
