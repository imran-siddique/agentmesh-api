/**
 * AgentMesh API - Handshake
 * 
 * POST /api/handshake - Perform IATP trust handshake between agents
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { HandshakeRequest, HandshakeResponse, Agent } from '../lib/types';
import { getAgent, getTrustScore, setTrustScore, incrementStat } from '../lib/storage';
import { verifySignature, signMessage, generateChallenge } from '../lib/crypto';
import { updateTrustScore, meetsTrustThreshold } from '../lib/trust';

interface HandshakeResult {
  verified: boolean;
  trust_score: number;
  tier: string;
  capabilities_granted: string[];
  signature?: string;
  challenge?: string;
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const body = req.body as HandshakeRequest;

    // Validate required fields
    if (!body.agent_did) {
      return res.status(400).json({
        error: 'Missing "agent_did" field',
        code: 'MISSING_DID',
      });
    }

    if (!body.challenge) {
      return res.status(400).json({
        error: 'Missing "challenge" field',
        code: 'MISSING_CHALLENGE',
      });
    }

    // Look up requesting agent
    const agent = await getAgent(body.agent_did);

    if (!agent) {
      const result: HandshakeResult = {
        verified: false,
        trust_score: 0,
        tier: 'Unknown',
        capabilities_granted: [],
        error: 'Agent not registered with AgentMesh',
      };
      return res.status(404).json(result);
    }

    // Check agent status
    if (agent.status === 'suspended') {
      const result: HandshakeResult = {
        verified: false,
        trust_score: agent.trust_score,
        tier: 'Suspended',
        capabilities_granted: [],
        error: 'Agent is suspended',
      };
      return res.status(403).json(result);
    }

    // Get current trust score
    let trustScore = await getTrustScore(body.agent_did);
    if (!trustScore) {
      return res.status(500).json({
        error: 'Trust score not found',
        code: 'MISSING_TRUST_SCORE',
      });
    }

    // Verify signature if provided (optional for basic handshakes)
    let signatureValid = true;
    if (body.signature) {
      signatureValid = verifySignature(body.challenge, body.signature, agent.public_key);
      if (!signatureValid) {
        // Record failed handshake
        trustScore = updateTrustScore(trustScore, { type: 'failed_handshake' });
        await setTrustScore(body.agent_did, trustScore);

        const result: HandshakeResult = {
          verified: false,
          trust_score: trustScore.total,
          tier: trustScore.tier,
          capabilities_granted: [],
          error: 'Signature verification failed',
        };
        return res.status(401).json(result);
      }
    }

    // Calculate capabilities to grant based on trust score and requested capabilities
    const requestedCapabilities = body.capabilities_requested || ['basic'];
    const grantedCapabilities = calculateGrantedCapabilities(trustScore.total, requestedCapabilities);

    // Record successful handshake
    trustScore = updateTrustScore(trustScore, { type: 'successful_handshake' });
    await setTrustScore(body.agent_did, trustScore);
    await incrementStat('handshakes');

    // Generate response signature
    const responseData = `${body.agent_did}:${trustScore.total}:${Date.now()}`;
    const responseSignature = signMessage(responseData);

    // Generate new challenge for next handshake
    const newChallenge = generateChallenge();

    const result: HandshakeResponse = {
      verified: true,
      trust_score: trustScore.total,
      tier: trustScore.tier,
      capabilities_granted: grantedCapabilities,
      signature: responseSignature,
      challenge: newChallenge,
      expires_in: 3600, // 1 hour
      policy_reference: 'https://github.com/imran-siddique/agent-mesh/blob/main/docs/governance-policy.md',
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('Handshake error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Calculate which capabilities to grant based on trust score
 */
function calculateGrantedCapabilities(trustScore: number, requested: string[]): string[] {
  // Define capability tiers
  const capabilityTiers: Record<string, number> = {
    'basic': 0,
    'read': 400,
    'write': 600,
    'execute': 750,
    'delegate': 850,
    'admin': 950,
    'file_read': 500,
    'file_write': 700,
    'network': 600,
    'system': 900,
    'external_api': 650,
    'financial': 900,
  };

  return requested.filter(cap => {
    const requiredScore = capabilityTiers[cap] ?? 750; // Default high for unknown
    return trustScore >= requiredScore;
  });
}
