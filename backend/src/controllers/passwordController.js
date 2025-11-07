const passwordService = require('../services/passwordService');

class PasswordController {
  /**
   * GET /api/passwords
   * Get all passwords for the authenticated user
   */
  async getAllPasswords(req, res, next) {
    try {
      const { search, category } = req.query;
      const passwords = await passwordService.getAllPasswords(req.userId, { search, category });

      res.status(200).json({ passwords });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/passwords/:id
   * Get a single password by ID
   */
  async getPasswordById(req, res, next) {
    try {
      const { id } = req.params;
      const password = await passwordService.getPasswordById(req.userId, id);

      res.status(200).json({ password });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/passwords
   * Create a new password entry
   */
  async createPassword(req, res, next) {
    try {
      const password = await passwordService.createPassword(req.userId, req.validatedData);

      res.status(201).json({
        message: 'Password created successfully',
        password
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/passwords/:id
   * Update a password entry
   */
  async updatePassword(req, res, next) {
    try {
      const { id } = req.params;
      const password = await passwordService.updatePassword(req.userId, id, req.validatedData);

      res.status(200).json({
        message: 'Password updated successfully',
        password
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/passwords/:id
   * Delete a password entry
   */
  async deletePassword(req, res, next) {
    try {
      const { id } = req.params;
      const result = await passwordService.deletePassword(req.userId, id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PasswordController();
