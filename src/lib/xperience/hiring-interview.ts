/**
 * Experience hiring interview (slice 1) — placement ceremony into the simulated company.
 *
 * Bound to an already-generated ExperienceSimState. Skip is always allowed.
 * Placement is derived from company/role/project — never a score, capability
 * band, or Verified stamp. Distinct from Launchpad Interview Lab.
 */

import type {
  ExperienceSimState,
  HiringInterviewState,
  HiringInterviewTurn,
  HiringPanelMember,
  HiringPlacement,
  PersonaContract,
} from "@/lib/experience-sim/types";

export const XP_HIRING_INTERVIEW_VERSION = "xp-hiring-interview@2026.1";

export const HIRING_PLACEMENT_HONESTY =
  "This is practice placement into a simulated company. It is not a real hiring decision, not a capability score, and not Verified status. Evidence is recorded only when you act in the workspace.";

export const HIRING_INTERVIEW_MIN_ANSWERS = 2;
export const HIRING_INTERVIEW_MAX_ANSWERS = 4;

export type HiringClaims = {
  background?: string;
  targetRole?: string;
  selectedSkill?: string;
  workStyle?: string;
};

export type XpHiringInterviewEnv = {
  DELIVERX_XP_HIRING_INTERVIEW?: string;
  [key: string]: string | undefined;
};

/**
 * Kill-switch default ON. Set DELIVERX_XP_HIRING_INTERVIEW=off (or 0/false/disabled)
 * to restore offer → ceremony/dashboard with no redeploy.
 */
export function isXpHiringInterviewEnabled(
  env: XpHiringInterviewEnv = process.env as XpHiringInterviewEnv,
): boolean {
  const value = (env.DELIVERX_XP_HIRING_INTERVIEW ?? "").trim().toLowerCase();
  if (value === "off" || value === "0" || value === "false" || value === "disabled") {
    return false;
  }
  return true;
}

function toPanelMember(persona: PersonaContract): HiringPanelMember {
  return {
    id: persona.id,
    name: persona.name,
    role: persona.role,
    kind: persona.kind,
  };
}

/** CEO/sponsor (highest trust stakeholder) + sceptical counterpart. Portable across catalogue packs. */
export function selectHiringPanel(state: ExperienceSimState): {
  manager: HiringPanelMember;
  stakeholder: HiringPanelMember;
} {
  const teammates = state.team.filter((p) => p.id !== "p-coach");
  const stakeholders = [...state.stakeholders];
  const byTrustDesc = [...stakeholders].sort((a, b) => (b.trust ?? 0) - (a.trust ?? 0));
  const byTrustAsc = [...stakeholders].sort((a, b) => (a.trust ?? 0) - (b.trust ?? 0));

  const managerPersona = byTrustDesc[0] ?? teammates[0] ?? stakeholders[0];
  const otherPersona =
    byTrustAsc.find((p) => p.id !== managerPersona?.id) ??
    teammates.find((p) => p.id !== managerPersona?.id) ??
    stakeholders.find((p) => p.id !== managerPersona?.id);

  if (!managerPersona || !otherPersona) {
    const fallback: HiringPanelMember = {
      id: state.company.id,
      name: state.company.name,
      role: "Hiring manager",
      kind: "stakeholder",
    };
    return { manager: fallback, stakeholder: { ...fallback, id: `${fallback.id}-panel` } };
  }

  return {
    manager: toPanelMember(managerPersona),
    stakeholder: toPanelMember(otherPersona),
  };
}

export function deriveHiringPlacement(state: ExperienceSimState): HiringPlacement {
  const firstTask = state.tasks.find((t) => t.status !== "done") ?? state.tasks[0];
  const firstDecision = state.availableDecisions[0];
  const people = [...state.team, ...state.stakeholders]
    .filter((p) => p.id !== "p-coach")
    .slice(0, 4)
    .map((p) => `${p.name} (${p.role})`);

  return {
    companyName: state.company.name,
    roleTitle: state.userRole || "Associate Product Manager",
    projectName: state.project.name,
    teamSummary: people.join(", ") || "Your simulated team",
    firstWeekFocus:
      firstTask?.title ?? firstDecision?.label ?? "Your first Day-1 decision in the workspace",
    honesty: HIRING_PLACEMENT_HONESTY,
  };
}

export function attachPendingHiringInterview(state: ExperienceSimState): ExperienceSimState {
  if (state.hiringInterview) return state;
  return {
    ...state,
    hiringInterview: {
      status: "pending",
      panel: selectHiringPanel(state),
      turns: [],
      placement: null,
    },
  };
}

/** Attach a pending interview only when the kill-switch is on. */
export function prepareHiringInterviewState(
  state: ExperienceSimState,
  env: XpHiringInterviewEnv = process.env as XpHiringInterviewEnv,
): ExperienceSimState {
  if (!isXpHiringInterviewEnabled(env)) return state;
  return attachPendingHiringInterview(state);
}

export function candidateAnswerCount(interview: HiringInterviewState | undefined): number {
  return interview?.turns.filter((t) => t.role === "candidate").length ?? 0;
}

export function canFinishHiringInterview(interview: HiringInterviewState | undefined): boolean {
  return candidateAnswerCount(interview) >= HIRING_INTERVIEW_MIN_ANSWERS;
}

export function shouldAutoCompleteHiringInterview(
  interview: HiringInterviewState | undefined,
): boolean {
  return candidateAnswerCount(interview) >= HIRING_INTERVIEW_MAX_ANSWERS;
}

export function shouldShowHiringInterview(state: ExperienceSimState | null | undefined): boolean {
  const status = state?.hiringInterview?.status;
  return status === "pending" || status === "in_progress";
}

