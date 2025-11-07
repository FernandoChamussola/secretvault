const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Registers a new user
   */
  async register({ email, password, name }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw { statusCode: 409, message: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    // Generate token
    const token = generateToken(user.id);

    return { user, token };
  }

  /**
   * Logs in a user
   */
  async login({ email, password }) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    // Generate token
    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token
    };
  }

  /**
   * Gets user profile
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }
}

module.exports = new AuthService();
