const crypto = require('crypto');
const fs = require('fs');
const { logger } = require('./logger');

// Encryption algorithm: AES-256-GCM (Authenticated Encryption)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

let MASTER_KEY = null;

/**
 * Load and validate master encryption key
 * Key can be provided via:
 * 1. MASTER_KEY environment variable
 * 2. MASTER_KEY_FILE pointing to a file containing the key
 */
function loadMasterKey() {
  if (MASTER_KEY) {
    return MASTER_KEY;
  }

  let keyHex;

  // Try to load from file first (Docker secret)
  if (process.env.MASTER_KEY_FILE) {
    try {
      keyHex = fs.readFileSync(process.env.MASTER_KEY_FILE, 'utf8').trim();
      logger.info('Master key loaded from file');
    } catch (error) {
      logger.warn('Failed to load master key from file:', error.message);
    }
  }

  // Fallback to environment variable
  if (!keyHex && process.env.MASTER_KEY) {
    keyHex = process.env.MASTER_KEY;
    logger.info('Master key loaded from environment variable');
  }

  if (!keyHex) {
    return null;
  }

  // Convert hex string to Buffer
  try {
    MASTER_KEY = Buffer.from(keyHex, 'hex');

    if (MASTER_KEY.length !== KEY_LENGTH) {
      logger.error(`Invalid master key length: ${MASTER_KEY.length} bytes (expected ${KEY_LENGTH})`);
      MASTER_KEY = null;
      return null;
    }

    return MASTER_KEY;
  } catch (error) {
    logger.error('Failed to parse master key:', error.message);
    return null;
  }
}

/**
 * Validate that master key is properly configured
 */
function validateMasterKey() {
  const key = loadMasterKey();
  return key !== null && key.length === KEY_LENGTH;
}

/**
 * Encrypt a plaintext value using AES-256-GCM
 *
 * @param {string} plaintext - The value to encrypt
 * @returns {Object} - Object containing encrypted data, IV, and auth tag
 *
 * Security notes:
 * - Each encryption uses a unique random IV (never reuse IVs with same key!)
 * - GCM provides authenticated encryption (confidentiality + integrity)
 * - Auth tag ensures data hasn't been tampered with
 */
function encrypt(plaintext) {
  const key = loadMasterKey();
  if (!key) {
    throw new Error('Master key not available');
  }

  // Generate a random IV for this encryption
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the plaintext
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get authentication tag (verifies integrity)
  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt an encrypted value using AES-256-GCM
 *
 * @param {string} encrypted - The encrypted data (hex)
 * @param {string} ivHex - The initialization vector (hex)
 * @param {string} authTagHex - The authentication tag (hex)
 * @returns {string} - The decrypted plaintext
 *
 * Security notes:
 * - Authentication tag is verified automatically
 * - If data was tampered with, decryption will throw an error
 * - Never return partial decrypted data on authentication failure
 */
function decrypt(encrypted, ivHex, authTagHex) {
  const key = loadMasterKey();
  if (!key) {
    throw new Error('Master key not available');
  }

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Authentication failure or corrupted data
    logger.error('Decryption failed:', error.message);
    throw new Error('Failed to decrypt: data may be corrupted or tampered with');
  }
}

/**
 * Generate a secure random master key
 * This is a utility function - DO NOT call this in production code
 *
 * @returns {string} - A hex-encoded 256-bit key
 */
function generateMasterKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Hash a password using bcrypt
 * Used for user authentication (not related to secret encryption)
 */
async function hashPassword(password) {
  const bcrypt = require('bcrypt');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 */
async function comparePassword(password, hash) {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, hash);
}

module.exports = {
  encrypt,
  decrypt,
  validateMasterKey,
  generateMasterKey,
  hashPassword,
  comparePassword
};
