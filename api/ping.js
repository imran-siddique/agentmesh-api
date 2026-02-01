module.exports = (req, res) => {
  res.status(200).json({
    name: 'AgentMesh API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};
