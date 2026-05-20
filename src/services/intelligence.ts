/**
 * High-level intelligence façade.
 *
 * Bundles the engine + signal loader so RSC pages and API routes can
 * fetch everything they need in one call.
 */

import { loadProjectSignals } from "./projectSignals";
import {
  computeProjectHealth,
  computeDeliveryConfidence,
  generateRecommendations,
  detectDrift,
  topBlockers,
  type Health,
  type Confidence,
  type Recommendation,
} from "./intelligenceEngine";

export type ProjectIntelligence = {
  projectId: string;
  health: Health;
  confidence: Confidence;
  recommendations: Recommendation[];
  drift: string[];
  blockers: string[];
};

export async function getProjectIntelligence(
  projectId: string,
): Promise<ProjectIntelligence> {
  const signals = await loadProjectSignals(projectId);

  return {
    projectId,
    health: computeProjectHealth(signals),
    confidence: computeDeliveryConfidence(signals),
    recommendations: generateRecommendations(signals),
    drift: detectDrift(signals),
    blockers: topBlockers(signals),
  };
}
