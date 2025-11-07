const winston = require('winston');
const path = require('path');

// Custom format that NEVER logs sensitive data
const safeFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Remove any potential sensitive fields
    const safeMeta = { ...meta };
    delete safeMeta.password;
    delete safeMeta.token;
    delete safeMeta.value;
    delete safeMeta.plaintext;
    delete safeMeta.decrypted;
    delete safeMeta.encrypted;
    delete safeMeta.masterKey;
    delete safeMeta.secret;

    const metaStr = Object.keys(safeMeta).length > 0 ? JSON.stringify(safeMeta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

// General application logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: safeFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        safeFormat
      )
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log')
    })
  ]
});

// Audit logger for security events
// Logs: authentication, authorization, secret access, modifications
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit.log')
    })
  ]
});

/**
 * Log an audit event
 * @param {string} event - Event type (login, create_secret, read_secret, etc.)
 * @param {object} data - Event data (user_id, secret_id, ip, etc.)
 */
function logAudit(event, data = {}) {
  auditLogger.info(event, {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
}

module.exports = {
  logger,
  auditLogger,
  logAudit
};
