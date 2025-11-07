const { z } = require('zod');

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const passwordSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

/**
 * Validates request body against a Zod schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedData = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  passwordSchema,
};
