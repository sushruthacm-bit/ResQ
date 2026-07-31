require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Verify PostgreSQL connection
    await pool.query('SELECT 1');
    logger.info('PostgreSQL connected');

    // Connect Redis
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`ResQ API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
};

start();
