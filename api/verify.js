const { getAgent, getTrustScore } = require('../lib/storage');

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
        usage: 'GET /api/verify?did=did:mesh:xxx',
      });
    }

    if (!did.startsWith('did:mesh:')) {
      return res.status(400).json({ error: 'Invalid DID format. Expected: did:mesh:xxx' });
    }

    const agent = await getAgent(did);

    if (!agent) {
      return res.status(404).json({
        registered: false,
        error: 'Agent not found in AgentMesh registry',
      });
    }

    const trustScore = await getTrustScore(did);

    return res.status(200).json({
      registered: true,
      agent_did: agent.did,
      name: agent.name,
      trust_score: trustScore?.total || agent.trust_score,
      status: agent.status,
      sponsor: agent.sponsor_email.replace(/(.{2}).*(@.*)/, '$1***$2'),
      capabilities: agent.capabilities,
    });

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
