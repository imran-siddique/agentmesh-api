/**
 * AgentMesh Trust Scoring
 * 
 * Calculate and manage trust scores for agents
 */

import type { TrustScore } from './types';

/**
 * Default trust score for new agents
 */
export function createInitialTrustScore(): TrustScore {
  return {
    total: 800,
    tier: 'Verified',
    dimensions: {
      policy_compliance: 80,
      resource_efficiency: 80,
      output_quality: 80,
      security_posture: 80,
      collaboration_health: 80,
    },
    last_updated: new Date().toISOString(),
  };
}

/**
 * Calculate total score from dimensions
 */
export function calculateTotalScore(dimensions: TrustScore['dimensions']): number {
  const weights = {
    policy_compliance: 0.25,
    resource_efficiency: 0.15,
    output_quality: 0.20,
    security_posture: 0.25,
    collaboration_health: 0.15,
  };

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += dimensions[key as keyof typeof dimensions] * weight * 10;
  }

  return Math.round(total);
}

/**
 * Determine trust tier from total score
 */
export function getTier(total: number): TrustScore['tier'] {
  if (total >= 900) return 'Highly Trusted';
  if (total >= 750) return 'Trusted';
  if (total >= 600) return 'Verified';
  if (total >= 400) return 'Basic';
  return 'Untrusted';
}

/**
 * Update trust score based on an event
 */
export function updateTrustScore(
  current: TrustScore,
  event: {
    type: 'policy_violation' | 'policy_compliance' | 'successful_handshake' | 'failed_handshake' | 'good_behavior' | 'bad_behavior';
    severity?: 'low' | 'medium' | 'high';
  }
): TrustScore {
  const dimensions = { ...current.dimensions };
  const severityMultiplier = event.severity === 'high' ? 3 : event.severity === 'medium' ? 2 : 1;

  switch (event.type) {
    case 'policy_violation':
      dimensions.policy_compliance = Math.max(0, dimensions.policy_compliance - 5 * severityMultiplier);
      dimensions.security_posture = Math.max(0, dimensions.security_posture - 2 * severityMultiplier);
      break;

    case 'policy_compliance':
      dimensions.policy_compliance = Math.min(100, dimensions.policy_compliance + 1);
      break;

    case 'successful_handshake':
      dimensions.collaboration_health = Math.min(100, dimensions.collaboration_health + 2);
      dimensions.security_posture = Math.min(100, dimensions.security_posture + 1);
      break;

    case 'failed_handshake':
      dimensions.collaboration_health = Math.max(0, dimensions.collaboration_health - 3);
      break;

    case 'good_behavior':
      dimensions.output_quality = Math.min(100, dimensions.output_quality + 1);
      dimensions.resource_efficiency = Math.min(100, dimensions.resource_efficiency + 1);
      break;

    case 'bad_behavior':
      dimensions.output_quality = Math.max(0, dimensions.output_quality - 3 * severityMultiplier);
      break;
  }

  const total = calculateTotalScore(dimensions);

  return {
    total,
    tier: getTier(total),
    dimensions,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Check if trust score meets a threshold
 */
export function meetsTrustThreshold(score: TrustScore, threshold: number): boolean {
  return score.total >= threshold;
}

/**
 * Format trust score for display
 */
export function formatTrustScore(score: TrustScore): string {
  return `${score.total}/1000 (${score.tier})`;
}
