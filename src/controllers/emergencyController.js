const emergencyService = require('../services/emergencyService');

const createEmergency = async (req, res, next) => {
  try {
    const emergency = await emergencyService.createEmergency(req.body);
    res.status(201).json({ success: true, data: emergency });
  } catch (err) {
    next(err);
  }
};

const getPendingEmergencies = async (req, res, next) => {
  try {
    const data = await emergencyService.getPendingEmergencies();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

const getActiveEmergencies = async (req, res, next) => {
  try {
    const data = await emergencyService.getActiveEmergencies();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, changed_by } = req.body;
    const updated = await emergencyService.updateStatus(Number(id), status, changed_by);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { createEmergency, getPendingEmergencies, getActiveEmergencies, updateStatus };
