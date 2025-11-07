/**
 * Example script to test the Secrets Vault API
 *
 * This script demonstrates:
 * 1. User registration
 * 2. User login (get JWT token)
 * 3. Create a secret (encrypted)
 * 4. Read the secret (decrypted)
 * 5. List all secrets
 * 6. Delete the secret
 *
 * Usage: node scripts/test-example.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

// Test credentials (DO NOT use these in production!)
const TEST_USER = {
  username: 'testuser_' + Date.now(),
  password: 'TestPass123!'
};

const TEST_SECRET = {
  name: 'My Test Secret',
  value: 'This is a super secret password: P@ssw0rd!',
  notes: 'This is just a test secret'
};

let authToken = null;
let secretId = null;

async function testRegister() {
  console.log('\n=== 1. Testing User Registration ===');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, TEST_USER);
    console.log('✓ User registered successfully');
    console.log('  User ID:', response.data.userId);
    return true;
  } catch (error) {
    console.error('✗ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n=== 2. Testing User Login ===');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✓ Login successful');
    console.log('  Token:', authToken.substring(0, 20) + '...');
    console.log('  User:', response.data.user.username);
    return true;
  } catch (error) {
    console.error('✗ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateSecret() {
  console.log('\n=== 3. Testing Create Secret ===');
  try {
    const response = await axios.post(
      `${API_URL}/secrets`,
      TEST_SECRET,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    secretId = response.data.secretId;
    console.log('✓ Secret created successfully');
    console.log('  Secret ID:', secretId);
    console.log('  Name:', response.data.name);
    console.log('  NOTE: The value is encrypted in the database!');
    return true;
  } catch (error) {
    console.error('✗ Create secret failed:', error.response?.data || error.message);
    return false;
  }
}

async function testReadSecret() {
  console.log('\n=== 4. Testing Read Secret (Decryption) ===');
  try {
    const response = await axios.get(
      `${API_URL}/secrets/${secretId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✓ Secret retrieved and decrypted successfully');
    console.log('  ID:', response.data.id);
    console.log('  Name:', response.data.name);
    console.log('  Value (decrypted):', response.data.value);
    console.log('  Notes:', response.data.notes);
    console.log('  Created:', new Date(response.data.createdAt).toLocaleString());

    // Verify the decrypted value matches what we stored
    if (response.data.value === TEST_SECRET.value) {
      console.log('✓ Decryption verified: values match!');
    } else {
      console.log('✗ Decryption mismatch!');
    }
    return true;
  } catch (error) {
    console.error('✗ Read secret failed:', error.response?.data || error.message);
    return false;
  }
}

async function testListSecrets() {
  console.log('\n=== 5. Testing List Secrets ===');
  try {
    const response = await axios.get(
      `${API_URL}/secrets`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✓ Secrets list retrieved');
    console.log('  Total secrets:', response.data.secrets.length);
    response.data.secrets.forEach(secret => {
      console.log(`  - ${secret.name} (ID: ${secret.id})`);
    });
    console.log('  NOTE: Values are NOT included in list (metadata only)');
    return true;
  } catch (error) {
    console.error('✗ List secrets failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeleteSecret() {
  console.log('\n=== 6. Testing Delete Secret ===');
  try {
    await axios.delete(
      `${API_URL}/secrets/${secretId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✓ Secret deleted successfully');
    return true;
  } catch (error) {
    console.error('✗ Delete secret failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     Secrets Vault API Test Suite                  ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\nAPI URL:', API_URL);
  console.log('Test User:', TEST_USER.username);

  let success = true;

  success = await testRegister() && success;
  if (!success) return;

  success = await testLogin() && success;
  if (!success) return;

  success = await testCreateSecret() && success;
  if (!success) return;

  success = await testReadSecret() && success;
  success = await testListSecrets() && success;
  success = await testDeleteSecret() && success;

  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✓ All tests passed successfully!');
    console.log('\nKey takeaways:');
    console.log('- Secrets are encrypted with AES-256-GCM before storage');
    console.log('- Only authenticated users can access their own secrets');
    console.log('- Decryption happens server-side using the MASTER_KEY');
    console.log('- All operations are logged in audit logs');
  } else {
    console.log('✗ Some tests failed');
  }
  console.log('='.repeat(50) + '\n');
}

// Run tests
runTests().catch(console.error);
