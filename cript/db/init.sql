-- Secrets Vault Database Schema
-- MySQL/MariaDB initialization script

-- Create database (if running manually)
-- CREATE DATABASE IF NOT EXISTS secrets_vault;
-- USE secrets_vault;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Secrets table
-- Stores encrypted secrets with their encryption metadata
CREATE TABLE IF NOT EXISTS secrets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    value_encrypted TEXT NOT NULL,      -- Encrypted secret value (hex)
    iv VARCHAR(32) NOT NULL,            -- Initialization vector (hex, 12 bytes = 24 hex chars)
    auth_tag VARCHAR(32) NOT NULL,      -- GCM authentication tag (hex, 16 bytes = 32 hex chars)
    notes TEXT NULL,                    -- Optional plaintext notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security Notes:
-- 1. value_encrypted: Contains the AES-256-GCM encrypted data
-- 2. iv: Must be unique for each encryption operation (never reuse with same key!)
-- 3. auth_tag: Provides authentication/integrity verification for GCM mode
-- 4. All encrypted data is stored as hex strings for easy storage/retrieval
-- 5. Backups of this database will contain encrypted values only
-- 6. Without the MASTER_KEY, encrypted values cannot be decrypted
