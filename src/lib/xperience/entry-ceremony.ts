/**
 * B6 — Xperience entry ceremony (FR-005 remainder / FLOW-XP-ENTRY / PACK-E4).
 *
 * A calm, narrative entry into the already-generated simulated company:
 * company welcome → role → team → project → first activity. This is UX depth
 * around the existing Day-1 Experience loop. It derives everything from the
 * ExperienceSimState the planner/sim already produced — it invents no scores,
 * writes no capability, creates no evidence and never lights Verified. Evidence
 * is only recorded once the candidate acts inside the workspace.
 *
 * Rollout is a kill-switch that defaults ON so the ceremony ships with the
 * Experience entry. Set DELIVERX_XP_ENTRY_CEREMONY=off to roll back to the
 * previous direct-to-dashboard behaviour with no redeploy and no data change.
 */

import type { ExperienceSimState } from "@/lib/experience-sim/types";

export const XP_ENTRY_CEREMONY_VERSION = "xp-entry-ceremony@2026.1";

export const CEREMONY_STEP_IDS = [
  "company",
  "role",
  "team",
  "project",
  "first_activity",
] as const;

export type CeremonyStepId = (typeof CEREMONY_STEP_IDS)[number];

export type CeremonyStatus = "in_progress" | "completed" | "skipped";

export type CeremonyStepMeta = {
  id: CeremonyStepId;
  /** Short uppercase eyebrow shown above the step title. */
  eyebrow: string;
  /** Stepper label. */
  label: string;
};

export const CEREMONY_STEPS: readonly CeremonyStepMeta[] = [
  { id: "company", eyebrow: "Your company", label: "Company welcome" },
  { id: "role", eyebrow: "Your role", label: "Your role" },
  { id: "team", eyebrow: "Your team", label: "Meet the team" },
  { id: "project", eyebrow: "Your project", label: "The project" },
  { id: "first_activity", eyebrow: "Your first move", label: "First activity" },
] as const;

export type CeremonyState = {
  index: number;
  status: CeremonyStatus;
  /** Step ids the candidate has reached (for progress + honest analytics). */
  visited: CeremonyStepId[];
};

export function isCeremonyStepId(value: unknown): value is CeremonyStepId {
  return (
    typeof value === "string" &&
    (CEREMONY_STEP_IDS as readonly string[]).includes(value)
  );
}

export function ceremonyStepAt(index: number): CeremonyStepId {
  const clamped = Math.min(Math.max(index, 0), CEREMONY_STEPS.length - 1);
  return CEREMONY_STEPS[clamped].id;
}

export function ceremonyStepIndex(stepId: CeremonyStepId): number {
  return CEREMONY_STEPS.findIndex((step) => step.id === stepId);
}

export function createCeremonyState(): CeremonyState {
  return { index: 0, status: "in_progress", visited: ["company"] };
}

export function isFirstCeremonyStep(state: CeremonyState): boolean {
  return state.index <= 0;
}

export function isLastCeremonyStep(state: CeremonyState): boolean {
  return state.index >= CEREMONY_STEPS.length - 1;
}

function withVisited(
  visited: CeremonyStepId[],
  stepId: CeremonyStepId,
): CeremonyStepId[] {
  return visited.includes(stepId) ? visited : [...visited, stepId];
}

/** Advance to the next step; completing the ceremony on the last step. */
export function nextCeremonyStep(state: CeremonyState): CeremonyState {
  if (state.status !== "in_progress") return state;
  if (isLastCeremonyStep(state)) {
    return { ...state, status: "completed" };
  }
  const index = state.index + 1;
  return {
    index,
    status: "in_progress",
    visited: withVisited(state.visited, ceremonyStepAt(index)),
  };
}

/** Step back one screen; floors at the first step and stays in progress. */
export function previousCeremonyStep(state: CeremonyState): CeremonyState {
  if (state.status !== "in_progress") return state;
  if (isFirstCeremonyStep(state)) return state;
  return { ...state, index: state.index - 1 };
}

