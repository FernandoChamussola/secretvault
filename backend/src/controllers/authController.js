const authService = require('../services/authService');

class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.validatedData;
      const result = await authService.register({ email, password, name });

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.validatedData;
      const result = await authService.login({ email, password });

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.userId);

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  async logout(req, res) {
    res.status(200).json({ message: 'Logout successful' });
  }
}

module.exports = new AuthController();
