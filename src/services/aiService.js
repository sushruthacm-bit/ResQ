const { classifyWithAI } = require('../utils/aiClassifier');

/**
 * Classify an emergency description using AI (or rule engine fallback).
 */
const classify = async (description) => {
  return classifyWithAI(description);
};

module.exports = { classify };
