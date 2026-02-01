/**
 * AgentMesh Types
 * 
 * Core type definitions for the AgentMesh API
 */

export interface Agent {
  did: string;
  name: string;
  sponsor_email: string;
  public_key: string;
  created_at: string;
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  trust_score: number;
  moltbook_name?: string;
  capabilities: string[];
  delegation_depth: number;
  parent_did?: string;
}

export interface AgentRegistration {
  name: string;
  sponsor_email: string;
  capabilities?: string[];
  moltbook_name?: string;
}

export interface RegistrationResponse {
  agent_did: string;
  api_key: string;
  verification_url: string;
  verification_code: string;
  message: string;
}

export interface VerifyResponse {
  registered: boolean;
  agent_did?: string;
  name?: string;
  trust_score?: number;
  status?: string;
  sponsor?: string;
  capabilities?: string[];
  error?: string;
}

export interface HandshakeRequest {
  agent_did: string;
  peer_did: string;
  challenge: string;
  capabilities_requested: string[];
  timestamp: string;
  signature: string;
}

export interface HandshakeResponse {
  verified: boolean;
  peer_did?: string;
  trust_score: number;
  tier?: string;
  capabilities_granted: string[];
  challenge_response?: string;
  challenge?: string;
  signature?: string;
  expires_at?: string;
  expires_in?: number;
  policy_reference?: string;
  error?: string;
}

export interface TrustScore {
  total: number;
  tier: 'Untrusted' | 'Basic' | 'Verified' | 'Trusted' | 'Highly Trusted';
  dimensions: {
    policy_compliance: number;
    resource_efficiency: number;
    output_quality: number;
    security_posture: number;
    collaboration_health: number;
  };
  last_updated: string;
}

export interface AuditEntry {
  id: string;
  agent_did: string;
  event_type: string;
  action: string;
  outcome: 'success' | 'failure' | 'denied';
  timestamp: string;
  hash: string;
  entry_hash: string;
  previous_hash: string;
  data: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

// API Key format: amesh_<random>
export type ApiKey = `amesh_${string}`;

// DID format: did:mesh:<unique_id>
export type AgentDID = `did:mesh:${string}`;
