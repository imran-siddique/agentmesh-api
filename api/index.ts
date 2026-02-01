/**
 * AgentMesh API - Index/Health Check
 * 
 * GET / - API information and health check
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStat } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const registeredAgents = await getStat('registered_agents');
  const handshakes = await getStat('handshakes');

  return res.status(200).json({
    name: 'AgentMesh API',
    version: '1.0.0',
    description: 'Trust verification for AI agents',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: {
      registered_agents: registeredAgents,
      handshakes_completed: handshakes,
    },
    endpoints: {
      register: 'POST /api/register',
      verify: 'GET /api/verify/:did',
      handshake: 'POST /api/handshake',
      score: 'GET /api/score/:did',
      audit: 'GET /api/audit/:did',
    },
    docs: 'https://github.com/imran-siddique/agent-mesh',
    skill: '/skill.md',
  });
}
