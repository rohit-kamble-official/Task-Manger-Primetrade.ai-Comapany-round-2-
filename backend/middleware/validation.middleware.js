const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response.utils');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 400, messages[0], errors.array());
  }
  next();
};

// Auth validators
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  validate,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Task validators
const taskValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),
  body('description').optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status').optional().isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be: todo, in-progress, or completed'),
  body('priority').optional().isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium, or high'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Due date must be a valid date'),
  validate,
];

module.exports = { registerValidator, loginValidator, taskValidator };
