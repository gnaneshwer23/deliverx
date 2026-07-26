/**
 * T4 — AI orchestration trust layer types.
 * Intelligence belongs to the platform; agents consume structured context only.
 */

export const AI_AGENT_ROLES = [
  "line_manager",
  "stakeholder",
  "observer",
  "coach",
] as const;

export type AiAgentRole = (typeof AI_AGENT_ROLES)[number];

export const AI_BOUND_SURFACES = [
  "project",
  "task",
  "meeting",
  "evidence",
  "observation",
  "career_goal",
  "experience",
  "interview",
  "workspace",
  "artefact",
  "assessment",
  "other",
] as const;

export type AiBoundSurface = (typeof AI_BOUND_SURFACES)[number];

export const AI_INTERACTION_STATUSES = [
  "ok",
  "validation_failed",
  "blocked",
  "error",
  "fallback",
] as const;

export type AiInteractionStatus = (typeof AI_INTERACTION_STATUSES)[number];

/** Authority boundaries — never elevate observation to verified evidence. */
export type AiAgentAuthority = {
  /** Agents never write Capability Engine state (ScoreRun-only). */
  mayWriteCapability: false;
  /** Agents never flip evidence to verified / platform_verified. */
  mayModifyVerifiedEvidence: false;
  /** Observer may draft observations (consent-gated elsewhere). */
  mayDraftObservation: boolean;
  /** May suggest interventions / coaching actions. */
  maySuggestIntervention: boolean;
  /** Consequential actions always need explicit user confirmation. */
  requiresUserConfirmationForActions: boolean;
  /** Max estimated tokens per call (cost cap). */
  maxTokensPerCall: number;
};

export type AiAgentDefinition = {
  slug: string;
  role: AiAgentRole;
  displayName: string;
  description: string;
  /** Existing surface this agent consolidates (do not duplicate). */
  wraps: string[];
  authority: AiAgentAuthority;
  defaultPromptSlug: string;
  active: boolean;
};

export type AiPromptVersionDefinition = {
  agentSlug: string;
  promptSlug: string;
  version: string;
  /** System instructions — never mix organisation data here. */
  systemTemplate: string;
  /** Optional user-turn template; context is injected separately. */
  userTemplate: string | null;
  /** Output contract id (see output-contracts). */
  outputContract: string;
  promptHash: string;
};

export type AiContextSource = {
  kind:
    | "system_instruction"
    | "org_snapshot"
    | "project"
    | "evidence_citation"
    | "framework_pin"
    | "observation"
    | "career_goal"
    | "experience_state"
    | "user_message"
    | "other";
  ref?: string;
  summary: string;
};

export type AiStructuredContext = {
  /** Bound activity — chat is never the primary DB. */
  boundSurface: AiBoundSurface;
  boundRef: Record<string, unknown>;
  sources: AiContextSource[];
  /** Organisation / project facts retrieved at request time. */
  organisationData: Record<string, unknown>;
  /** Evidence / PI citations (ids + short labels only). */
  evidenceCitations: Array<{ evidenceId: string; label: string }>;
  /** Framework pin when agents must cite rubric (T2). */
  frameworkPin: { frameworkVersionId: string | null; code: string | null } | null;
  /** Short user turn (not full conversation history). */
  userMessage: string;
};

/**
 * Structured citation an agent must attach to any material observation,
 * recommendation, or organisation/project claim. `sourceId` MUST resolve to a
 * context source supplied to the same `runAgent` call — fabricated ids fail
 * validation (see `citations.ts`).
 */
export const AI_CITATION_SOURCE_TYPES = [
  "evidence",
  "project",
  "observation",
  "framework",
  "org_snapshot",
  "career_goal",
  "experience_state",
  "artefact",
  "assessment",
  "task",
  "meeting",
  "other",
] as const;

export type AiCitationSourceType = (typeof AI_CITATION_SOURCE_TYPES)[number];

export type AiCitation = {
  sourceType: AiCitationSourceType;
  /** Must match an id present in the run's structured context. */
  sourceId: string;
  /** Optional short quote grounding the claim (never confidential raw evidence). */
  excerpt?: string;
  /** Optional integrity hash of the cited source snapshot. */
  hash?: string;
  /** Optional human label carried through for UI (not trusted for validation). */
  label?: string;
};

export function isAiCitationSourceType(v: string): v is AiCitationSourceType {
  return (AI_CITATION_SOURCE_TYPES as readonly string[]).includes(v);
}

export type AiUsageMetrics = {
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costEstimateUsd: number | null;
  model: string;
  provider: string | null;
};

export type AiInteractionRecord = {
  id: string;
  userId: string;
  agentSlug: string;
  promptSlug: string;
  promptVersion: string;
  model: string;
  provider: string | null;
  status: AiInteractionStatus;
  boundSurface: AiBoundSurface;
  boundRef: Record<string, unknown>;
  contextSources: AiContextSource[];
  inputHash: string;
  outputHash: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  costEstimateUsd: number | null;
  output: Record<string, unknown> | null;
  errorMessage: string | null;
  requiresConfirmation: boolean;
  confirmationGranted: boolean;
  createdAt: string;
};

export const AI_ORCHESTRATION_EVENT = {
  interactionLogged: "ai.interaction.logged",
  interactionBlocked: "ai.interaction.blocked",
} as const;

export function isAiAgentRole(v: string): v is AiAgentRole {
  return (AI_AGENT_ROLES as readonly string[]).includes(v);
}

export function isAiBoundSurface(v: string): v is AiBoundSurface {
  return (AI_BOUND_SURFACES as readonly string[]).includes(v);
}
