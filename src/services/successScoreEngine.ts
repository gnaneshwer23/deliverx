/**
 * Delivery Success Score — composite KPI from forecast, health, alignment,
 * and approved estimation confidence.
 */

export type SuccessScoreTier = "healthy" | "watch" | "at-risk";

export type SuccessScoreComponents = {
  timeline: number;
  deliveryConfidence: number;
  health: number;
  alignment: number;
  estimation: number;
};

export type DeliverySuccessScore = {
  score: number;
  tier: SuccessScoreTier;
  components: SuccessScoreComponents;
  factors: string[];
};

export type SuccessScoreInputs = {
  healthScore: number;
  deliveryConfidence: number;
  alignmentScore: number;
  forecastConfidence: number;
  delayDays: number;
  approvedEstimationConfidence: number | null;
};

const WEIGHTS = {
  timeline: 0.3,
  deliveryConfidence: 0.2,
  health: 0.2,
  alignment: 0.2,
  estimation: 0.1,
} as const;

export function computeDeliverySuccessScore(
  inputs: SuccessScoreInputs,
): DeliverySuccessScore {
  const timeline = clamp(
    inputs.forecastConfidence * 100 - Math.min(inputs.delayDays * 2, 40),
    0,
    100,
  );
  const deliveryConfidence = clamp(inputs.deliveryConfidence, 0, 100);
  const health = clamp(inputs.healthScore, 0, 100);
  const alignment = clamp(inputs.alignmentScore, 0, 100);
  const estimation = clamp(inputs.approvedEstimationConfidence ?? 65, 0, 100);

  const score = Math.round(
    timeline * WEIGHTS.timeline +
      deliveryConfidence * WEIGHTS.deliveryConfidence +
      health * WEIGHTS.health +
      alignment * WEIGHTS.alignment +
      estimation * WEIGHTS.estimation,
  );

  const components: SuccessScoreComponents = {
    timeline: Math.round(timeline),
    deliveryConfidence: Math.round(deliveryConfidence),
    health: Math.round(health),
    alignment: Math.round(alignment),
    estimation: Math.round(estimation),
  };

  const factors = buildFactors(inputs, components);

  return {
    score,
    tier: tierFor(score),
    components,
    factors,
  };
}

function buildFactors(
  inputs: SuccessScoreInputs,
  components: SuccessScoreComponents,
): string[] {
  const factors: string[] = [];

  if (inputs.delayDays > 14) {
    factors.push(`Forecast slip of ${inputs.delayDays} days vs plan`);
  } else if (inputs.delayDays > 0) {
    factors.push(`Minor timeline slip (${inputs.delayDays}d)`);
  } else if (components.timeline >= 80) {
    factors.push("Timeline forecast on or ahead of plan");
  }

  if (components.health < 60) factors.push("Delivery health below target");
  if (components.alignment < 70) factors.push("Charter alignment needs attention");
  if (components.deliveryConfidence < 65) {
    factors.push("Delivery confidence under pressure");
  }
  if (inputs.approvedEstimationConfidence == null) {
    factors.push("Role estimates not yet approved");
  } else if (inputs.approvedEstimationConfidence >= 80) {
    factors.push("Strong approved estimation confidence");
  }

  if (factors.length === 0) {
    factors.push("All success score components within range");
  }

  return factors.slice(0, 4);
}

function tierFor(score: number): SuccessScoreTier {
  if (score >= 75) return "healthy";
  if (score >= 55) return "watch";
  return "at-risk";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
