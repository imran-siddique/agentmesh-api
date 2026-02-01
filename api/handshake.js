const { getAgent, getTrustScore, setTrustScore, incrementStat } = require('../lib/storage');
const { verifySignature, signMessage, generateChallenge } = require('../lib/crypto');
const { updateTrustScore } = require('../lib/trust');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    if (!body.agent_did) {
      return res.status(400).json({ error: 'Missing "agent_did" field' });
    }

    if (!body.challenge) {
      return res.status(400).json({ error: 'Missing "challenge" field' });
    }

    const agent = await getAgent(body.agent_did);

    if (!agent) {
      return res.status(404).json({
        verified: false,
        trust_score: 0,
        tier: 'Unknown',
        capabilities_granted: [],
        error: 'Agent not registered with AgentMesh',
      });
    }

    if (agent.status === 'suspended') {
      return res.status(403).json({
        verified: false,
        trust_score: agent.trust_score,
        tier: 'Suspended',
        capabilities_granted: [],
        error: 'Agent is suspended',
      });
    }

    let trustScore = await getTrustScore(body.agent_did);
    if (!trustScore) {
      return res.status(500).json({ error: 'Trust score not found' });
    }

    // Verify signature if provided
    let signatureValid = true;
    if (body.signature) {
      signatureValid = verifySignature(body.challenge, body.signature, agent.public_key);
      if (!signatureValid) {
        trustScore = updateTrustScore(trustScore, { type: 'failed_handshake' });
        await setTrustScore(body.agent_did, trustScore);
        return res.status(401).json({
          verified: false,
          trust_score: trustScore.total,
          tier: trustScore.tier,
          capabilities_granted: [],
          error: 'Signature verification failed',
        });
      }
    }

    // Calculate granted capabilities
    const requestedCapabilities = body.capabilities_requested || ['basic'];
    const capabilityTiers = {
      'basic': 0, 'read': 400, 'write': 600, 'execute': 750,
      'delegate': 850, 'admin': 950, 'file_read': 500, 'file_write': 700,
    };
    const grantedCapabilities = requestedCapabilities.filter(cap => {
      const requiredScore = capabilityTiers[cap] ?? 750;
      return trustScore.total >= requiredScore;
    });

    // Record successful handshake
    trustScore = updateTrustScore(trustScore, { type: 'successful_handshake' });
    await setTrustScore(body.agent_did, trustScore);
    await incrementStat('handshakes');

    const responseData = `${body.agent_did}:${trustScore.total}:${Date.now()}`;
    const responseSignature = signMessage(responseData);
    const newChallenge = generateChallenge();

    return res.status(200).json({
      verified: true,
      trust_score: trustScore.total,
      tier: trustScore.tier,
      capabilities_granted: grantedCapabilities,
      signature: responseSignature,
      challenge: newChallenge,
      expires_in: 3600,
      policy_reference: 'https://github.com/imran-siddique/agent-mesh/blob/main/docs/governance-policy.md',
    });

  } catch (error) {
    console.error('Handshake error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
