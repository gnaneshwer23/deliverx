/**
 * T4 agent registry — Manager / Stakeholder / Observer + consolidated coach personas.
 * Wraps existing Experience / Helm / Interview Lab surfaces; does not duplicate behaviour.
 */

import type { AiAgentAuthority, AiAgentDefinition } from "@/lib/ai-orchestration/types";

const BASE_AUTHORITY: Omit<
  AiAgentAuthority,
  "mayDraftObservation" | "maySuggestIntervention" | "maxTokensPerCall"
> = {
  mayWriteCapability: false,
  mayModifyVerifiedEvidence: false,
  requiresUserConfirmationForActions: true,
};

function authority(
  partial: Pick<AiAgentAuthority, "mayDraftObservation" | "maySuggestIntervention"> & {
    maxTokensPerCall?: number;
  },
): AiAgentAuthority {
  return {
    ...BASE_AUTHORITY,
    mayDraftObservation: partial.mayDraftObservation,
    maySuggestIntervention: partial.maySuggestIntervention,
    maxTokensPerCall: partial.maxTokensPerCall ?? 2048,
  };
}

/**
 * Canonical agent catalogue. Slugs are stable ids used by prompts + ai_interactions.
 */
export const AI_AGENT_CATALOGUE: readonly AiAgentDefinition[] = [
  {
    slug: "line_manager",
    role: "line_manager",
    displayName: "AI Line Manager",
    description:
      "Contextual professional colleague that briefs priorities and next actions for a bound project or activity. Never writes capability or verified evidence.",
    wraps: ["services/aiDeliveryPm", "services/helmCopilot(pm-mission)", "lib/ai/prompts/delivery-pm"],
    authority: authority({ mayDraftObservation: false, maySuggestIntervention: true }),
    defaultPromptSlug: "line_manager_briefing",
    active: true,
  },
  {
    slug: "stakeholder",
    role: "stakeholder",
    displayName: "AI Stakeholder",
    description:
      "Represents stakeholder pressure and questions grounded in project context. Experience-sim stakeholder personas consolidate here for LLM turns.",
    wraps: [
      "experience-sim personas (kind=stakeholder)",
      "lib/ai/prompts/product-manager",
      "lib/ai/prompts/founder",
    ],
    authority: authority({ mayDraftObservation: false, maySuggestIntervention: false }),
    defaultPromptSlug: "stakeholder_perspective",
    active: true,
  },
  {
    slug: "observer",
    role: "observer",
    displayName: "AI Observer",
    description:
      "Drafts workspace observations under consent. Observation ≠ evidence; never auto-verifies.",
    wraps: ["lib/workspace-observation", "pi_interventions drafts"],
    authority: authority({ mayDraftObservation: true, maySuggestIntervention: true }),
    defaultPromptSlug: "observer_draft",
    active: true,
  },
  {
    slug: "experience_coach",
    role: "coach",
    displayName: "Experience Coach",
    description:
      "Registry entry for Experience simulation coaching hints (engines.ts / scenario runtime). Deterministic engines remain primary; LLM path uses this agent when invoked.",
    wraps: ["lib/experience-sim", "lib/experience-planner"],
    authority: authority({
      mayDraftObservation: false,
      maySuggestIntervention: true,
      maxTokensPerCall: 1024,
    }),
    defaultPromptSlug: "experience_coach_hint",
    active: true,
  },
  {
    slug: "workspace_coach",
    role: "coach",
    displayName: "Workspace Coach",
    description:
      "Consolidates delivery coach suggestions and Helm persona copilots (ba/product/engineer/scrum/qa/founder).",
    wraps: ["services/deliveryCoach", "services/helmCopilot", "lib/ai/prompts/helm-copilot"],
    authority: authority({ mayDraftObservation: false, maySuggestIntervention: true }),
    defaultPromptSlug: "workspace_coach_hint",
    active: true,
  },
  {
    slug: "interview_lab",
    role: "coach",
    displayName: "Interview Lab Coach",
    description:
      "Career Intelligence interview rehearsal coach — evidence-cited STAR practice. Does not invent Verified badges.",
    wraps: ["lib/career-intelligence", "/launchpad/app/interview"],
    authority: authority({
      mayDraftObservation: false,
      maySuggestIntervention: true,
      maxTokensPerCall: 1536,
    }),
    defaultPromptSlug: "interview_lab_hint",
    active: true,
  },
] as const;

const bySlug = new Map(AI_AGENT_CATALOGUE.map((a) => [a.slug, a]));

export function getAgent(slug: string): AiAgentDefinition | null {
  return bySlug.get(slug) ?? null;
}

export function listAgents(options?: { activeOnly?: boolean }): AiAgentDefinition[] {
  const all = [...AI_AGENT_CATALOGUE];
  if (options?.activeOnly === false) return all;
  return all.filter((a) => a.active);
}

export function listAgentsByRole(role: AiAgentDefinition["role"]): AiAgentDefinition[] {
  return AI_AGENT_CATALOGUE.filter((a) => a.active && a.role === role);
}

export function requireAgent(slug: string): AiAgentDefinition {
  const agent = getAgent(slug);
  if (!agent || !agent.active) {
    throw new Error(`Unknown or inactive AI agent: ${slug}`);
  }
  return agent;
}