/** Jump directly to a step (stepper affordance). */
export function goToCeremonyStep(
  state: CeremonyState,
  stepId: CeremonyStepId,
): CeremonyState {
  if (state.status !== "in_progress") return state;
  const index = ceremonyStepIndex(stepId);
  if (index < 0) return state;
  return {
    index,
    status: "in_progress",
    visited: withVisited(state.visited, stepId),
  };
}

/** Skip the ceremony and go straight to the workspace. */
export function skipCeremony(state: CeremonyState): CeremonyState {
  if (state.status !== "in_progress") return state;
  return { ...state, status: "skipped" };
}

/** Complete the ceremony from any in-progress step. */
export function completeCeremony(state: CeremonyState): CeremonyState {
  if (state.status !== "in_progress") return state;
  return { ...state, status: "completed" };
}

export function isCeremonyFinished(state: CeremonyState): boolean {
  return state.status === "completed" || state.status === "skipped";
}

/** How far through the ordered steps the candidate has reached (1-indexed). */
export function ceremonyProgress(state: CeremonyState): {
  current: number;
  total: number;
} {
  return { current: state.index + 1, total: CEREMONY_STEPS.length };
}

// ---------------------------------------------------------------------------
// Content derivation — pure mapping from the generated sim state.
// ---------------------------------------------------------------------------

export type CeremonyPersonaSummary = {
  id: string;
  name: string;
  role: string;
  communicationStyle: string;
};

export type CeremonyContent = {
  company: {
    name: string;
    industry: string;
    businessContext: string;
    businessObjective: string;
  };
  role: {
    title: string;
    summary: string;
    expectations: string[];
  };
  team: {
    teammates: CeremonyPersonaSummary[];
    stakeholders: CeremonyPersonaSummary[];
  };
  project: {
    name: string;
    timelineDays: number;
    successMetrics: string[];
    constraints: string[];
    dependencies: string[];
  };
  firstActivity: {
    title: string;
    description: string;
    problem: string;
    whatHappensNext: string;
  };
  /** Always-present honesty line — ceremony is narrative, not capability. */
  honesty: string;
  /** True when no generated state was available and copy is a safe fallback. */
  isFallback: boolean;
};

export const CEREMONY_HONESTY_NOTE =
  "This is a simulated company for practice. Nothing here is a capability level, score or Verified status — evidence is only recorded once you make decisions inside the workspace.";

const FALLBACK_CONTENT: CeremonyContent = {
  company: {
    name: "your company",
    industry: "simulated workplace",
    businessContext:
      "Your simulated company is ready. We could not load its full briefing, but your workspace will still open.",
    businessObjective:
      "Enter the workspace to see today's priorities and your first decision.",
  },
  role: {
    title: "Associate Product Manager",
    summary:
      "You are joining as a practitioner. Your judgement on real trade-offs is what generates evidence.",
    expectations: [
      "Make decisions with a clear rationale",
      "Balance stakeholder needs against delivery reality",
      "Record your reasoning as you work",
    ],
  },
  team: { teammates: [], stakeholders: [] },
  project: {
    name: "Your first project",
    timelineDays: 0,
    successMetrics: [],
    constraints: [],
    dependencies: [],
  },
  firstActivity: {
    title: "Open your workspace",
    description:
      "Your first day is already in motion. Start with the highest-risk decision when you arrive.",
    problem: "",
    whatHappensNext:
      "Your decisions and written rationale become private evidence you can review later.",
  },
  honesty: CEREMONY_HONESTY_NOTE,
  isFallback: true,
};

function toPersonaSummary(persona: {
  id: string;
  name: string;
  role: string;
  communicationStyle?: string;
}): CeremonyPersonaSummary {
  return {
    id: persona.id,
    name: persona.name,
    role: persona.role,
    communicationStyle: persona.communicationStyle?.trim() || "Direct and collaborative",
  };
}

