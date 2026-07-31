const emergencyRepo = require('../repositories/emergencyRepository');
const logRepo = require('../repositories/logRepository');
const emitter = require('../events/emitter');
const { DISPATCH_NOTIFIED } = require('../events/eventNames');
const AppError = require('../utils/AppError');

/**
 * Simulate a dispatch notification for a given emergency request.
 * Emits DISPATCH_NOTIFIED event and persists a log entry.
 */
const notifyDispatch = async ({ request_id }) => {
  const emergency = await emergencyRepo.findById(request_id);
  if (!emergency) throw new AppError('Emergency request not found', 404);

  const payload = {
    request_id,
    category: emergency.category,
    priority: emergency.priority,
    location: { latitude: emergency.latitude, longitude: emergency.longitude },
    notified_at: new Date().toISOString(),
  };

  emitter.emit(DISPATCH_NOTIFIED, payload);

  await logRepo.create({ event: 'dispatch:notified', payload });

  return { message: 'Dispatch notification sent', ...payload };
};

module.exports = { notifyDispatch };
