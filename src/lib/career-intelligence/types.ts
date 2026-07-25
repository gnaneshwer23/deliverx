/**
 * Launchpad → Career Intelligence domain model.
 * Consumes PI Profile + Verified Portfolio. Never assigns capability.
 */

export const REQUIREMENT_SUPPORT_LEVELS = [
  "satisfied_strong",
  "partially_supported",
  "claimed_unverified",
  "not_demonstrated",
  "not_assessed",
] as const;

export type RequirementSupportLevel = (typeof REQUIREMENT_SUPPORT_LEVELS)[number];

export const REQUIREMENT_SUPPORT_DISPLAY: Record<
  RequirementSupportLevel,
  { label: string; description: string }
> = {
  satisfied_strong: {
    label: "Satisfied with strong evidence",
    description: "Linked portfolio/ledger evidence at observed+ or stronger.",
  },
  partially_supported: {
    label: "Partially supported",
    description: "Some related evidence exists but coverage or strength is incomplete.",
  },
  claimed_unverified: {
    label: "Claimed but unverified",
    description: "Self-report or packaging claim without supporting practice evidence.",
  },
  not_demonstrated: {
    label: "Not demonstrated",
    description: "Assessed against the role; no supporting evidence found.",
  },
  not_assessed: {
    label: "Not assessed",
    description: "Insufficient profile or evidence context to judge this requirement yet.",
  },
};

export type CareerModuleId =
  | "readiness"
  | "roadmap"
  | "cv"
  | "profile"
  | "interview"
  | "opportunities"
  | "companies"
  | "applications"
  | "networking"
  | "hiring_managers"
  | "events"
  | "promotion";

export const CAREER_MODULES: Array<{
  id: CareerModuleId;
  label: string;
  href: string;
  mvp: boolean;
  userQuestion: string;
}> = [
  {
    id: "readiness",
    label: "Role Readiness",
    href: "/launchpad/app",
    mvp: true,
    userQuestion: "Which roles am I currently ready for?",
  },
  {
    id: "roadmap",
    label: "Career Roadmap",
    href: "/launchpad/app/roadmap",
    mvp: true,
    userQuestion: "Which Experience would close the most important gap?",
  },
  {
    id: "cv",
    label: "Evidence-backed CV",
    href: "/launchpad/app/cv",
    mvp: true,
    userQuestion: "How should I present verified evidence?",
  },
  {
    id: "profile",
    label: "Professional Profile",
    href: "/profile",
    mvp: true,
    userQuestion: "What does my PI profile say about me?",
  },
  {
    id: "interview",
    label: "Interview Lab",
    href: "/launchpad/app/interview",
    mvp: true,
    userQuestion: "How should I prepare for a specific interview?",
  },
  {
    id: "opportunities",
    label: "Opportunity Matching",
    href: "/launchpad/app/opportunities",
    mvp: true,
    userQuestion: "Which companies and opportunities fit my profile?",
  },
  {
    id: "companies",
    label: "Company Intelligence",
    href: "/launchpad/app/companies",
    mvp: false,
    userQuestion: "What should I know about a target company?",
  },
  {
    id: "applications",
    label: "Application Tracker",
    href: "/launchpad/app/applications",
    mvp: true,
    userQuestion: "Where are my applications and what feedback returned?",
  },
  {
    id: "networking",
    label: "Networking",
    href: "/launchpad/app/networking",
    mvp: false,
    userQuestion: "Which professional relationships should I build?",
  },
  {
    id: "hiring_managers",
    label: "Hiring Manager Mapping",
    href: "/launchpad/app/hiring-managers",
    mvp: false,
    userQuestion: "Who influences this hire?",
  },
  {
    id: "events",
    label: "Events and Communities",
    href: "/launchpad/app/events",
    mvp: false,
    userQuestion: "Where should I show up?",
  },
  {
    id: "promotion",
    label: "Promotion Planning",
    href: "/launchpad/app/promotion",
    mvp: false,
    userQuestion: "How do I plan the next level in-role?",
  },
];

