const emitter = require('../events/emitter');
const { RESPONDER_ASSIGNED } = require('../events/eventNames');
const logger = require('../utils/logger');

emitter.on(RESPONDER_ASSIGNED, (assignment) => {
  logger.info('EVENT: responder:assigned', {
    request_id: assignment.request_id,
    responder_id: assignment.responder_id,
    assigned_at: assignment.assigned_at,
  });
});
