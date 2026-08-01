const responderService = require('../services/responderService');

const assignResponder = async (req, res, next) => {
  try {
    const assignment = await responderService.assignResponder(req.body);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

const getAllResponders = async (req, res, next) => {
  try {
    const data = await responderService.getAllResponders();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

const autoAssignResponder = async (req, res, next) => {
  try {
    const { request_id } = req.body;
    if (!request_id) {
      return res.status(400).json({ success: false, message: 'request_id is required' });
    }
    const assignment = await responderService.autoAssignResponder(request_id);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

module.exports = { assignResponder, getAllResponders, autoAssignResponder };
