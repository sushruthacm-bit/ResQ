const responderRepo = require('../repositories/responderRepository');
const assignmentRepo = require('../repositories/assignmentRepository');
const emergencyRepo = require('../repositories/emergencyRepository');
const logRepo = require('../repositories/logRepository');
const { dequeue } = require('../utils/redisQueue');
const emitter = require('../events/emitter');
const { RESPONDER_ASSIGNED } = require('../events/eventNames');
const AppError = require('../utils/AppError');

/**
 * Assign a responder to an emergency request:
 * 1. Validate both exist
 * 2. Create assignment record
 * 3. Mark responder as busy, emergency as assigned
 * 4. Remove from Redis queue
 * 5. Emit RESPONDER_ASSIGNED event
 */
const assignResponder = async ({ request_id, responder_id }) => {
  const emergency = await emergencyRepo.findById(request_id);
  if (!emergency) throw new AppError('Emergency request not found', 404);
  if (['resolved', 'cancelled'].includes(emergency.status)) {
    throw new AppError('Cannot assign responder to a resolved or cancelled emergency', 400);
  }

  const responder = await responderRepo.findById(responder_id);
  if (!responder) throw new AppError('Responder not found', 404);
  if (responder.status === 'busy') {
    throw new AppError('Responder is currently busy', 400);
  }

  const assignment = await assignmentRepo.create({ request_id, responder_id });

  await responderRepo.updateStatus(responder_id, 'busy');
  await emergencyRepo.updateStatus(request_id, 'assigned');
  await dequeue(request_id);

  emitter.emit(RESPONDER_ASSIGNED, assignment);

  await logRepo.create({ event: 'responder:assigned', payload: { request_id, responder_id } });

  return assignment;
};

const getAllResponders = async () => responderRepo.findAll();

const autoAssignResponder = async (request_id) => {
  const emergency = await emergencyRepo.findById(request_id);
  if (!emergency) throw new AppError('Emergency request not found', 404);
  if (['resolved', 'cancelled'].includes(emergency.status)) {
    throw new AppError('Cannot assign responder to a resolved or cancelled emergency', 400);
  }

  const nearest = await responderRepo.findNearestAvailable(
    emergency.recommended_responder,
    emergency.latitude,
    emergency.longitude
  );

  if (!nearest) {
    throw new AppError('No available responder found for this emergency', 404);
  }

  return assignResponder({ request_id, responder_id: nearest.id });
};

module.exports = { assignResponder, getAllResponders, autoAssignResponder };