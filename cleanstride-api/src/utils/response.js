/**
 * Standardized JSON response helpers.
 */

function success(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function created(res, data, message = 'Created successfully') {
  return success(res, data, message, 201);
}

function error(res, message = 'Internal server error', statusCode = 500, errors = null) {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { success, created, error };
