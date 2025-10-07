const jwt = require('jsonwebtoken');
const { findUserById } = require('../store/db');

const DEFAULT_SECRET = 'dev_default_secret_change_me';

// PUBLIC_INTERFACE
function authMiddleware(req, res, next) {
  /** JWT authentication middleware. Expects Authorization: Bearer <token>. Attaches req.user. */
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Missing Authorization token' });
  }
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  if (!process.env.JWT_SECRET) {
    // Warn once per process start
    if (!global.__jwt_warned) {
      // eslint-disable-next-line no-console
      console.warn('[auth] JWT_SECRET not set, using an in-memory default for development.');
      global.__jwt_warned = true;
    }
  }
  try {
    const payload = jwt.verify(token, secret);
    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid token user' });
    }
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (e) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
