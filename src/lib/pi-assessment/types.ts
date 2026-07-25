/** Baseline & final/transfer assessment — types. Learning ≠ competency; evidence-only. */

export const PI_BASELINE_PATH = "/profile/baseline";
export const PI_FINAL_PATH = "/profile/final";

export const ASSESSMENT_SESSION_KINDS = ["baseline", "final"] as const;
export type AssessmentSessionKind = (typeof ASSESSMENT_SESSION_KINDS)[number];

export const ASSESSMENT_SESSION_STATUSES = [
  "started",
  "in_progress",
  "completed",
  "abandoned",
] as const;
export type AssessmentSessionStatus = (typeof ASSESSMENT_SESSION_STATUSES)[number];

export const ASSESSMENT_ITEM_KINDS = [
  "interview",
  "scenario",
  "work_sample",
  "reflection",
  "decision",
  "transfer",
] as const;
export type AssessmentItemKind = (typeof ASSESSMENT_ITEM_KINDS)[number];

export const ASSESSMENT_ITEM_STATUSES = [
  "pending",
  "presented",
  "answered",
  "skipped",
] as const;
export type AssessmentItemStatus = (typeof ASSESSMENT_ITEM_STATUSES)[number];

export const BASELINE_PROMPT_VERSION = "baseline-select-v1";
export const BASELINE_MODEL_ID = "deterministic-selector";
export const BASELINE_MODEL_VERSION = "v1";
export const DEFAULT_MAX_BASELINE_ITEMS = 6;
export const MIN_BASELINE_RESPONSES = 4;

export const FINAL_PROMPT_VERSION = "final-select-v1";
export const FINAL_MODEL_ID = "deterministic-final-selector";
export const FINAL_MODEL_VERSION = "v1";
export const DEFAULT_MAX_FINAL_ITEMS = 5;
export const MIN_FINAL_RESPONSES = 3;
/** Final ceremony must include at least one transfer item. */
export const MIN_TRANSFER_RESPONSES = 1;

/** Default pm-core pilot pin — never hard-code forever; sessions store the resolved pin. */
export const BASELINE_FRAMEWORK_SLUG = "pm-core";
export const BASELINE_FRAMEWORK_VERSION = "2026.1";

/** Transfer industries deliberately outside Experience catalogue industries. */
export const TRANSFER_INDUSTRIES = [
  "civic_tech",
  "fintech",
  "logistics",
  "retail",
] as const;
export type TransferIndustry = (typeof TRANSFER_INDUSTRIES)[number];

export type AssessmentCatalogItem = {
  slug: string;
  kind: AssessmentItemKind;
  title: string;
  prompt: string;
  competencyCodes: string[];
  indicatorCodes: string[];
  catalogRef?: string;
  acceptsUpload?: boolean;
  sortOrder: number;
  /** DB assessment_content.kind when loaded from pi_cf_* */
  cfKind?: "question" | "scenario" | "work_sample" | "transfer_task";
  /** Transfer pack industry — must differ from Experience industry. */
  industry?: TransferIndustry | string;
  phase?: "baseline" | "final";
};

export type AssessmentSessionRow = {
  id: string;
  userId: string;
  kind: AssessmentSessionKind;
  status: AssessmentSessionStatus;
  frameworkVersionId: string | null;
  frameworkSlug: string;
  frameworkVersion: string;
  targetRole: string | null;
  targetSeniority: string | null;
  promptVersion: string;
  modelId: string | null;
  modelVersion: string | null;
  maxItems: number;
  scoreRunId: string | null;
  experiencePlanId: string | null;
  experienceEnrolmentId: string | null;
  growthReportId: string | null;
  metadata: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
};

export type AssessmentItemRow = {
  id: string;
  sessionId: string;
  sortOrder: number;
  itemKind: AssessmentItemKind;
  slug: string;
  title: string;
  prompt: string;
  competencyCodes: string[];
  indicatorCodes: string[];
  catalogRef: string | null;
  payload: Record<string, unknown>;
  selectionReason: string | null;
  status: AssessmentItemStatus;
  presentedAt: string | null;
};

export type AssessmentResponseRow = {
  id: string;
  sessionId: string;
  itemId: string;
  userId: string;
  responseText: string;
  responsePayload: Record<string, unknown>;
  userContribution: Record<string, unknown>;
  aiContribution: Record<string, unknown>;
  evidenceId: string | null;
  createdAt: string;
};

export type BaselineNextAction = {
  title: string;
  rationale: string;
  href: string;
  kind: "experience" | "evidence" | "profile";
};

export type FinalNextAction = {
  title: string;
  rationale: string;
  href: string;
  kind: "portfolio_eligibility" | "career_readiness" | "evidence" | "profile" | "experience";
};

export function isAssessmentItemKind(value: string): value is AssessmentItemKind {
  return (ASSESSMENT_ITEM_KINDS as readonly string[]).includes(value);
}

export function isTransferIndustry(value: string): value is TransferIndustry {
  return (TRANSFER_INDUSTRIES as readonly string[]).includes(value);
}
