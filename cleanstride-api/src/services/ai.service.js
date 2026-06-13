const config = require('../config');
const prisma = require('../lib/prisma');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Send a chat completion request to OpenRouter.
 * Returns the raw text content from the first choice.
 */
async function callOpenRouter(messages) {
  if (!config.openrouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cleanstride.local',
      'X-OpenRouter-Title': 'CleanStride Shoe Care',
    },
    body: JSON.stringify({
      model: config.openrouterModel,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('OpenRouter returned an unexpected response shape');
  }

  return data.choices[0].message.content;
}

/**
 * Get AI service recommendation based on shoe material and condition.
 *
 * Input:  material (e.g. "Canvas"), condition (e.g. "Heavy Dirt")
 * Output: { recommendedService, estimatedDuration, estimatedPrice, reason }
 *
 * Falls back to a hardcoded recommendation if OpenRouter is unavailable.
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
    if (!config.openrouterApiKey) {
      return getFallbackRecommendation(services, material, condition);
    }

    const text = await callOpenRouter([
      { role: 'user', content: prompt },
    ]);

    // Extract JSON from response (model sometimes wraps in markdown code blocks)
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
    console.error('OpenRouter API error:', err.message);
    return getFallbackRecommendation(services, material, condition);
  }
}

/**
 * Fallback recommendation when OpenRouter is unavailable.
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

/**
 * Analyze a shoe image using OpenRouter Vision API.
 *
 * Input:  imageBuffer (Buffer), mimeType (string)
 * Output: { recommendedService, condition, explanation, confidence }
 */
async function analyzeShoeImage(imageBuffer, mimeType) {
  // Fetch available services to ground the AI response
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { name: true, description: true, price: true, duration: true },
  });

  const serviceList = services
    .map((s) => `- ${s.name}: ${s.description} (Rp ${s.price}, ${s.duration})`)
    .join('\n');

  const promptText = `You are a shoe care expert assistant for CleanStride, a professional shoe laundry service.

Available services:
${serviceList}

Analyze the uploaded shoe image carefully and determine:
1. The overall condition of the shoe (e.g., "Heavy Dirt", "Light Stains", "Yellowed Sole", "Scuff Marks", "Good Condition")
2. The most appropriate cleaning service from the list above
3. A brief explanation of what you observe and why you recommend that service
4. Your confidence level (0-100) in your assessment

Respond in JSON format only, with no additional text:
{
  "recommendedService": "Service Name",
  "condition": "Detected Condition",
  "explanation": "Brief explanation of what you see and why this service is recommended",
  "confidence": 85
}`;

  try {
    if (!config.openrouterApiKey) {
      return getFallbackImageAnalysis(services);
    }

    // OpenRouter accepts OpenAI-compatible multimodal content format
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: promptText },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ];

    const text = await callOpenRouter(messages);

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getFallbackImageAnalysis(services);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      recommendedService: parsed.recommendedService,
      condition: parsed.condition,
      explanation: parsed.explanation,
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
    };
  } catch (err) {
    console.error('OpenRouter Vision API error:', err.message);
    return getFallbackImageAnalysis(services);
  }
}

/**
 * Fallback analysis when OpenRouter Vision is unavailable.
 */
function getFallbackImageAnalysis(services) {
  const sorted = [...services].sort((a, b) => Number(a.price) - Number(b.price));
  const pick = sorted[Math.floor(sorted.length / 2)] || sorted[0];

  if (!pick) {
    return {
      recommendedService: 'Deep Clean',
      condition: 'Unknown',
      explanation: 'AI analysis is currently unavailable. We recommend a Deep Clean as a safe general option.',
      confidence: 50,
    };
  }

  return {
    recommendedService: pick.name,
    condition: 'Requires Inspection',
    explanation: `AI analysis is currently unavailable. Based on our most popular service, we recommend ${pick.name}. Please visit our store for a detailed inspection.`,
    confidence: 50,
  };
}

module.exports = { getRecommendation, analyzeShoeImage };
