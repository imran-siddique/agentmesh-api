/**
 * AgentMesh API - Register
 * 
 * POST /api/register - Register a new agent with AgentMesh
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Agent, AgentRegistration, RegistrationResponse } from '../lib/types';
import { setAgent, setApiKeyMapping, incrementStat, getAgent } from '../lib/storage';
import { generateDID, generateApiKey, generateVerificationCode, generateKeyPair } from '../lib/crypto';
import { createInitialTrustScore } from '../lib/trust';
import { setTrustScore } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const body = req.body as AgentRegistration;

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "name" field',
        code: 'INVALID_NAME',
      });
    }

    if (!body.sponsor_email || !body.sponsor_email.includes('@')) {
      return res.status(400).json({
        error: 'Missing or invalid "sponsor_email" field',
        code: 'INVALID_SPONSOR',
      });
    }

    // Sanitize name (alphanumeric, hyphens, underscores only)
    const sanitizedName = body.name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
    if (sanitizedName.length < 2) {
      return res.status(400).json({
        error: 'Name must be at least 2 alphanumeric characters',
        code: 'NAME_TOO_SHORT',
      });
    }

    // Generate credentials
    const did = generateDID(sanitizedName);
    const apiKey = generateApiKey();
    const verificationCode = generateVerificationCode();
    const { publicKey } = generateKeyPair();

    // Create agent record
    const agent: Agent = {
      did,
      name: sanitizedName,
      sponsor_email: body.sponsor_email,
      public_key: publicKey,
      created_at: new Date().toISOString(),
      status: 'pending', // Pending until sponsor verification
      trust_score: 800,
      moltbook_name: body.moltbook_name,
      capabilities: body.capabilities || ['basic'],
      delegation_depth: 0,
    };

    // Store agent
    await setAgent(agent);
    await setApiKeyMapping(apiKey, did);

    // Create initial trust score
    const trustScore = createInitialTrustScore();
    await setTrustScore(did, trustScore);

    // Update stats
    await incrementStat('registered_agents');

    // Generate verification URL
    const verificationUrl = `https://agentmesh-api.vercel.app/verify-sponsor?code=${verificationCode}&did=${did}`;

    const response: RegistrationResponse = {
      agent_did: did,
      api_key: apiKey,
      verification_url: verificationUrl,
      verification_code: verificationCode,
      message: `⚠️ SAVE YOUR API KEY! Share the verification URL with your sponsor (${body.sponsor_email}) to activate your agent.`,
    };

    return res.status(201).json(response);

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
