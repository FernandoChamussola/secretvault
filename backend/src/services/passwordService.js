const prisma = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');

class PasswordService {
  /**
   * Creates a new password entry
   */
  async createPassword(userId, data) {
    const encryptedPassword = encrypt(data.password);

    const password = await prisma.password.create({
      data: {
        userId,
        title: data.title,
        username: data.username,
        password: encryptedPassword,
        description: data.description,
        category: data.category,
        url: data.url,
      }
    });

    return this._formatPassword(password);
  }

  /**
   * Gets all passwords for a user
   */
  async getAllPasswords(userId, filters = {}) {
    const where = { userId };

    // Add search filter
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Add category filter
    if (filters.category) {
      where.category = filters.category;
    }

    const passwords = await prisma.password.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return passwords.map(p => this._formatPassword(p, false)); // Don't decrypt by default
  }

  /**
   * Gets a single password by ID
   */
  async getPasswordById(userId, passwordId) {
    const password = await prisma.password.findFirst({
      where: {
        id: passwordId,
        userId
      }
    });

    if (!password) {
      throw { statusCode: 404, message: 'Password not found' };
    }

    return this._formatPassword(password);
  }

  /**
   * Updates a password entry
   */
  async updatePassword(userId, passwordId, data) {
    // Check if password exists and belongs to user
    const existingPassword = await prisma.password.findFirst({
      where: {
        id: passwordId,
        userId
      }
    });

    if (!existingPassword) {
      throw { statusCode: 404, message: 'Password not found' };
    }

    // Prepare update data
    const updateData = {
      title: data.title,
      username: data.username,
      description: data.description,
      category: data.category,
      url: data.url,
    };

    // Only encrypt new password if provided
    if (data.password) {
      updateData.password = encrypt(data.password);
    }

    const updatedPassword = await prisma.password.update({
      where: { id: passwordId },
      data: updateData
    });

    return this._formatPassword(updatedPassword);
  }

  /**
   * Deletes a password entry
   */
  async deletePassword(userId, passwordId) {
    // Check if password exists and belongs to user
    const password = await prisma.password.findFirst({
      where: {
        id: passwordId,
        userId
      }
    });

    if (!password) {
      throw { statusCode: 404, message: 'Password not found' };
    }

    await prisma.password.delete({
      where: { id: passwordId }
    });

    return { message: 'Password deleted successfully' };
  }

  /**
   * Formats password object and optionally decrypts
   */
  _formatPassword(password, decryptPassword = true) {
    const formatted = {
      id: password.id,
      title: password.title,
      username: password.username || null,
      description: password.description || null,
      category: password.category || null,
      url: password.url || null,
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    };

    if (decryptPassword) {
      formatted.password = decrypt(password.password);
    }

    return formatted;
  }
}

module.exports = new PasswordService();
