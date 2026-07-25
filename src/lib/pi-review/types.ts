/** PI Review & Challenge — types. Never mutates verified capability levels. */

export const PI_REVIEW_SUBJECT_KINDS = [
  "imported_claim",
  "evidence_classification",
  "competency_mapping",
  "assessment_finding",
  "capability_level",
  "confidence",
  "strength",
  "development_gap",
  "role_readiness",
  "portfolio_claim",
] as const;

export type PiReviewSubjectKind = (typeof PI_REVIEW_SUBJECT_KINDS)[number];

export const PI_REVIEW_STATUSES = [
  "pending_review",
  "accepted",
  "user_context_added",
  "challenged",
  "under_review",
  "additional_evidence_required",
  "reassessed",
  "upheld",
  "revised",
  "escalated_to_human_review",
] as const;

export type PiReviewStatus = (typeof PI_REVIEW_STATUSES)[number];

export const PI_REVIEW_ACTIONS = [
  "accept",
  "correct_factual",
  "add_context",
  "add_evidence",
  "challenge_judgement",
  "request_reassessment",
  "hide_evidence",
  "change_visibility",
  "report_inappropriate",
  "start_review",
  "request_evidence",
  "uphold",
  "revise",
  "escalate",
  "mark_reassessed",
  "reopen",
] as const;

export type PiReviewAction = (typeof PI_REVIEW_ACTIONS)[number];

export const PI_REVIEW_ACTOR_ROLES = [
  "subject_user",
  "admin_reviewer",
  "system",
] as const;

export type PiReviewActorRole = (typeof PI_REVIEW_ACTOR_ROLES)[number];

export const USER_ACTIONS: readonly PiReviewAction[] = [
  "accept",
  "correct_factual",
  "add_context",
  "add_evidence",
  "challenge_judgement",
  "request_reassessment",
  "hide_evidence",
  "change_visibility",
  "report_inappropriate",
] as const;

export const ADMIN_ACTIONS: readonly PiReviewAction[] = [
  "start_review",
  "request_evidence",
  "uphold",
  "revise",
  "escalate",
  "mark_reassessed",
  "reopen",
] as const;

export const CLOSED_STATUSES: readonly PiReviewStatus[] = [
  "accepted",
  "upheld",
  "revised",
  "reassessed",
] as const;

export type CreateReviewCaseInput = {
  userId: string;
  subjectKind: PiReviewSubjectKind;
  subjectRefType: string;
  subjectRefId: string;
  subjectLabel: string;
  subjectSnapshot?: Record<string, unknown>;
  priority?: "low" | "normal" | "high" | "urgent";
  slaDueAt?: string | null;
};

export type TransitionInput = {
  caseId: string;
  actorUserId: string;
  actorRole: PiReviewActorRole;
  action: PiReviewAction;
  rationale?: string;
  factualCorrection?: Record<string, unknown>;
  contextNote?: string;
  evidenceIds?: string[];
  visibilityChange?: Record<string, unknown>;
  proposedRevision?: Record<string, unknown>;
  audit?: Record<string, unknown>;
};

export type ReviewCaseRow = {
  id: string;
  user_id: string;
  subject_kind: PiReviewSubjectKind;
  subject_ref_type: string;
  subject_ref_id: string;
  subject_label: string;
  subject_snapshot: Record<string, unknown>;
  current_status: PiReviewStatus;
  priority: string;
  assigned_reviewer_id: string | null;
  sla_due_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewEventRow = {
  id: string;
  case_id: string;
  user_id: string;
  actor_user_id: string | null;
  actor_role: PiReviewActorRole;
  action: PiReviewAction;
  from_status: PiReviewStatus;
  to_status: PiReviewStatus;
  rationale: string;
  factual_correction: Record<string, unknown>;
  context_note: string;
  evidence_ids: string[];
  visibility_change: Record<string, unknown>;
  proposed_revision: Record<string, unknown>;
  audit: Record<string, unknown>;
  created_at: string;
};

export function isPiReviewSubjectKind(value: string): value is PiReviewSubjectKind {
  return (PI_REVIEW_SUBJECT_KINDS as readonly string[]).includes(value);
}

export function isPiReviewStatus(value: string): value is PiReviewStatus {
  return (PI_REVIEW_STATUSES as readonly string[]).includes(value);
}

export function isPiReviewAction(value: string): value is PiReviewAction {
  return (PI_REVIEW_ACTIONS as readonly string[]).includes(value);
}

export function isClosedStatus(status: PiReviewStatus): boolean {
  return (CLOSED_STATUSES as readonly string[]).includes(status);
}

/** Human-readable labels for UI. */
export const PI_REVIEW_STATUS_LABELS: Record<PiReviewStatus, string> = {
  pending_review: "Pending Review",
  accepted: "Accepted",
  user_context_added: "User Context Added",
  challenged: "Challenged",
  under_review: "Under Review",
  additional_evidence_required: "Additional Evidence Required",
  reassessed: "Reassessed",
  upheld: "Upheld",
  revised: "Revised",
  escalated_to_human_review: "Escalated to Human Review",
};

export const PI_REVIEW_ACTION_LABELS: Record<PiReviewAction, string> = {
  accept: "Accept",
  correct_factual: "Correct factual info",
  add_context: "Add context",
  add_evidence: "Add evidence",
  challenge_judgement: "Challenge judgement",
  request_reassessment: "Request reassessment",
  hide_evidence: "Hide evidence",
  change_visibility: "Change visibility",
  report_inappropriate: "Report inappropriate output",
  start_review: "Start review",
  request_evidence: "Request evidence",
  uphold: "Uphold",
  revise: "Revise",
  escalate: "Escalate to human review",
  mark_reassessed: "Mark reassessed",
  reopen: "Reopen",
};

export const PI_REVIEW_SUBJECT_LABELS: Record<PiReviewSubjectKind, string> = {
  imported_claim: "Imported claim",
  evidence_classification: "Evidence classification",
  competency_mapping: "Competency mapping",
  assessment_finding: "Assessment finding",
  capability_level: "Capability level",
  confidence: "Confidence",
  strength: "Strength",
  development_gap: "Development gap",
  role_readiness: "Role-readiness finding",
  portfolio_claim: "Portfolio claim",
};
