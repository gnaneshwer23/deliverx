/**
 * B2 — canonical Professional Intelligence recommendation model (FR-010 / TRD-SM-REC).
 * One typed source of truth; products consume this — they do not keep their own
 * recommendation truth. Recommendations never assign capability or verification.
 */

export const RECOMMENDATION_STATUSES = [
  "generated",
  "viewed",
  "accepted",
  "dismissed",
  "completed",
] as const;

export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

/** User-initiated lifecycle actions (everything except initial generation). */
export type RecommendationAction = Exclude<RecommendationStatus, "generated">;

/** Only source live today. Extend deliberately — with rationale + citations. */
export type RecommendationSourceType = "capability_snapshot";

export type RecommendationDraft = {
  title: string;
  /** Mandatory explainability — why this action, in plain language. */
  rationale: string;
  competencyId: string | null;
  /** Internal deterministic destination the user opens when acting. */
  href: string;
  sourceType: RecommendationSourceType;
  sourceId: string;
  sourceSnapshotId: string | null;
  sourceScoreRunId: string | null;
  dedupeKey: string;
  evidenceReferences: string[];
  payload?: Record<string, unknown>;
};

export type RecommendationRecord = {
  id: string;
  userId: string;
  status: RecommendationStatus;
  title: string;
  rationale: string;
  competencyId: string | null;
  href: string;
  sourceType: RecommendationSourceType;
  sourceId: string;
  sourceSnapshotId: string | null;
  sourceScoreRunId: string | null;
  dedupeKey: string;
  evidenceReferences: string[];
  payload: Record<string, unknown>;
  /** Trust rail — always false; recommendations never write capability. */
  capabilityAssigned: false;
  /** Trust rail — always false; recommendations never light Verified. */
  verificationChanged: false;
  generatedAt: string;
  viewedAt: string | null;
  acceptedAt: string | null;
  dismissedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecommendationEventRecord = {
  id: string;
  recommendationId: string;
  userId: string;
  fromStatus: RecommendationStatus | null;
  toStatus: RecommendationStatus;
  actor: "user" | "system";
  note: string;
  createdAt: string;
};

export type RecommendationTransitionResult = {
  record: RecommendationRecord;
  /** True when the record was already in the requested state (no-op). */
  idempotent: boolean;
};
