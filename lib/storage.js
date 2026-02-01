// In-memory store (resets on each deploy)
const memoryStore = new Map();

// Storage functions
async function get(key) {
  const value = memoryStore.get(key);
  return value ? JSON.parse(value) : null;
}

async function set(key, value) {
  memoryStore.set(key, JSON.stringify(value));
}

async function getStat(stat) {
  return await get(`stats:${stat}`) || 0;
}

async function incrementStat(stat) {
  const current = await getStat(stat);
  await set(`stats:${stat}`, current + 1);
}

async function getAgent(did) {
  return get(`agent:${did}`);
}

async function setAgent(agent) {
  await set(`agent:${agent.did}`, agent);
}

async function setApiKeyMapping(apiKey, did) {
  await set(`apikey:${apiKey}`, did);
}

async function getTrustScore(did) {
  return get(`score:${did}`);
}

async function setTrustScore(did, score) {
  await set(`score:${did}`, score);
}

async function getAuditLog(did) {
  const indexKey = `audit-index:${did}`;
  const index = await get(indexKey) || [];
  const entries = [];
  for (const id of index.slice(-50)) {
    const entry = await get(`audit:${did}:${id}`);
    if (entry) entries.push(entry);
  }
  return entries;
}

module.exports = {
  get,
  set,
  getStat,
  incrementStat,
  getAgent,
  setAgent,
  setApiKeyMapping,
  getTrustScore,
  setTrustScore,
  getAuditLog,
};
