const emitter = require('../events/emitter');
const { EMERGENCY_CREATED } = require('../events/eventNames');
const logger = require('../utils/logger');

emitter.on(EMERGENCY_CREATED, (emergency) => {
  logger.info('EVENT: emergency:created', {
    id: emergency.id,
    category: emergency.category,
    priority: emergency.priority,
    user_id: emergency.user_id,
  });
});
