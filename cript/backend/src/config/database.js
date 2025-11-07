const mysql = require('mysql2/promise');
const { logger } = require('../utils/logger');

let pool;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'secrets_user',
  password: process.env.DB_PASSWORD || 'dbpassword',
  database: process.env.DB_NAME || 'secrets_vault',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);

    // Test connection
    const connection = await pool.getConnection();
    logger.info('Database connection established');
    connection.release();

    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

async function query(sql, params) {
  const connection = await getPool().getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

module.exports = {
  initDatabase,
  getPool,
  query
};
