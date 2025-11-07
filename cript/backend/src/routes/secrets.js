const express = require('express');
const { query } = require('../config/database');
const { encrypt, decrypt } = require('../utils/crypto');
const { authenticate } = require('../middleware/auth');
const {
  createSecretValidation,
  updateSecretValidation,
  secretIdValidation
} = require('../middleware/validation');
const { logger, logAudit } = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/secrets
 * Create a new secret
 */
router.post('/', createSecretValidation, async (req, res, next) => {
  try {
    const { name, value, notes } = req.body;
    const userId = req.user.id;

    // Encrypt the secret value using AES-256-GCM
    const { encrypted, iv, authTag } = encrypt(value);

    // Store encrypted secret in database
    const result = await query(
      `INSERT INTO secrets (user_id, name, value_encrypted, iv, auth_tag, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, encrypted, iv, authTag, notes || null]
    );

    const secretId = result.insertId;

    // Log audit event
    logAudit('secret_created', {
      user_id: userId,
      username: req.user.username,
      secret_id: secretId,
      secret_name: name
    });

    logger.info(`Secret created by user ${req.user.username}: ${name}`);

    res.status(201).json({
      message: 'Secret created successfully',
      secretId,
      name
    });
  } catch (error) {
    logger.error('Error creating secret:', error);
    next(error);
  }
});

/**
 * GET /api/secrets
 * List all secrets for the authenticated user (metadata only, no values)
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const secrets = await query(
      `SELECT id, name, notes, created_at, updated_at
       FROM secrets
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      secrets: secrets.map(s => ({
        id: s.id,
        name: s.name,
        notes: s.notes,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/secrets/:id
 * Get a specific secret (includes decrypted value)
 */
router.get('/:id', secretIdValidation, async (req, res, next) => {
  try {
    const secretId = req.params.id;
    const userId = req.user.id;

    // Fetch secret
    const secrets = await query(
      `SELECT id, user_id, name, value_encrypted, iv, auth_tag, notes, created_at, updated_at
       FROM secrets
       WHERE id = ? AND user_id = ?`,
      [secretId, userId]
    );

    if (secrets.length === 0) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    const secret = secrets[0];

    // Decrypt the value
    let decryptedValue;
    try {
      decryptedValue = decrypt(
        secret.value_encrypted,
        secret.iv,
        secret.auth_tag
      );
    } catch (error) {
      logger.error(`Failed to decrypt secret ${secretId}:`, error);
      logAudit('secret_decrypt_failed', {
        user_id: userId,
        username: req.user.username,
        secret_id: secretId,
        error: error.message
      });
      return res.status(500).json({ error: 'Failed to decrypt secret' });
    }

    // Log audit event
    logAudit('secret_read', {
      user_id: userId,
      username: req.user.username,
      secret_id: secretId,
      secret_name: secret.name
    });

    res.json({
      id: secret.id,
      name: secret.name,
      value: decryptedValue, // ONLY returned via authenticated API
      notes: secret.notes,
      createdAt: secret.created_at,
      updatedAt: secret.updated_at
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/secrets/:id
 * Update a secret (re-encrypts if value is changed)
 */
router.put('/:id', updateSecretValidation, async (req, res, next) => {
  try {
    const secretId = req.params.id;
    const userId = req.user.id;
    const { name, value, notes } = req.body;

    // Check if secret exists and belongs to user
    const secrets = await query(
      'SELECT id FROM secrets WHERE id = ? AND user_id = ?',
      [secretId, userId]
    );

    if (secrets.length === 0) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (value !== undefined) {
      // Re-encrypt the new value
      const { encrypted, iv, authTag } = encrypt(value);
      updates.push('value_encrypted = ?, iv = ?, auth_tag = ?');
      params.push(encrypted, iv, authTag);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = NOW()');
    params.push(secretId, userId);

    await query(
      `UPDATE secrets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    // Log audit event
    logAudit('secret_updated', {
      user_id: userId,
      username: req.user.username,
      secret_id: secretId,
      fields_updated: Object.keys(req.body)
    });

    logger.info(`Secret ${secretId} updated by user ${req.user.username}`);

    res.json({ message: 'Secret updated successfully' });
  } catch (error) {
    logger.error('Error updating secret:', error);
    next(error);
  }
});

/**
 * DELETE /api/secrets/:id
 * Delete a secret
 */
router.delete('/:id', secretIdValidation, async (req, res, next) => {
  try {
    const secretId = req.params.id;
    const userId = req.user.id;

    // Delete secret (only if it belongs to the user)
    const result = await query(
      'DELETE FROM secrets WHERE id = ? AND user_id = ?',
      [secretId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Secret not found' });
    }

    // Log audit event
    logAudit('secret_deleted', {
      user_id: userId,
      username: req.user.username,
      secret_id: secretId
    });

    logger.info(`Secret ${secretId} deleted by user ${req.user.username}`);

    res.json({ message: 'Secret deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
