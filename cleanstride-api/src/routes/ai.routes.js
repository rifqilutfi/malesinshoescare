const { Router } = require('express');
const { recommend, analyzeImage } = require('../controllers/ai.controller');
const { uploadShoeImage } = require('../config/upload');

const router = Router();

// Public
router.post('/recommend', recommend);
router.post('/analyze', uploadShoeImage.single('image'), analyzeImage);

module.exports = router;