/** Resume only when the interview is unfinished and Day-1 work has not started. */
export function shouldResumeHiringInterview(
  state: ExperienceSimState | null | undefined,
): boolean {
  if (!state || !shouldShowHiringInterview(state)) return false;
  if (state.lifecycle === "completed" || state.lifecycle === "failed") return false;
  if (state.completion.decisionMade) return false;
  return true;
}

export function isHiringInterviewFinished(state: ExperienceSimState | null | undefined): boolean {
  const status = state?.hiringInterview?.status;
  return status === "completed" || status === "skipped";
}

export function nextHiringSpeakerRole(
  interview: HiringInterviewState,
): "manager" | "stakeholder" {
  const panelTurns = interview.turns.filter((t) => t.role === "manager" || t.role === "stakeholder");
  const last = panelTurns.at(-1);
  if (!last) return "manager";
  return last.role === "manager" ? "stakeholder" : "manager";
}

export function panelMemberForRole(
  interview: HiringInterviewState,
  role: "manager" | "stakeholder",
): HiringPanelMember {
  return role === "manager" ? interview.panel.manager : interview.panel.stakeholder;
}

export function makeHiringTurn(input: {
  role: HiringInterviewTurn["role"];
  speakerId: string;
  speakerName: string;
  text: string;
  citations?: HiringInterviewTurn["citations"];
  now?: string;
}): HiringInterviewTurn {
  return {
    id: `hire-${input.role}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    role: input.role,
    speakerId: input.speakerId,
    speakerName: input.speakerName,
    text: input.text.trim(),
    citations: input.citations ?? [],
    at: input.now ?? new Date().toISOString(),
  };
}

export function normaliseHiringClaims(raw: unknown): HiringClaims {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const row = raw as Record<string, unknown>;
  const pick = (key: keyof HiringClaims) =>
    typeof row[key] === "string" ? row[key] : undefined;
  return {
    background: pick("background"),
    targetRole: pick("targetRole"),
    selectedSkill: pick("selectedSkill"),
    workStyle: pick("workStyle"),
  };
}

export function labelledClaims(claims: unknown): Record<string, string> {
  const normalised = normaliseHiringClaims(claims);
  const out: Record<string, string> = {};
  if (normalised.background?.trim()) out.background = normalised.background.trim();
  if (normalised.targetRole?.trim()) out.targetRole = normalised.targetRole.trim();
  if (normalised.selectedSkill?.trim()) out.selectedSkill = normalised.selectedSkill.trim();
  if (normalised.workStyle?.trim()) out.workStyle = normalised.workStyle.trim();
  return out;
}

/** Deterministic panel question when the model is unavailable or fails citation checks. */
export function deterministicHiringQuestion(
  state: ExperienceSimState,
  speaker: HiringPanelMember,
  role: "manager" | "stakeholder",
  claims: HiringClaims,
): { text: string; citations: HiringInterviewTurn["citations"] } {
  const constraint = state.project.constraints[0] ?? state.company.businessContext;
  const skill = claims.selectedSkill?.trim();
  const background = claims.background?.trim();
  const claimNote = background
    ? ` You mentioned ${background.slice(0, 140)}${background.length > 140 ? "…" : ""} — treat that as self-reported, not verified.`
    : skill
      ? ` You listed ${skill} as a strength — treat that as self-reported, not verified.`
      : "";

  const text =
    role === "manager"
      ? `${speaker.name} here (${speaker.role}). You are joining ${state.company.name} as ${state.userRole} on ${state.project.name}. Given ${constraint}, what would you want to understand in week one?${claimNote}`
      : `${speaker.name} here (${speaker.role}). ${state.project.name} is already under pressure. How would you work with me without over-promising?${claimNote}`;

  return {
    text,
    citations: [
      {
        sourceType: "experience_state",
        sourceId: state.company.id,
        label: state.company.name,
      },
      { sourceType: "project", sourceId: state.project.id, label: state.project.name },
      {
        sourceType: "org_snapshot",
        sourceId: speaker.id,
        label: `${speaker.name} · ${speaker.role}`,
      },
    ],
  };
}

export function hiringContextSources(state: ExperienceSimState, claims: HiringClaims) {
  const panel = state.hiringInterview?.panel ?? selectHiringPanel(state);
  const labelled = labelledClaims(claims);
  return {
    boundRef: {
      enrolmentProjectId: state.project.id,
      projectId: state.project.id,
      companyId: state.company.id,
      hiringManagerId: panel.manager.id,
      stakeholderId: panel.stakeholder.id,
    },
    organisationData: {
      company: state.company,
      project: state.project,
      userRole: state.userRole,
      hiringPanel: panel,
      selfReportedClaims: labelled,
      selfReportedNote: "Candidate setup answers are self-reported claims, not verified evidence.",
    },
    extraSources: [
      {
        kind: "experience_state" as const,
        ref: state.company.id,
        summary: `Company ${state.company.name}`,
      },
      {
        kind: "project" as const,
        ref: state.project.id,
        summary: `Project ${state.project.name}`,
      },
      {
        kind: "org_snapshot" as const,
        ref: panel.manager.id,
        summary: `Hiring panel · ${panel.manager.name} (${panel.manager.role})`,
      },
      {
        kind: "org_snapshot" as const,
        ref: panel.stakeholder.id,
        summary: `Hiring panel · ${panel.stakeholder.name} (${panel.stakeholder.role})`,
      },
      ...Object.keys(labelled).map((key) => ({
        kind: "other" as const,
        ref: `claim:${key}`,
        summary: `Self-reported ${key} (not verified)`,
      })),
    ],
  };
}
