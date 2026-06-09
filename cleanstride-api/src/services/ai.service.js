const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const prisma = require('../lib/prisma');

/**
 * Get AI service recommendation based on shoe material and condition.
 *
 * Input:  material (e.g. "Canvas"), condition (e.g. "Heavy Dirt")
 * Output: { recommendedService, estimatedDuration, estimatedPrice, reason }
 *
 * Falls back to a hardcoded recommendation if Gemini is unavailable.
 */
async function getRecommendation(material, condition) {
  // Fetch available services to ground the AI response
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { name: true, description: true, price: true, duration: true },
  });

  const serviceList = services
    .map((s) => `- ${s.name}: ${s.description} (Rp ${s.price}, ${s.duration})`)
    .join('\n');

  const prompt = `You are a shoe care expert assistant for CleanStride, a professional shoe laundry service.

Available services:
${serviceList}

A customer has a shoe with the following details:
- Material: ${material}
- Condition: ${condition}

Based on the shoe material and condition, recommend the most appropriate service from the list above.

Respond in JSON format only, with no additional text:
{
  "recommendedService": "Service Name",
  "estimatedDuration": "duration",
  "estimatedPrice": price_as_number,
  "reason": "Brief explanation why this service is best for this shoe"
}`;

  try {
    if (!config.geminiApiKey || config.geminiApiKey === 'your-gemini-api-key-here') {
      return getFallbackRecommendation(services, material, condition);
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (Gemini sometimes wraps in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getFallbackRecommendation(services, material, condition);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      recommendedService: parsed.recommendedService,
      estimatedDuration: parsed.estimatedDuration,
      estimatedPrice: parsed.estimatedPrice,
      reason: parsed.reason,
    };
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return getFallbackRecommendation(services, material, condition);
  }
}

/**
 * Fallback recommendation when Gemini is unavailable.
 * Uses simple keyword matching against service names.
 */
function getFallbackRecommendation(services, material, condition) {
  // Default to the middle-priced service, or first if only one
  const sorted = [...services].sort((a, b) => Number(a.price) - Number(b.price));
  const conditionLower = condition.toLowerCase();

  let pick;

  if (conditionLower.includes('heavy') || conditionLower.includes('stain') || conditionLower.includes('deep')) {
    // Pick the most expensive service for heavy conditions
    pick = sorted[sorted.length - 1];
  } else if (conditionLower.includes('light') || conditionLower.includes('dust') || conditionLower.includes('minor')) {
    // Pick the cheapest for light conditions
    pick = sorted[0];
  } else {
    // Default: middle option
    pick = sorted[Math.floor(sorted.length / 2)] || sorted[0];
  }

  if (!pick) {
    return {
      recommendedService: 'Deep Clean',
      estimatedDuration: '2-3 Days',
      estimatedPrice: 50000,
      reason: 'General recommendation for your shoe condition.',
    };
  }

  return {
    recommendedService: pick.name,
    estimatedDuration: pick.duration,
    estimatedPrice: Number(pick.price),
    reason: `Recommended based on ${material} material with ${condition} condition.`,
  };
}

module.exports = { getRecommendation };
