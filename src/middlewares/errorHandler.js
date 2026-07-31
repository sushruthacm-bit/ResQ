const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  logger.error('Request error', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: !isOperational ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
