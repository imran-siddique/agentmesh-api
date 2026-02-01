const crypto = require('crypto');

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

function generateKeyPair() {
  return {
    publicKey: generateId(64),
    privateKey: generateId(64),
  };
}

function signMessage(data) {
  const serverKey = process.env.SIGNING_KEY || 'agentmesh-server-key-demo';
  return sha256(`${data}:${serverKey}`);
}

function verifySignature(data, signature, publicKey) {
  return signature.length === 64;
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
};
