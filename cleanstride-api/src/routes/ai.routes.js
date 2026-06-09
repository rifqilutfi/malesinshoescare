const { Router } = require('express');
const { recommend } = require('../controllers/ai.controller');

const router = Router();

// Public
router.post('/recommend', recommend);

module.exports = router;
