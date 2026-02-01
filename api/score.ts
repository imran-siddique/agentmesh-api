/**
 * AgentMesh API - Score
 * 
 * GET /api/score/:did - Get detailed trust score breakdown
 * GET /api/score?did=xxx - Alternative query param format
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { TrustScore } from '../lib/types';
import { getAgent, getTrustScore } from '../lib/storage';

interface ScoreResponse {
  agent_did: string;
  name: string;
  total: number;
  tier: string;
  dimensions: TrustScore['dimensions'];
  last_updated: string;
  recommendations?: string[];
}

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
    
    // Handle path parameter (/api/score/did:mesh:xxx)
    if (!did && req.url) {
      const pathMatch = req.url.match(/\/api\/score\/(.+)/);
      if (pathMatch) {
        did = decodeURIComponent(pathMatch[1]);
      }
    }

    if (!did) {
      return res.status(400).json({
        error: 'Missing "did" parameter',
        code: 'MISSING_DID',
        usage: 'GET /api/score/:did or GET /api/score?did=xxx',
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
      return res.status(404).json({
        error: 'Agent not found',
        code: 'NOT_FOUND',
      });
    }

    // Get trust score
    const trustScore = await getTrustScore(did);

    if (!trustScore) {
      return res.status(404).json({
        error: 'Trust score not found',
        code: 'SCORE_NOT_FOUND',
      });
    }

    // Generate recommendations based on weak areas
    const recommendations = generateRecommendations(trustScore);

    const response: ScoreResponse = {
      agent_did: did,
      name: agent.name,
      total: trustScore.total,
      tier: trustScore.tier,
      dimensions: trustScore.dimensions,
      last_updated: trustScore.last_updated,
      recommendations,
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Score error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Generate recommendations based on trust score dimensions
 */
function generateRecommendations(score: TrustScore): string[] {
  const recommendations: string[] = [];
  const threshold = 70;

  if (score.dimensions.policy_compliance < threshold) {
    recommendations.push('Improve policy compliance by following AgentMesh governance guidelines');
  }

  if (score.dimensions.resource_efficiency < threshold) {
    recommendations.push('Optimize resource usage to improve efficiency score');
  }

  if (score.dimensions.output_quality < threshold) {
    recommendations.push('Focus on output quality and accuracy');
  }

  if (score.dimensions.security_posture < threshold) {
    recommendations.push('Enhance security practices and complete security handshakes');
  }

  if (score.dimensions.collaboration_health < threshold) {
    recommendations.push('Engage in more successful inter-agent handshakes');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain current practices to keep your excellent trust score');
  }

  return recommendations;
}
