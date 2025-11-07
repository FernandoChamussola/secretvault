require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { logger, auditLogger } = require('./utils/logger');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const secretsRoutes = require('./routes/secrets');
const { errorHandler } = require('./middleware/errorHandler');
const { validateMasterKey } = require('./utils/crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/secrets', secretsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Startup
async function startServer() {
  try {
    // Validate master key exists
    if (!validateMasterKey()) {
      logger.error('CRITICAL: MASTER_KEY not configured or invalid');
      logger.error('Set MASTER_KEY environment variable or provide MASTER_KEY_FILE');
      logger.error('Generate key with: openssl rand -hex 32');
      process.exit(1);
    }

    // Initialize database
    await initDatabase();
    logger.info('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      auditLogger.info('System started', { event: 'system_start' });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  auditLogger.info('System shutdown', { event: 'system_stop' });
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  auditLogger.info('System shutdown', { event: 'system_stop' });
  process.exit(0);
});

startServer();
