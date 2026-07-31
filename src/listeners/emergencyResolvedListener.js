const emitter = require('../events/emitter');
const { EMERGENCY_RESOLVED } = require('../events/eventNames');
const logger = require('../utils/logger');

emitter.on(EMERGENCY_RESOLVED, (data) => {
  logger.info('EVENT: emergency:resolved', { request_id: data.request_id });
});
