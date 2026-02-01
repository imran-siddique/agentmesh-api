/**
 * AgentMesh Storage
 * 
 * Storage layer using Vercel KV (Redis)
 * Falls back to in-memory store for development
 */

import type { Agent, AuditEntry, TrustScore } from './types';

// In-memory fallback for development (when KV is not available)
const memoryStore: Map<string, string> = new Map();

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Get a value from storage
 */
export async function get<T>(key: string): Promise<T | null> {
  if (isKVAvailable()) {
    // Use Vercel KV
    const { kv } = await import('@vercel/kv');
    return kv.get<T>(key);
  } else {
    // Fallback to memory
    const value = memoryStore.get(key);
    return value ? JSON.parse(value) : null;
  }
}

/**
 * Set a value in storage
 */
export async function set<T>(key: string, value: T, options?: { ex?: number }): Promise<void> {
  if (isKVAvailable()) {
    const { kv } = await import('@vercel/kv');
    if (options?.ex) {
      await kv.set(key, value, { ex: options.ex });
    } else {
      await kv.set(key, value);
    }
  } else {
    memoryStore.set(key, JSON.stringify(value));
  }
}

/**
 * Delete a value from storage
 */
export async function del(key: string): Promise<void> {
  if (isKVAvailable()) {
    const { kv } = await import('@vercel/kv');
    await kv.del(key);
  } else {
    memoryStore.delete(key);
  }
}

/**
 * Check if a key exists
 */
export async function exists(key: string): Promise<boolean> {
  if (isKVAvailable()) {
    const { kv } = await import('@vercel/kv');
    return (await kv.exists(key)) > 0;
  } else {
    return memoryStore.has(key);
  }
}

// Agent-specific operations

export async function getAgent(did: string): Promise<Agent | null> {
  return get<Agent>(`agent:${did}`);
}

export async function setAgent(agent: Agent): Promise<void> {
  await set(`agent:${agent.did}`, agent);
  // Also index by API key for auth lookups
  if (agent.did) {
    await set(`apikey:${agent.did}`, agent.did);
  }
}

export async function getAgentByApiKey(apiKey: string): Promise<Agent | null> {
  const did = await get<string>(`apikey:${apiKey}`);
  if (!did) return null;
  return getAgent(did);
}

export async function setApiKeyMapping(apiKey: string, did: string): Promise<void> {
  await set(`apikey:${apiKey}`, did);
}

// Trust score operations

export async function getTrustScore(did: string): Promise<TrustScore | null> {
  return get<TrustScore>(`score:${did}`);
}

export async function setTrustScore(did: string, score: TrustScore): Promise<void> {
  await set(`score:${did}`, score);
}

// Audit log operations (simple append-only for now)

export async function appendAuditEntry(entry: AuditEntry): Promise<void> {
  const key = `audit:${entry.agent_did}:${entry.id}`;
  await set(key, entry);
  
  // Also add to agent's audit index
  const indexKey = `audit-index:${entry.agent_did}`;
  const index = await get<string[]>(indexKey) || [];
  index.push(entry.id);
  await set(indexKey, index);
}

export async function getAuditEntries(did: string, limit: number = 50): Promise<AuditEntry[]> {
  const indexKey = `audit-index:${did}`;
  const index = await get<string[]>(indexKey) || [];
  
  const entries: AuditEntry[] = [];
  const recentIds = index.slice(-limit);
  
  for (const id of recentIds) {
    const entry = await get<AuditEntry>(`audit:${did}:${id}`);
    if (entry) entries.push(entry);
  }
  
  return entries;
}

// Alias for audit log
export async function getAuditLog(did: string, limit: number = 50): Promise<AuditEntry[]> {
  return getAuditEntries(did, limit);
}

// Statistics

export async function incrementStat(stat: string): Promise<void> {
  const key = `stats:${stat}`;
  const current = await get<number>(key) || 0;
  await set(key, current + 1);
}

export async function getStat(stat: string): Promise<number> {
  return await get<number>(`stats:${stat}`) || 0;
}
