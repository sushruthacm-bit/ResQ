const { client } = require('../config/redis');

const QUEUE_KEY = 'resq:emergency:queue';
const CACHE_TTL = 300; // 5 minutes

// Priority score map – lower score = higher urgency (Redis ZADD uses ascending order, so we invert)
const PRIORITY_SCORE = { critical: 1, high: 2, medium: 3, low: 4 };

/**
 * Add an emergency to the Redis sorted-set priority queue.
 * Score is based on priority level; ties broken by timestamp.
 */
const enqueue = async (emergency) => {
  const score = (PRIORITY_SCORE[emergency.priority] || 4) * 1e12 + Date.now();
  await client.zAdd(QUEUE_KEY, { score, value: String(emergency.id) });
};

/**
 * Remove an emergency from the queue (after assignment or resolution).
 */
const dequeue = async (emergencyId) => {
  await client.zRem(QUEUE_KEY, String(emergencyId));
};

/**
 * Return all pending emergency IDs sorted by priority score (ascending).
 */
const getPendingIds = async () => {
  return client.zRange(QUEUE_KEY, 0, -1);
};

/**
 * Cache arbitrary data with a TTL.
 */
const setCache = async (key, value, ttl = CACHE_TTL) => {
  await client.setEx(key, ttl, JSON.stringify(value));
};

const getCache = async (key) => {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

const delCache = async (key) => {
  await client.del(key);
};

module.exports = { enqueue, dequeue, getPendingIds, setCache, getCache, delCache };