export type RoleRequirement = {
  id: string;
  label: string;
  competencyHints: string[];
  evidenceSourceHints: string[];
  weight: number;
};

export type RoleDefinition = {
  id: string;
  title: string;
  seniority: string;
  industryFit: string[];
  requirements: RoleRequirement[];
};

export type RequirementMatch = {
  requirementId: string;
  label: string;
  level: RequirementSupportLevel;
  evidenceCited: Array<{ id: string; title: string; kind: "ledger" | "portfolio" }>;
  gapExplanation: string;
  recommendation?: string;
};

export type RoleReadinessResult = {
  roleId: string;
  roleTitle: string;
  readinessPct: number;
  matches: RequirementMatch[];
  strongCount: number;
  partialCount: number;
  gapCount: number;
  unexplainedCount: number;
  summary: string;
  /** Explicit: Career Intelligence does not assign capability */
  capabilityAssigned: false;
  /**
   * score_run_projection = derived from SnapshotClaims.
   * evidence_coverage = labelled heuristic fallback — never capability truth.
   */
  readinessKind: "score_run_projection" | "evidence_coverage";
};

export type RoadmapAction = {
  id: string;
  kind: "experience_project" | "learning_activity" | "portfolio_entry" | "interview_prep";
  title: string;
  closesRequirementIds: string[];
  rationale: string;
  href?: string;
};

export type OpportunityFit = {
  id: string;
  company: string;
  roleTitle: string;
  fitPct: number;
  why: string[];
  gaps: string[];
  evidenceCited: string[];
};

export type InterviewPrepPlan = {
  roleTitle: string;
  stories: Array<{ prompt: string; evidenceIds: string[]; tip: string }>;
  gapsToAddress: string[];
  disclosure: string;
};

/** Latest ScoreRun projection surfaced to Career (read-only). */
export type ScoreRunCareerContext = {
  snapshotId: string;
  scoreRunId: string | null;
  capturedAt: string;
  readiness: number;
  strengths: string[];
  gaps: string[];
  recommendations: Array<{ id?: string; title: string; rationale?: string }>;
  levels: Array<{
    competencyId: string;
    level: string;
    confidence: number;
    evidenceReferences: string[];
  }>;
  frameworkVersionId: string | null;
  rubricSlug: string | null;
  rubricVersion: string | null;
};

export type CareerIntelligenceSnapshot = {
  profile: {
    firstName: string;
    lastName: string;
    targetRole: string | null;
    targetSeniority: string | null;
    industries: string[];
    objective: string | null;
    situation: string | null;
    source: "pi_onboarding" | "launchpad_profile" | "none";
  };
  roleReadiness: RoleReadinessResult[];
  topRole: RoleReadinessResult | null;
  roadmap: RoadmapAction[];
  opportunities: OpportunityFit[];
  interviewPlan: InterviewPrepPlan;
  portfolioEntryCount: number;
  evidenceCount: number;
  capabilityAssigned: false;
  /** Prefer score_run when a capability snapshot exists; heuristic is labelled fallback. */
  readinessSource: "score_run" | "evidence_coverage_heuristic";
  scoreRun: ScoreRunCareerContext | null;
  /** Phase 7 — real-world outcome loop (self-reported; never capability). */
  outcomes: CareerOutcomeContext;
};

/** Real-world outcome context surfaced on Career (read-only toward capability). */
export type CareerOutcomeContext = {
  total: number;
  applications: number;
  interviews: number;
  offers: number;
  rejections: number;
  /** Diagnostic calibration findings — never capability assignment. */
  calibration: Array<{
    findingType: string;
    severity: "info" | "watch" | "action";
    title: string;
    detail: string;
    implicatedGaps: string[];
    metrics: Record<string, number | string>;
    diagnosticOnly: true;
    capabilityAssigned: false;
  }>;
  narrative: string | null;
  capabilityAssigned: false;
};
