const { getAgent, getAuditLog } = require('../lib/storage');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const did = req.query.did;

    if (!did) {
      return res.status(400).json({
        error: 'Missing "did" parameter',
        usage: 'GET /api/audit?did=did:mesh:xxx',
      });
    }

    if (!did.startsWith('did:mesh:')) {
      return res.status(400).json({ error: 'Invalid DID format. Expected: did:mesh:xxx' });
    }

    const agent = await getAgent(did);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const auditLog = await getAuditLog(did);
    const merkleRoot = auditLog.length > 0 ? auditLog[auditLog.length - 1].hash : null;

    return res.status(200).json({
      agent_did: did,
      name: agent.name,
      entry_count: auditLog.length,
      merkle_root: merkleRoot,
      entries: auditLog.slice(-50),
      complete: auditLog.length <= 50,
    });

  } catch (error) {
    console.error('Audit error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