function firstActivityCopy(
  state: ExperienceSimState,
): CeremonyContent["firstActivity"] {
  const firstDecision = state.availableDecisions?.[0] ?? null;
  const firstMeeting = state.meetings?.find((m) => m.status === "scheduled") ?? null;
  const problem = state.scenarioMeta?.problem?.trim() ?? "";

  if (firstDecision) {
    return {
      title: firstDecision.label,
      description: firstDecision.description,
      problem,
      whatHappensNext:
        "You will make this call inside the workspace. Your rationale is recorded as private evidence — not a score.",
    };
  }

  if (firstMeeting) {
    return {
      title: firstMeeting.title,
      description: firstMeeting.agenda,
      problem,
      whatHappensNext:
        "Prepare for this session in the workspace. What you decide and write becomes private evidence.",
    };
  }

  return {
    title: "Start your first day",
    description:
      "The company is already moving. Begin with the highest-risk decision on your dashboard.",
    problem,
    whatHappensNext:
      "Your decisions and written rationale become private evidence you can review later.",
  };
}

/**
 * Derive ceremony content from generated sim state. Returns safe fallback copy
 * when state is missing or malformed so the entry never dead-ends.
 */
export function deriveCeremonyContent(
  state: ExperienceSimState | null | undefined,
): CeremonyContent {
  if (!state || typeof state !== "object" || !state.company || !state.project) {
    return FALLBACK_CONTENT;
  }

  const teammates = (state.team ?? []).map(toPersonaSummary);
  const stakeholders = (state.stakeholders ?? []).map(toPersonaSummary);

  const roleTitle = state.userRole?.trim() || FALLBACK_CONTENT.role.title;

  return {
    company: {
      name: state.company.name?.trim() || FALLBACK_CONTENT.company.name,
      industry: state.company.industry?.trim() || FALLBACK_CONTENT.company.industry,
      businessContext:
        state.company.businessContext?.trim() ||
        FALLBACK_CONTENT.company.businessContext,
      businessObjective:
        state.company.businessObjective?.trim() ||
        FALLBACK_CONTENT.company.businessObjective,
    },
    role: {
      title: roleTitle,
      summary: `You are joining ${
        state.company.name?.trim() || "your company"
      } as ${roleTitle}. Your judgement on real trade-offs is what generates evidence — not self-reported confidence.`,
      expectations: [
        "Make decisions with a clear rationale",
        "Balance stakeholder needs against delivery reality",
        "Record your reasoning so it becomes reviewable evidence",
      ],
    },
    team: { teammates, stakeholders },
    project: {
      name: state.project.name?.trim() || FALLBACK_CONTENT.project.name,
      timelineDays: Number.isFinite(state.project.timelineDays)
        ? state.project.timelineDays
        : 0,
      successMetrics: state.project.successMetrics ?? [],
      constraints: state.project.constraints ?? [],
      dependencies: state.project.dependencies ?? [],
    },
    firstActivity: firstActivityCopy(state),
    honesty: CEREMONY_HONESTY_NOTE,
    isFallback: false,
  };
}

// ---------------------------------------------------------------------------
// Rollout flag (kill-switch, default ON).
// ---------------------------------------------------------------------------

export type XpEntryCeremonyEnv = {
  DELIVERX_XP_ENTRY_CEREMONY?: string;
  [key: string]: string | undefined;
};

/**
 * Ceremony ships enabled with the Experience entry. It is a kill-switch:
 * DELIVERX_XP_ENTRY_CEREMONY=off (or 0/false/disabled) rolls back to the
 * previous direct-to-dashboard flow with no redeploy and no data change.
 */
export function isXpEntryCeremonyEnabled(
  env: XpEntryCeremonyEnv = process.env as XpEntryCeremonyEnv,
): boolean {
  const value = (env.DELIVERX_XP_ENTRY_CEREMONY ?? "").trim().toLowerCase();
  if (value === "off" || value === "0" || value === "false" || value === "disabled") {
    return false;
  }
  return true;
}
