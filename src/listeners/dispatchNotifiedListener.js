const emitter = require('../events/emitter');
const { DISPATCH_NOTIFIED } = require('../events/eventNames');
const logger = require('../utils/logger');

emitter.on(DISPATCH_NOTIFIED, (data) => {
  logger.info('EVENT: dispatch:notified – simulated dispatch notification sent', {
    request_id: data.request_id,
    notified_at: new Date().toISOString(),
  });
});
