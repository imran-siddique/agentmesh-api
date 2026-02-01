function createInitialTrustScore() {
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

function calculateTotalScore(dimensions) {
  const weights = {
    policy_compliance: 0.25,
    resource_efficiency: 0.15,
    output_quality: 0.20,
    security_posture: 0.25,
    collaboration_health: 0.15,
  };

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += dimensions[key] * weight * 10;
  }

  return Math.round(total);
}

function getTier(total) {
  if (total >= 900) return 'Highly Trusted';
  if (total >= 750) return 'Trusted';
  if (total >= 600) return 'Verified';
  if (total >= 400) return 'Basic';
  return 'Untrusted';
}

function updateTrustScore(current, event) {
  const dimensions = { ...current.dimensions };
  const severityMultiplier = event.severity === 'high' ? 3 : event.severity === 'medium' ? 2 : 1;

  switch (event.type) {
    case 'policy_violation':
      dimensions.policy_compliance = Math.max(0, dimensions.policy_compliance - 5 * severityMultiplier);
      dimensions.security_posture = Math.max(0, dimensions.security_posture - 2 * severityMultiplier);
      break;
    case 'successful_handshake':
      dimensions.collaboration_health = Math.min(100, dimensions.collaboration_health + 2);
      dimensions.security_posture = Math.min(100, dimensions.security_posture + 1);
      break;
    case 'failed_handshake':
      dimensions.collaboration_health = Math.max(0, dimensions.collaboration_health - 3);
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

module.exports = {
  createInitialTrustScore,
  calculateTotalScore,
  getTier,
  updateTrustScore,
};
