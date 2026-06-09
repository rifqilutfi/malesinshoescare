const { Router } = require('express');
const { index } = require('../controllers/service.controller');

const router = Router();

// Public
router.get('/', index);

module.exports = router;
