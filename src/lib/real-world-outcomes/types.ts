/**
 * Real-world outcome loop — types.
 *
 * Hard rules (Phase 7):
 * - Outcomes are SELF-REPORTED by default; document_supported only when an artefact
 *   is attached. Never externally_verified (P8 owns attestation).
 * - Outcomes NEVER assign or lower a capability level. Capability only via ScoreRun.
 * - Calibration findings are diagnostic guidance, evidence-linked and challengeable —
 *   not capability assignment.
 */

export const OUTCOME_EVENT_TYPES = [
  "application_submitted",
  "interview_attended",
  "interview_feedback",
  "offer_received",
  "rejection",
  "job_started",
  "promotion_achieved",
  "performance_feedback",
  "external_project_completed",
] as const;

export type OutcomeEventType = (typeof OUTCOME_EVENT_TYPES)[number];

export const OUTCOME_EVENT_DISPLAY: Record<
  OutcomeEventType,
  { label: string; verb: string; category: OutcomeCategory }
> = {
  application_submitted: { label: "Application submitted", verb: "applied", category: "application" },
  interview_attended: { label: "Interview attended", verb: "interviewed", category: "interview" },
  interview_feedback: { label: "Interview feedback", verb: "received feedback", category: "interview" },
  offer_received: { label: "Offer received", verb: "was offered", category: "positive" },
  rejection: { label: "Rejection", verb: "was rejected", category: "rejection" },
  job_started: { label: "Job started", verb: "started a role", category: "positive" },
  promotion_achieved: { label: "Promotion achieved", verb: "was promoted", category: "positive" },
  performance_feedback: { label: "Performance feedback", verb: "received performance feedback", category: "feedback" },
  external_project_completed: {
    label: "External project completed",
    verb: "completed an external project",
    category: "delivery",
  },
};

export type OutcomeCategory =
  | "application"
  | "interview"
  | "positive"
  | "rejection"
  | "feedback"
  | "delivery";

export const OUTCOME_STRENGTHS = ["self_reported", "document_supported"] as const;
export type OutcomeStrength = (typeof OUTCOME_STRENGTHS)[number];

export const OUTCOME_SENTIMENTS = ["positive", "neutral", "negative"] as const;
export type OutcomeSentiment = (typeof OUTCOME_SENTIMENTS)[number];

export type OutcomeEventRecord = {
  id: string;
  userId: string;
  applicationId: string | null;
  eventType: OutcomeEventType;
  occurredOn: string;
  title: string;
  detail: string;
  company: string | null;
  roleTitle: string | null;
  seniority: string | null;
  stageReached: string | null;
  sentiment: OutcomeSentiment;
  artefactRef: string | null;
  hasArtefact: boolean;
  evidenceId: string | null;
  evidenceStrength: OutcomeStrength;
  /** Invariant: always true in Phase 7. */
  selfReported: true;
  /** Invariant: always false in Phase 7 (P8 owns attestation). */
  externallyVerified: false;
  /** Invariant: always false. Outcomes never assign capability. */
  capabilityAssigned: false;
  confidentiality: string;
  createdAt: string;
  updatedAt: string;
};

export type RecordOutcomeInput = {
  eventType: OutcomeEventType;
  title: string;
  detail?: string;
  occurredOn?: string | null;
  applicationId?: string | null;
  company?: string | null;
  roleTitle?: string | null;
  seniority?: string | null;
  stageReached?: string | null;
  sentiment?: OutcomeSentiment;
  artefactRef?: string | null;
  /** Set true (or provide artefactRef) to mark the outcome document-supported. */
  hasArtefact?: boolean;
};

export const CALIBRATION_SEVERITIES = ["info", "watch", "action"] as const;
export type CalibrationSeverity = (typeof CALIBRATION_SEVERITIES)[number];

export const CALIBRATION_FINDING_STATUSES = [
  "open",
  "acknowledged",
  "dismissed",
  "challenged",
] as const;
export type CalibrationFindingStatus = (typeof CALIBRATION_FINDING_STATUSES)[number];

export const CALIBRATION_FINDING_TYPES = [
  "insufficient_data",
  "interview_conversion_low",
  "seniority_unsupported",
  "limited_commercial_examples",
  "communication_gap",
  "role_targeting_mismatch",
  "conversion_healthy",
] as const;
export type CalibrationFindingType = (typeof CALIBRATION_FINDING_TYPES)[number];

export type CalibrationFinding = {
  findingType: CalibrationFindingType;
  severity: CalibrationSeverity;
  title: string;
  detail: string;
  evidenceIds: string[];
  implicatedGaps: string[];
  metrics: Record<string, number | string>;
  /** Invariant: diagnostic guidance, never capability assignment. */
  diagnosticOnly: true;
  capabilityAssigned: false;
};

export type CalibrationFindingRecord = CalibrationFinding & {
  id: string;
  userId: string;
  status: CalibrationFindingStatus;
  reviewCaseId: string | null;
  sourceWindowStart: string | null;
  sourceWindowEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OutcomeSummary = {
  total: number;
  applications: number;
  interviews: number;
  offers: number;
  rejections: number;
  hires: number;
  promotions: number;
  externalProjects: number;
  documentSupported: number;
  latestOccurredOn: string | null;
  /** Invariant. */
  capabilityAssigned: false;
};

/** Volume floor for statistical honesty (G7): below this, suppress conversion claims. */
export const CALIBRATION_VOLUME_FLOOR = 3;

export const OUTCOMES_PATH = "/career/outcomes";
export const OUTCOMES_PROFILE_ALIAS = "/profile/outcomes";

export function isOutcomeEventType(v: string): v is OutcomeEventType {
  return (OUTCOME_EVENT_TYPES as readonly string[]).includes(v);
}

export function isOutcomeSentiment(v: string): v is OutcomeSentiment {
  return (OUTCOME_SENTIMENTS as readonly string[]).includes(v);
}
