/**
 * Rule-based emergency classifier used as fallback when AI is unavailable.
 * Matches keywords in the description to determine category, priority, and responder type.
 */

const RULES = [
  {
    category: 'Medical',
    keywords: ['heart', 'chest pain', 'breathing', 'unconscious', 'bleeding', 'injury', 'ambulance', 'medical', 'seizure', 'overdose', 'stroke', 'faint', 'accident'],
    priority: 'high',
    responder_type: 'Paramedic',
  },
  {
    category: 'Fire',
    keywords: ['fire', 'smoke', 'burning', 'flame', 'explosion', 'gas leak', 'blaze'],
    priority: 'high',
    responder_type: 'Firefighter',
  },
  {
    category: 'Police',
    keywords: ['robbery', 'theft', 'assault', 'shooting', 'stabbing', 'fight', 'crime', 'suspicious', 'break-in', 'burglary', 'violence', 'threat', 'weapon'],
    priority: 'medium',
    responder_type: 'Police Officer',
  },
];

const classify = (description) => {
  const lower = description.toLowerCase();

  for (const rule of RULES) {
    const matchedKeyword = rule.keywords.find((kw) => lower.includes(kw));
    if (matchedKeyword) {
      return {
        category: rule.category,
        priority: rule.priority,
        recommended_responder: rule.responder_type,
        source: 'rule_engine',
        confidence: 1,
        reasoning: `Matched keyword "${matchedKeyword}" for category ${rule.category}`,
      };
    }
  }

  // Default fallback
 // Default fallback
  return {
    category: 'Police',
    priority: 'low',
    recommended_responder: 'Police Officer',
    source: 'rule_engine',
    confidence: 0.3,
    reasoning: 'No keywords matched; defaulted to lowest-priority category',
  };
};

module.exports = { classify };
