/**
 * AgentMesh API - Verify
 * 
 * GET /api/verify/:did - Check if an agent is registered and get trust info
 * GET /api/verify?did=xxx - Alternative query param format
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { VerifyResponse } from '../lib/types';
import { getAgent, getTrustScore } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    // Get DID from path or query
    let did = req.query.did as string;
    
    // Handle path parameter (/api/verify/did:mesh:xxx)
    if (!did && req.url) {
      const pathMatch = req.url.match(/\/api\/verify\/(.+)/);
      if (pathMatch) {
        did = decodeURIComponent(pathMatch[1]);
      }
    }

    if (!did) {
      return res.status(400).json({
        error: 'Missing "did" parameter',
        code: 'MISSING_DID',
        usage: 'GET /api/verify/:did or GET /api/verify?did=xxx',
      });
    }

    // Validate DID format
    if (!did.startsWith('did:mesh:')) {
      return res.status(400).json({
        error: 'Invalid DID format. Expected: did:mesh:xxx',
        code: 'INVALID_DID_FORMAT',
      });
    }

    // Look up agent
    const agent = await getAgent(did);

    if (!agent) {
      const response: VerifyResponse = {
        registered: false,
        error: 'Agent not found in AgentMesh registry',
      };
      return res.status(404).json(response);
    }

    // Get trust score
    const trustScore = await getTrustScore(did);

    const response: VerifyResponse = {
      registered: true,
      agent_did: agent.did,
      name: agent.name,
      trust_score: trustScore?.total || agent.trust_score,
      status: agent.status,
      sponsor: agent.sponsor_email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially hide email
      capabilities: agent.capabilities,
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
