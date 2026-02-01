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
        usage: 'GET /api/score?did=did:mesh:xxx',
      });
    }

    if (!did.startsWith('did:mesh:')) {
      return res.status(400).json({ error: 'Invalid DID format. Expected: did:mesh:xxx' });
    }

    const agent = await getAgent(did);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const trustScore = await getTrustScore(did);
    if (!trustScore) {
      return res.status(404).json({ error: 'Trust score not found' });
    }

    // Generate recommendations
    const recommendations = [];
    const threshold = 70;
    if (trustScore.dimensions.policy_compliance < threshold) {
      recommendations.push('Improve policy compliance by following AgentMesh governance guidelines');
    }
    if (trustScore.dimensions.security_posture < threshold) {
      recommendations.push('Enhance security practices and complete security handshakes');
    }
    if (trustScore.dimensions.collaboration_health < threshold) {
      recommendations.push('Engage in more successful inter-agent handshakes');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current practices to keep your excellent trust score');
    }

    return res.status(200).json({
      agent_did: did,
      name: agent.name,
      total: trustScore.total,
      tier: trustScore.tier,
      dimensions: trustScore.dimensions,
      last_updated: trustScore.last_updated,
      recommendations,
    });

  } catch (error) {
    console.error('Score error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
