const { z } = require('zod');
const { success } = require('../utils/response');
const { getRecommendation } = require('../services/ai.service');

const recommendSchema = z.object({
  material: z.string().min(1, 'Material is required'),
  condition: z.string().min(1, 'Condition is required'),
});

/**
 * POST /ai/recommend — public, AI service recommendation.
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

module.exports = { recommend };
