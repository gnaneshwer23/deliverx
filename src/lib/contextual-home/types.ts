/**
 * Contextual Home + Daily Briefing — typed contracts.
 *
 * Answers the five home questions without inventing scores or Verified.
 * Insights here means “what next” content — not a suite nav product.
 */

export const HOME_STATES = [
  "not_onboarded",
  "recommend_experience",
  "active_experience",
  "launchpad_primary",
  "progress",
] as const;

export type HomeState = (typeof HOME_STATES)[number];

/** Founder labels A–D; E (Team Copilot executive) is never a primary state. */
export type HomeStateLetter = "A" | "B" | "C" | "D" | "progress";

export type HomeCitationKind =
  | "onboarding"
  | "experience_enrolment"
  | "experience_plan"
  | "evidence"
  | "score_run"
  | "career_outcome"
  | "roadmap"
  | "next_action"
  | "workspace";

export type HomeCitation = {
  kind: HomeCitationKind;
  /** Stable id when available (enrolment, plan, score run). */
  id: string | null;
  label: string;
};

export type HomePrimaryAction = {
  label: string;
  href: string;
  kind: string;
};

export type HomeBriefingCard = {
  id: string;
  title: string;
  body: string;
  /** Why this card appears for this journey state. */
  whyHere: string;
  primaryAction: HomePrimaryAction | null;
};

/**
 * Signals derived from existing PI / Experience / Career data.
 * Pure input to resolveHomeState — no I/O.
 */
export type HomeStateSignals = {
  onboardingComplete: boolean;
  /** ACTIVE enrolment whose lifecycle is not completed/failed. */
  hasActiveExperienceWork: boolean;
  experienceEnrolmentId: string | null;
  experienceCompanyName: string | null;
  experienceDay: number | null;
  experienceLifecycle: string | null;
  hasExperienceEvidence: boolean;
  experienceEvidenceCount: number;
  evidenceTotalCount: number;
  hasActiveExperiencePlan: boolean;
  experiencePlanId: string | null;
  experiencePlanTitle: string | null;
  experiencePlanCompany: string | null;
  experiencePlanHref: string | null;
  experiencePlanRationale: string | null;
  targetRole: string | null;
  objective: string | null;
  /** Suite product metadata when known. */
  productIntent: "xperience" | "launchpad" | "bundle" | "team-copilot" | null;
  interviewCount: number;
  applicationCount: number;
  offerCount: number;
  hasInterviewPrepRoadmap: boolean;
  interviewPrepHref: string | null;
  /** Qualitative B1 band label only — never a readiness %. */
  confidenceBandLabel: string | null;
  scoreRunId: string | null;
  topGap: string | null;
  /** T8 attested claims only; 0 means omit Verified copy. */
  verifiedClaimCount: number;
  /** Show thin Workspace summary (E deferred). */
  showWorkspaceSummary: boolean;
  nextAction: {
    title: string;
    rationale: string;
    href: string;
    kind: string;
  } | null;
  firstName: string | null;
};

export type DailyBriefing = {
  state: HomeState;
  stateLetter: HomeStateLetter;
  /** Short journey label for the shell. */
  stateLabel: string;
  greeting: string;
  whereAmI: string;
  whatToday: string;
  whyItMatters: string;
  howProgressing: string;
  whatNext: string;
  primaryAction: HomePrimaryAction;
  cards: HomeBriefingCard[];
  citations: HomeCitation[];
  contextPanel: {
    title: string;
    bullets: string[];
  };
  /** Explicit trust rails on every payload. */
  capabilityAssigned: false;
  deliverxVerifiedInflated: false;
  /** No unexplained percentage fields are part of this contract. */
  honestyNote: string;
};

export function homeStateLetter(state: HomeState): HomeStateLetter {
  switch (state) {
    case "not_onboarded":
      return "A";
    case "recommend_experience":
      return "B";
    case "active_experience":
      return "C";
    case "launchpad_primary":
      return "D";
    default:
      return "progress";
  }
}
