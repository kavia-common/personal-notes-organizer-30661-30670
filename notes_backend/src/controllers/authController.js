const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { addUser, findUserByEmail } = require('../store/db');

const DEFAULT_SECRET = 'dev_default_secret_change_me';

// Helper to generate JWT
function signToken(user) {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  const payload = {
    sub: user.id,
    email: user.email
  };
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// PUBLIC_INTERFACE
async function register(req, res, next) {
  /** Registers a new user with email, password, and optional name. */
  try {
    const { email, password, name } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters' });
    }
    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      email,
      passwordHash,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    addUser(user);
    const token = signToken(user);
    return res.status(201).json({
      status: 'success',
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt }
      }
    });
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
async function login(req, res, next) {
  /** Logs a user in by verifying credentials and returning a JWT. */
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    const token = signToken(user);
    return res.status(200).json({
      status: 'success',
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt }
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
