const { error } = require('../utils/response');

/**
 * Global error handler middleware.
 * Must be registered LAST in Express middleware chain.
 */
function errorHandler(err, req, res, _next) {
  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
    if (err.stack) console.error(err.stack);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return error(res, 'Validation failed', 422, formatted);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    const target = err.meta?.target;
    return error(res, `Duplicate value for ${target}`, 409);
  }
  if (err.code === 'P2025') {
    return error(res, 'Record not found', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expired', 401);
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return error(res, message, statusCode);
}

module.exports = errorHandler;
