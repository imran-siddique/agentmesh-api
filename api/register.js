const { setAgent, setApiKeyMapping, incrementStat, setTrustScore } = require('../lib/storage');
const { generateDID, generateApiKey, generateVerificationCode, generateKeyPair } = require('../lib/crypto');
const { createInitialTrustScore } = require('../lib/trust');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "name" field' });
    }

    if (!body.sponsor_email || !body.sponsor_email.includes('@')) {
      return res.status(400).json({ error: 'Missing or invalid "sponsor_email" field' });
    }

    const sanitizedName = body.name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
    if (sanitizedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 alphanumeric characters' });
    }

    const did = generateDID(sanitizedName);
    const apiKey = generateApiKey();
    const verificationCode = generateVerificationCode();
    const { publicKey } = generateKeyPair();

    const agent = {
      did,
      name: sanitizedName,
      sponsor_email: body.sponsor_email,
      public_key: publicKey,
      created_at: new Date().toISOString(),
      status: 'pending',
      trust_score: 800,
      moltbook_name: body.moltbook_name,
      capabilities: body.capabilities || ['basic'],
      delegation_depth: 0,
    };

    await setAgent(agent);
    await setApiKeyMapping(apiKey, did);

    const trustScore = createInitialTrustScore();
    await setTrustScore(did, trustScore);

    await incrementStat('registered_agents');

    const verificationUrl = `https://agentmesh-api.vercel.app/verify-sponsor?code=${verificationCode}&did=${did}`;

    return res.status(201).json({
      agent_did: did,
      api_key: apiKey,
      verification_url: verificationUrl,
      verification_code: verificationCode,
      message: `⚠️ SAVE YOUR API KEY! Share the verification URL with your sponsor (${body.sponsor_email}) to activate your agent.`,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
