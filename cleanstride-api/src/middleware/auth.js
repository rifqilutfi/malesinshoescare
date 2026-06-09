const jwt = require('jsonwebtoken');
const config = require('../config');
const { error } = require('../utils/response');

/**
 * JWT authentication middleware.
 * Expects: Authorization: Bearer <token>
 * Attaches decoded user to req.user.
 */
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401);
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = auth;
