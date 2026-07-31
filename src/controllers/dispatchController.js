const dispatchService = require('../services/dispatchService');

const notifyDispatch = async (req, res, next) => {
  try {
    const result = await dispatchService.notifyDispatch(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { notifyDispatch };
