const { createClient } = require('redis');
const logger = require('../utils/logger');

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

client.on('error', (err) => logger.error('Redis client error', { err }));
client.on('connect', () => logger.info('Redis connected'));

const connectRedis = async () => {
  if (!client.isOpen) await client.connect();
};

module.exports = { client, connectRedis };
