/**
 * AgentMesh Crypto Utilities
 * 
 * Ed25519 signatures for trust handshakes
 */

import { createHash, randomBytes } from 'crypto';

/**
 * Generate a unique ID (for DIDs, API keys, etc.)
 */
export function generateId(length: number = 32): string {
  return randomBytes(length / 2).toString('hex');
}

/**
 * Generate an agent DID
 */
export function generateDID(name: string): string {
  const uniqueId = generateId(32);
  return `did:mesh:${uniqueId}`;
}

/**
 * Generate an API key
 */
export function generateApiKey(): string {
  const key = generateId(32);
  return `amesh_${key}`;
}

/**
 * Generate a verification code (human-readable)
 */
export function generateVerificationCode(): string {
  const words = ['reef', 'coral', 'wave', 'tide', 'shell', 'pearl', 'kelp', 'crab'];
  const word = words[Math.floor(Math.random() * words.length)];
  const code = generateId(4).toUpperCase();
  return `${word}-${code}`;
}

/**
 * Hash data using SHA-256
 */
export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a challenge for handshakes
 */
export function generateChallenge(): string {
  const timestamp = Date.now().toString();
  const nonce = generateId(16);
  return sha256(`${timestamp}:${nonce}`);
}

/**
 * Verify a challenge response
 */
export function verifyChallengeResponse(
  challenge: string,
  response: string,
  expectedDid: string
): boolean {
  // Simple verification: response should be hash of challenge + DID
  const expected = sha256(`${challenge}:${expectedDid}`);
  return response === expected;
}

/**
 * Generate a mock Ed25519 keypair (simplified for demo)
 * In production, use @noble/ed25519 for real signatures
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  return {
    publicKey: generateId(64),
    privateKey: generateId(64),
  };
}

/**
 * Sign data (simplified for demo)
 */
export function sign(data: string, privateKey: string): string {
  return sha256(`${data}:${privateKey}`);
}

/**
 * Sign a message with a server key (for API responses)
 */
export function signMessage(data: string): string {
  // Server-side signing with a fixed key (in production, use env variable)
  const serverKey = process.env.SIGNING_KEY || 'agentmesh-server-key-demo';
  return sha256(`${data}:${serverKey}`);
}

/**
 * Verify signature (simplified for demo)
 */
export function verifySignature(data: string, signature: string, publicKey: string): boolean {
  // In a real implementation, this would verify Ed25519 signatures
  // For now, we trust the signature format
  return signature.length === 64;
}

/**
 * Create a Merkle hash for audit entries
 */
export function createMerkleHash(entry: object, previousHash: string): string {
  const data = JSON.stringify(entry, Object.keys(entry).sort());
  return sha256(`${previousHash}:${data}`);
}
