const express = require('express');
const rateLimit = require('express-rate-limit');
const { query } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/crypto');
const { generateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { logger, logAudit } = require('../utils/logger');

const router = express.Router();

// Rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 em produção, 100 em dev
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, registerValidation, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    const userId = result.insertId;

    // Log audit event
    logAudit('user_registered', {
      user_id: userId,
      username,
      ip: req.ip
    });

    logger.info(`User registered: ${username}`);

    res.status(201).json({
      message: 'User registered successfully',
      userId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', authLimiter, loginValidation, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user
    const users = await query(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      // Log failed attempt
      logAudit('login_failed', {
        username,
        reason: 'user_not_found',
        ip: req.ip
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      // Log failed attempt
      logAudit('login_failed', {
        user_id: user.id,
        username,
        reason: 'invalid_password',
        ip: req.ip
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Log successful login
    logAudit('login_success', {
      user_id: user.id,
      username,
      ip: req.ip
    });

    logger.info(`User logged in: ${username}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
