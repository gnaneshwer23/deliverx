import { scenarioBySlug } from "@/lib/experience-planner/catalog";
import { generateFromScenarioDef } from "@/lib/experience-sim/scenario-runtime";
import type { ExperienceSimState } from "@/lib/experience-sim/types";
import { EXPERIENCE_STATE_VERSION } from "@/lib/experience-sim/types";

/** Company Generator + Project Generator + Team Generator — MediFlow TrustCare (richest healthcare entry). */
export function generateMediFlowExperience(input: {
  userRole?: string;
  personalisedBy?: Record<string, unknown>;
  /** Phase 3 planner emphasis — reorders coaching + decision salience. */
  plannerEmphasis?: "stakeholder" | "delivery" | "discovery" | "balanced";
  planId?: string | null;
  planRationale?: string | null;
}): ExperienceSimState {
  const scenario = scenarioBySlug("mediflow-trustcare");
  if (!scenario) {
    throw new Error("mediflow-trustcare scenario missing from catalogue");
  }
  return generateFromScenarioDef(scenario, input);
}

export function isExperienceSimState(value: unknown): value is ExperienceSimState {
  if (!value || typeof value !== "object") return false;
  const v = value as { schemaVersion?: number };
  return v.schemaVersion === EXPERIENCE_STATE_VERSION;
}
