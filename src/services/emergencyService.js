const emergencyRepo = require('../repositories/emergencyRepository');
const statusHistoryRepo = require('../repositories/statusHistoryRepository');
const logRepo = require('../repositories/logRepository');
const { classifyWithAI } = require('../utils/aiClassifier');
const { enqueue, dequeue, getPendingIds } = require('../utils/redisQueue');
const emitter = require('../events/emitter');
const { EMERGENCY_CREATED, STATUS_UPDATED } = require('../events/eventNames');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Create a new emergency request:
 * 1. AI classify the description
 * 2. Persist to PostgreSQL
 * 3. Enqueue in Redis priority queue
 * 4. Emit EMERGENCY_CREATED event
 */
const createEmergency = async ({ user_id, latitude, longitude, description }) => {
  const classification = await classifyWithAI(description);
  logger.debug('Classification result', classification);

  const emergency = await emergencyRepo.create({
    user_id,
    latitude,
    longitude,
    description,
    category: classification.category,
    priority: classification.priority,
    recommended_responder: classification.recommended_responder,
    classification_source: classification.source,
  });

  await enqueue(emergency);

  emitter.emit(EMERGENCY_CREATED, emergency);

  await logRepo.create({ event: 'emergency:created', payload: { id: emergency.id, priority: emergency.priority } });

  return emergency;
};

/**
 * Return pending emergencies sorted by priority from Redis queue,
 * then fetch full records from PostgreSQL.
 */
const getPendingEmergencies = async () => {
  const ids = await getPendingIds();
  if (!ids.length) return [];

  const emergencies = await emergencyRepo.findByIds(ids.map(Number));

  // Re-sort by the Redis queue order (priority score)
  const idOrder = ids.map(Number);
  return emergencies.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));
};

/**
 * Return all active (non-resolved, non-cancelled) emergencies from PostgreSQL.
 */
const getActiveEmergencies = async () => {
  return emergencyRepo.findActive();
};

/**
 * Update the status of an emergency and record history.
 */
const updateStatus = async (id, newStatus, changedBy = null) => {
  const existing = await emergencyRepo.findById(id);
  if (!existing) throw new AppError('Emergency request not found', 404);

  const updated = await emergencyRepo.updateStatus(id, newStatus);

  await statusHistoryRepo.create({
    request_id: id,
    old_status: existing.status,
    new_status: newStatus,
    changed_by: changedBy,
  });

  emitter.emit(STATUS_UPDATED, {
    request_id: id,
    old_status: existing.status,
    new_status: newStatus,
  });

  // Remove from Redis queue if resolved or cancelled
  if (['resolved', 'cancelled'].includes(newStatus)) {
    await dequeue(id);
  }

  await logRepo.create({ event: 'status:updated', payload: { id, old_status: existing.status, new_status: newStatus } });

  return updated;
};

module.exports = { createEmergency, getPendingEmergencies, getActiveEmergencies, updateStatus };
