const aiService = require('../services/aiService');

const classify = async (req, res, next) => {
  try {
    const result = await aiService.classify(req.body.description);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { classify };
