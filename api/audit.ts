/**
 * AgentMesh API - Audit
 * 
 * GET /api/audit/:did - Get audit log for an agent
 * GET /api/audit?did=xxx - Alternative query param format
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAgent, getAuditLog } from '../lib/storage';

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
    
    // Handle path parameter (/api/audit/did:mesh:xxx)
    if (!did && req.url) {
      const pathMatch = req.url.match(/\/api\/audit\/(.+)/);
      if (pathMatch) {
        did = decodeURIComponent(pathMatch[1]);
      }
    }

    if (!did) {
      return res.status(400).json({
        error: 'Missing "did" parameter',
        code: 'MISSING_DID',
        usage: 'GET /api/audit/:did or GET /api/audit?did=xxx',
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

    // Get audit log
    const auditLog = await getAuditLog(did);

    // Calculate Merkle root from entries
    const merkleRoot = auditLog.length > 0 
      ? auditLog[auditLog.length - 1].hash 
      : null;

    return res.status(200).json({
      agent_did: did,
      name: agent.name,
      entry_count: auditLog.length,
      merkle_root: merkleRoot,
      entries: auditLog.slice(-50), // Return last 50 entries
      complete: auditLog.length <= 50,
    });

  } catch (error) {
    console.error('Audit error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
