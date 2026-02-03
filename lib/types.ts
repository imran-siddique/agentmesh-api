/**
 * AgentMesh API Type Definitions
 * TypeScript interfaces for trust verification and agent management
 */

// ============================================================================
// Core Types
// ============================================================================

/** Decentralized Identifier for an agent */
export type AgentDID = `did:mesh:${string}`;

/** API key for authentication */
export type ApiKey = `amesh_${string}`;

/** Trust tier levels */
export type TrustTier = 'Highly Trusted' | 'Trusted' | 'Verified' | 'Basic' | 'Untrusted';

/** Agent status */
export type AgentStatus = 'active' | 'suspended' | 'revoked' | 'pending_verification';

/** Event severity levels */
export type Severity = 'low' | 'medium' | 'high';

// ============================================================================
// Trust Score Types
// ============================================================================

/** Trust score dimensions (each 0-100) */
export interface TrustDimensions {
  /** Compliance with defined policies */
  policy_compliance: number;
  /** Efficient use of resources */
  resource_efficiency: number;
  /** Quality of agent outputs */
  output_quality: number;
  /** Security practices and posture */
  security_posture: number;
  /** Ability to work with other agents */
  collaboration_health: number;
}

/** Complete trust score for an agent */
export interface TrustScore {
  /** Total score (0-1000 scale) */
  total: number;
  /** Human-readable tier */
  tier: TrustTier;
  /** Breakdown by dimension */
  dimensions: TrustDimensions;
  /** ISO timestamp of last update */
  last_updated: string;
}

/** Event that affects trust score */
export interface TrustEvent {
  type: 'policy_violation' | 'successful_handshake' | 'failed_handshake' | 'resource_abuse' | 'output_error';
  severity: Severity;
  details?: string;
  timestamp?: string;
}

// ============================================================================
// Agent Types
// ============================================================================

/** Registered agent in the system */
export interface Agent {
  /** Decentralized identifier */
  did: AgentDID;
  /** Human-readable name */
  name: string;
  /** Description of agent's purpose */
  description?: string;
  /** Email of human sponsor */
  sponsor_email: string;
  /** Declared capabilities */
  capabilities: string[];
  /** Current status */
  status: AgentStatus;
  /** ISO timestamp of registration */
  created_at: string;
  /** ISO timestamp of last activity */
  last_active?: string;
  /** Ed25519 public key (hex encoded) */
  public_key?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Minimal agent info for public responses */
export interface AgentPublic {
  did: AgentDID;
  name: string;
  status: AgentStatus;
  tier: TrustTier;
  created_at: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/** POST /api/register - Register a new agent */
export interface RegisterRequest {
  name: string;
  sponsor_email: string;
  description?: string;
  capabilities?: string[];
  public_key?: string;
}

export interface RegisterResponse {
  success: true;
  agent_did: AgentDID;
  api_key: ApiKey;
  verification_url: string;
  verification_code: string;
}

/** GET /api/verify/:did - Verify an agent */
export interface VerifyResponse {
  registered: boolean;
  did?: AgentDID;
  name?: string;
  sponsor?: string;
  status?: AgentStatus;
  trust_score?: number;
  tier?: TrustTier;
  capabilities?: string[];
  created_at?: string;
}

/** POST /api/handshake - Trust handshake */
export interface HandshakeRequest {
  agent_did: AgentDID;
  challenge: string;
  capabilities_requested?: string[];
  signature?: string;
  public_key?: string;
}

export interface HandshakeResponse {
  success: true;
  verified: boolean;
  agent_did: AgentDID;
  trust_score: number;
  tier: TrustTier;
  capabilities_granted: string[];
  signature: string;
  timestamp: string;
  expires_at: string;
}

/** GET /api/score/:did - Get trust score */
export interface ScoreResponse {
  did: AgentDID;
  total: number;
  tier: TrustTier;
  dimensions: TrustDimensions;
  last_updated: string;
  history?: TrustScoreHistoryEntry[];
}

export interface TrustScoreHistoryEntry {
  timestamp: string;
  total: number;
  event?: string;
}

/** GET /api/audit/:did - Get audit log */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  details: Record<string, unknown>;
  hash: string;
  previous_hash?: string;
}

export interface AuditResponse {
  did: AgentDID;
  entries: AuditLogEntry[];
  total_count: number;
  merkle_root?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Cryptographic Types
// ============================================================================

export interface KeyPair {
  publicKey: string;  // Hex-encoded Ed25519 public key
  privateKey: string; // Hex-encoded Ed25519 private key
}

export interface SignedMessage {
  data: string;
  signature: string;
  publicKey: string;
  timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Pagination parameters */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_cursor?: string;
}

/** Health check response */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services?: Record<string, 'up' | 'down'>;
}
