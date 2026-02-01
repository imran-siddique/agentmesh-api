const { getStat } = require('../lib/storage');

module.exports = async (req, res) => {
  try {
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
        verify: 'GET /api/verify?did=xxx',
        handshake: 'POST /api/handshake',
        score: 'GET /api/score?did=xxx',
        audit: 'GET /api/audit?did=xxx',
      },
      docs: 'https://github.com/imran-siddique/agent-mesh',
      skill: '/skill.md',
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
