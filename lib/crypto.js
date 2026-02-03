const crypto = require('crypto');
const ed = require('@noble/ed25519');

// Use synchronous SHA-512 for ed25519 in Node.js
ed.etc.sha512Sync = (...m) => {
  const hash = crypto.createHash('sha512');
  m.forEach(data => hash.update(data));
  return new Uint8Array(hash.digest());
};

function generateId(length = 32) {
  return crypto.randomBytes(length / 2).toString('hex');
}

function generateDID(name) {
  const uniqueId = generateId(32);
  return `did:mesh:${uniqueId}`;
}

function generateApiKey() {
  const key = generateId(32);
  return `amesh_${key}`;
}

function generateVerificationCode() {
  const words = ['reef', 'coral', 'wave', 'tide', 'shell', 'pearl', 'kelp', 'crab'];
  const word = words[Math.floor(Math.random() * words.length)];
  const code = generateId(4).toUpperCase();
  return `${word}-${code}`;
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateChallenge() {
  const timestamp = Date.now().toString();
  const nonce = generateId(16);
  return sha256(`${timestamp}:${nonce}`);
}

/**
 * Generate Ed25519 key pair
 * @returns {{ publicKey: string, privateKey: string }} Hex-encoded key pair
 */
function generateKeyPair() {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = ed.getPublicKey(privateKey);
  return {
    publicKey: Buffer.from(publicKey).toString('hex'),
    privateKey: Buffer.from(privateKey).toString('hex'),
  };
}

/**
 * Sign a message using Ed25519
 * @param {string} message - Message to sign
 * @param {string} privateKeyHex - Hex-encoded private key
 * @returns {string} Hex-encoded signature
 */
function signMessage(message, privateKeyHex) {
  // If no private key provided, use server key for backward compatibility
  if (!privateKeyHex) {
    const serverKey = process.env.SIGNING_KEY || 'agentmesh-server-key-demo';
    return sha256(`${message}:${serverKey}`);
  }
  
  const privateKey = Buffer.from(privateKeyHex, 'hex');
  const messageBytes = new TextEncoder().encode(message);
  const signature = ed.sign(messageBytes, privateKey);
  return Buffer.from(signature).toString('hex');
}

/**
 * Verify an Ed25519 signature
 * @param {string} message - Original message
 * @param {string} signatureHex - Hex-encoded signature
 * @param {string} publicKeyHex - Hex-encoded public key
 * @returns {boolean} True if signature is valid
 */
function verifySignature(message, signatureHex, publicKeyHex) {
  try {
    // Validate inputs
    if (!message || !signatureHex || !publicKeyHex) {
      return false;
    }
    
    // Check signature length (Ed25519 signatures are 64 bytes = 128 hex chars)
    if (signatureHex.length !== 128) {
      return false;
    }
    
    // Check public key length (Ed25519 public keys are 32 bytes = 64 hex chars)
    if (publicKeyHex.length !== 64) {
      return false;
    }
    
    const signature = Buffer.from(signatureHex, 'hex');
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    const messageBytes = new TextEncoder().encode(message);
    
    return ed.verify(signature, messageBytes, publicKey);
  } catch (error) {
    console.error('Signature verification error:', error.message);
    return false;
  }
}

/**
 * Create a signed message object
 * @param {string} data - Data to sign
 * @param {string} privateKeyHex - Hex-encoded private key
 * @param {string} publicKeyHex - Hex-encoded public key
 * @returns {{ data: string, signature: string, publicKey: string, timestamp: string }}
 */
function createSignedMessage(data, privateKeyHex, publicKeyHex) {
  const timestamp = new Date().toISOString();
  const messageToSign = `${data}:${timestamp}`;
  const signature = signMessage(messageToSign, privateKeyHex);
  
  return {
    data,
    signature,
    publicKey: publicKeyHex,
    timestamp,
  };
}

/**
 * Verify a signed message object
 * @param {{ data: string, signature: string, publicKey: string, timestamp: string }} signedMessage
 * @param {number} maxAgeMs - Maximum age in milliseconds (default 5 minutes)
 * @returns {boolean}
 */
function verifySignedMessage(signedMessage, maxAgeMs = 5 * 60 * 1000) {
  const { data, signature, publicKey, timestamp } = signedMessage;
  
  // Check timestamp is recent
  const messageTime = new Date(timestamp).getTime();
  const now = Date.now();
  if (now - messageTime > maxAgeMs) {
    return false;
  }
  
  // Verify signature
  const messageToVerify = `${data}:${timestamp}`;
  return verifySignature(messageToVerify, signature, publicKey);
}

module.exports = {
  generateId,
  generateDID,
  generateApiKey,
  generateVerificationCode,
  sha256,
  generateChallenge,
  generateKeyPair,
  signMessage,
  verifySignature,
  createSignedMessage,
  verifySignedMessage,
};
