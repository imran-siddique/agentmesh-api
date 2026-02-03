/**
 * Tests for Ed25519 cryptographic functions
 * Run with: node lib/crypto.test.js
 */

const {
  generateKeyPair,
  signMessage,
  verifySignature,
  createSignedMessage,
  verifySignedMessage,
  generateChallenge,
  sha256,
} = require('./crypto');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// Test key generation
test('generateKeyPair creates valid key pair', () => {
  const keyPair = generateKeyPair();
  assert(keyPair.publicKey.length === 64, 'Public key should be 64 hex chars (32 bytes)');
  assert(keyPair.privateKey.length === 64, 'Private key should be 64 hex chars (32 bytes)');
});

// Test signing and verification
test('signMessage and verifySignature work together', () => {
  const keyPair = generateKeyPair();
  const message = 'Hello, AgentMesh!';
  
  const signature = signMessage(message, keyPair.privateKey);
  assert(signature.length === 128, 'Signature should be 128 hex chars (64 bytes)');
  
  const isValid = verifySignature(message, signature, keyPair.publicKey);
  assert(isValid === true, 'Signature should verify correctly');
});

// Test signature verification fails with wrong message
test('verifySignature fails with wrong message', () => {
  const keyPair = generateKeyPair();
  const message = 'Hello, AgentMesh!';
  const wrongMessage = 'Hello, World!';
  
  const signature = signMessage(message, keyPair.privateKey);
  const isValid = verifySignature(wrongMessage, signature, keyPair.publicKey);
  assert(isValid === false, 'Signature should fail with wrong message');
});

// Test signature verification fails with wrong key
test('verifySignature fails with wrong public key', () => {
  const keyPair1 = generateKeyPair();
  const keyPair2 = generateKeyPair();
  const message = 'Hello, AgentMesh!';
  
  const signature = signMessage(message, keyPair1.privateKey);
  const isValid = verifySignature(message, signature, keyPair2.publicKey);
  assert(isValid === false, 'Signature should fail with wrong public key');
});

// Test signature verification fails with tampered signature
test('verifySignature fails with tampered signature', () => {
  const keyPair = generateKeyPair();
  const message = 'Hello, AgentMesh!';
  
  const signature = signMessage(message, keyPair.privateKey);
  // Tamper with the signature
  const tampered = signature.slice(0, -2) + '00';
  
  const isValid = verifySignature(message, tampered, keyPair.publicKey);
  assert(isValid === false, 'Signature should fail when tampered');
});

// Test signed message creation and verification
test('createSignedMessage and verifySignedMessage work together', () => {
  const keyPair = generateKeyPair();
  const data = JSON.stringify({ agent_did: 'did:mesh:test123', action: 'handshake' });
  
  const signed = createSignedMessage(data, keyPair.privateKey, keyPair.publicKey);
  assert(signed.data === data, 'Data should be preserved');
  assert(signed.signature.length === 128, 'Should have signature');
  assert(signed.publicKey === keyPair.publicKey, 'Should have public key');
  assert(signed.timestamp, 'Should have timestamp');
  
  const isValid = verifySignedMessage(signed);
  assert(isValid === true, 'Signed message should verify');
});

// Test signed message fails with old timestamp
test('verifySignedMessage fails with expired timestamp', () => {
  const keyPair = generateKeyPair();
  const data = 'test data';
  
  const signed = createSignedMessage(data, keyPair.privateKey, keyPair.publicKey);
  // Set timestamp to 10 minutes ago
  signed.timestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  // Re-sign with old timestamp
  const messageToSign = `${data}:${signed.timestamp}`;
  signed.signature = signMessage(messageToSign, keyPair.privateKey);
  
  // Should fail with 5 minute max age
  const isValid = verifySignedMessage(signed, 5 * 60 * 1000);
  assert(isValid === false, 'Should fail with expired timestamp');
});

// Test input validation
test('verifySignature handles invalid inputs gracefully', () => {
  assert(verifySignature(null, 'sig', 'key') === false, 'Should handle null message');
  assert(verifySignature('msg', null, 'key') === false, 'Should handle null signature');
  assert(verifySignature('msg', 'sig', null) === false, 'Should handle null public key');
  assert(verifySignature('msg', 'short', 'key') === false, 'Should handle short signature');
  assert(verifySignature('msg', 'a'.repeat(128), 'short') === false, 'Should handle short key');
});

// Test challenge generation
test('generateChallenge creates unique challenges', () => {
  const c1 = generateChallenge();
  const c2 = generateChallenge();
  assert(c1.length === 64, 'Challenge should be SHA256 hex (64 chars)');
  assert(c1 !== c2, 'Challenges should be unique');
});

// Test sha256
test('sha256 produces correct hash', () => {
  const hash = sha256('test');
  assert(hash.length === 64, 'Hash should be 64 hex chars');
  // Known hash for "test"
  assert(hash === '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 'Hash should match known value');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
