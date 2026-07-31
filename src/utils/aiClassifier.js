const axios = require('axios');
const logger = require('./logger');
const { classify: ruleClassify } = require('./ruleClassifier');

/**
 * Calls the configured AI provider (Groq by default) to classify an emergency.
 * Falls back to rule-based classifier on failure if AI_FALLBACK=true.
 */
const classifyWithAI = async (description) => {
  const provider = process.env.AI_PROVIDER || 'groq';
  const fallback = process.env.AI_FALLBACK !== 'false';

  if (provider === 'none') {
    return ruleClassify(description);
  }

  try {
    const result = await callGroq(description);
    return { ...result, source: 'ai' };
  } catch (err) {
    logger.warn('AI classification failed, using rule engine', { error: err.message });
    if (fallback) return ruleClassify(description);
    throw err;
  }
};

const callGroq = async (description) => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama3-8b-8192';

  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const prompt = `You are an emergency dispatch AI. Classify the following emergency description.
Return ONLY valid JSON with these exact keys: category, priority, recommended_responder.
- category must be one of: Medical, Fire, Police
- priority must be one of: low, medium, high, critical
- recommended_responder must be one of: Paramedic, Firefighter, Police Officer

Description: "${description}"`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 150,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    }
  );

  const content = response.data.choices[0].message.content.trim();

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON');

  const parsed = JSON.parse(jsonMatch[0]);

  const validCategories = ['Medical', 'Fire', 'Police'];
  const validPriorities = ['low', 'medium', 'high', 'critical'];

  if (!validCategories.includes(parsed.category)) throw new Error('Invalid category from AI');
  if (!validPriorities.includes(parsed.priority)) throw new Error('Invalid priority from AI');

  return {
    category: parsed.category,
    priority: parsed.priority,
    recommended_responder: parsed.recommended_responder,
  };
};

module.exports = { classifyWithAI };
