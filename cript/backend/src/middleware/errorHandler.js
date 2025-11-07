const { logger } = require('../utils/logger');

/**
 * Global error handler middleware
 * Catches all errors and returns appropriate responses
 * NEVER exposes sensitive information or stack traces in production
 */
function errorHandler(err, req, res, next) {
  // Log the error (but never log sensitive data)
  logger.error('Error occurred:', {
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    error: err.message || 'Internal server error'
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

module.exports = {
  errorHandler
};
