/**
 * Experience generators — MediFlow (richest) + shared catalogue runtime.
 */

import { scenarioBySlug } from "@/lib/experience-planner/catalog";
import { generateMediFlowExperience, isExperienceSimState } from "@/lib/experience-sim/mediflow";
import { generateFromScenarioDef } from "@/lib/experience-sim/scenario-runtime";
import type { ExperienceSimState } from "@/lib/experience-sim/types";

export type GenerateExperienceInput = {
  userRole?: string;
  personalisedBy?: Record<string, unknown>;
  plannerEmphasis?: "stakeholder" | "delivery" | "discovery" | "balanced";
  planId?: string | null;
  planRationale?: string | null;
  scenarioSlug?: string | null;
};

export function generateExperience(input: GenerateExperienceInput): ExperienceSimState {
  const slug =
    input.scenarioSlug ||
    (typeof input.personalisedBy?.scenarioSlug === "string"
      ? input.personalisedBy.scenarioSlug
      : null) ||
    "mediflow-trustcare";

  const scenario = scenarioBySlug(slug);
  if (!scenario || scenario.engine === "mediflow" || scenario.companyKey === "mediflow") {
    return generateMediFlowExperience({
      userRole: input.userRole,
      personalisedBy: input.personalisedBy,
      plannerEmphasis: input.plannerEmphasis,
      planId: input.planId,
      planRationale: input.planRationale,
    });
  }

  return generateFromScenarioDef(scenario, {
    userRole: input.userRole,
    personalisedBy: input.personalisedBy,
    plannerEmphasis: input.plannerEmphasis ?? scenario.emphasis,
    planId: input.planId,
    planRationale: input.planRationale,
  });
}

export { generateMediFlowExperience, isExperienceSimState, generateFromScenarioDef };
