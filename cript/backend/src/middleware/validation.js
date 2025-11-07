const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

/**
 * Validation rules for creating a secret
 */
const createSecretValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),

  body('value')
    .notEmpty()
    .withMessage('Value is required')
    .isLength({ max: 10000 })
    .withMessage('Value must not exceed 10000 characters'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  validate
];

/**
 * Validation rules for updating a secret
 */
const updateSecretValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid secret ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),

  body('value')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Value must not exceed 10000 characters'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  validate
];

/**
 * Validation rules for secret ID parameter
 */
const secretIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid secret ID'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  createSecretValidation,
  updateSecretValidation,
  secretIdValidation
};
