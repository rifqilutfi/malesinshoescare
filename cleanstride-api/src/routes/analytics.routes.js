const { Router } = require('express');
const auth = require('../middleware/auth');
const { dashboard } = require('../controllers/analytics.controller');

const router = Router();

// Admin (protected)
router.get('/dashboard', auth, dashboard);

module.exports = router;
