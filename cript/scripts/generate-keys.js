#!/usr/bin/env node

/**
 * Script to generate secure keys for Secrets Vault
 *
 * Generates:
 * 1. MASTER_KEY (256-bit AES key for encrypting secrets)
 * 2. JWT_SECRET (for signing JWT tokens)
 * 3. DB passwords (for database security)
 *
 * Usage: node scripts/generate-keys.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║     Secrets Vault - Key Generation Tool           ║');
console.log('╚════════════════════════════════════════════════════╝\n');

// Generate keys
const MASTER_KEY = crypto.randomBytes(32).toString('hex');
const JWT_SECRET = crypto.randomBytes(32).toString('base64');
const DB_ROOT_PASSWORD = crypto.randomBytes(24).toString('base64').replace(/[/+=]/g, '');
const DB_PASSWORD = crypto.randomBytes(24).toString('base64').replace(/[/+=]/g, '');

console.log('Generated secure keys:\n');
console.log('1. MASTER_KEY (AES-256 encryption key):');
console.log('   ' + MASTER_KEY);
console.log('\n   ⚠️  CRITICAL: Store this key securely!');
console.log('   - Anyone with this key can decrypt ALL secrets');
console.log('   - Loss of this key means permanent data loss');
console.log('   - Never commit this key to version control\n');

console.log('2. JWT_SECRET (for token signing):');
console.log('   ' + JWT_SECRET + '\n');

console.log('3. DB_ROOT_PASSWORD:');
console.log('   ' + DB_ROOT_PASSWORD + '\n');

console.log('4. DB_PASSWORD:');
console.log('   ' + DB_PASSWORD + '\n');

console.log('═'.repeat(52));
console.log('Setup Options:\n');

console.log('Option 1: Environment Variables (.env file)');
console.log('─'.repeat(52));
const envContent = `# Database Configuration
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
DB_PASSWORD=${DB_PASSWORD}

# JWT Secret (for token signing)
JWT_SECRET=${JWT_SECRET}

# CRITICAL: Master Encryption Key
# This key encrypts ALL secrets in the database
# KEEP THIS SAFE - losing it means losing access to all encrypted data
MASTER_KEY=${MASTER_KEY}
`;

const envPath = path.join(__dirname, '..', '.env');
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✓ Created .env file at:', envPath);
  console.log('\nTo use: docker compose up -d\n');
} catch (error) {
  console.log('✗ Could not create .env file:', error.message);
  console.log('\nManually create .env file with the following content:\n');
  console.log(envContent);
}

console.log('Option 2: Docker Secret (more secure)');
console.log('─'.repeat(52));
const secretsDir = path.join(__dirname, '..', 'secrets');
const masterKeyFile = path.join(secretsDir, 'master_key.txt');

try {
  if (!fs.existsSync(secretsDir)) {
    fs.mkdirSync(secretsDir, { mode: 0o700 });
  }
  fs.writeFileSync(masterKeyFile, MASTER_KEY, { mode: 0o600 });
  console.log('✓ Created Docker secret file at:', masterKeyFile);
  console.log('\nUpdate .env file (remove MASTER_KEY line)');
  console.log('The key will be read from Docker secret instead\n');
} catch (error) {
  console.log('✗ Could not create secret file:', error.message);
  console.log('\nManually create secrets/master_key.txt with:');
  console.log(MASTER_KEY + '\n');
}

console.log('═'.repeat(52));
console.log('Security Recommendations:\n');
console.log('1. Change file permissions:');
console.log('   chmod 600 .env');
console.log('   chmod 700 secrets/');
console.log('   chmod 600 secrets/master_key.txt\n');
console.log('2. Add to .gitignore (already configured):');
console.log('   .env');
console.log('   secrets/\n');
console.log('3. Backup the MASTER_KEY in a secure location');
console.log('   (password manager, encrypted USB, etc.)\n');
console.log('4. For production, consider using:');
console.log('   - HashiCorp Vault');
console.log('   - AWS KMS / Secrets Manager');
console.log('   - Azure Key Vault');
console.log('   - Google Cloud KMS\n');
console.log('═'.repeat(52));
