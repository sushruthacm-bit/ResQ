const emitter = require('../events/emitter');
const { STATUS_UPDATED, EMERGENCY_RESOLVED } = require('../events/eventNames');
const logger = require('../utils/logger');

emitter.on(STATUS_UPDATED, (data) => {
  logger.info('EVENT: status:updated', {
    request_id: data.request_id,
    old_status: data.old_status,
    new_status: data.new_status,
  });

  // Re-emit resolved event if status is resolved
  if (data.new_status === 'resolved') {
    emitter.emit(EMERGENCY_RESOLVED, { request_id: data.request_id });
  }
});
