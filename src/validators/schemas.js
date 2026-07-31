const Joi = require('joi');

const createEmergencySchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  description: Joi.string().min(10).max(1000).required(),
});

const assignResponderSchema = Joi.object({
  request_id: Joi.number().integer().positive().required(),
  responder_id: Joi.number().integer().positive().required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'assigned', 'in_progress', 'resolved', 'cancelled')
    .required(),
  changed_by: Joi.number().integer().positive().optional(),
});

const dispatchNotifySchema = Joi.object({
  request_id: Joi.number().integer().positive().required(),
});

const aiClassifySchema = Joi.object({
  description: Joi.string().min(5).max(1000).required(),
});

module.exports = {
  createEmergencySchema,
  assignResponderSchema,
  updateStatusSchema,
  dispatchNotifySchema,
  aiClassifySchema,
};
