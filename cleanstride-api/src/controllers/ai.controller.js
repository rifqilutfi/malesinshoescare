const { z } = require('zod');
const fs = require('fs');
const { success } = require('../utils/response');
const { error } = require('../utils/response');
const { getRecommendation, analyzeShoeImage } = require('../services/ai.service');

const recommendSchema = z.object({
  material: z.string().min(1, 'Material is required'),
  condition: z.string().min(1, 'Condition is required'),
});

/**
 * POST /ai/recommend — public, AI service recommendation (text-based).
 */
async function recommend(req, res, next) {
  try {
    const data = recommendSchema.parse(req.body);
    const result = await getRecommendation(data.material, data.condition);
    return success(res, result, 'Recommendation generated');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /ai/analyze — public, AI shoe image analysis (OpenRouter Vision).
 */
async function analyzeImage(req, res, next) {
  try {
    if (!req.file) {
      return error(res, 'Image file is required', 400);
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    const result = await analyzeShoeImage(imageBuffer, mimeType);

    // Clean up temporary file after analysis
    fs.unlink(req.file.path, () => {});

    return success(res, result, 'Image analyzed successfully');
  } catch (err) {
    // Clean up on error too
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
}

module.exports = { recommend, analyzeImage };
