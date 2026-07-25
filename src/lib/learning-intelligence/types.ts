/**
 * Learning Intelligence — person knowledge records.
 * Hard rule: Learning ≠ competency. Completing a course never assigns capability
 * or lights Verified. Capability only via ScoreRun on ledger evidence.
 */

export const LEARNING_EVIDENCE_LEVELS = [
  "consumed",
  "understood",
  "reflected_upon",
  "applied",
  "repeatedly_applied",
  "outcome_supported",
] as const;

export type LearningEvidenceLevel = (typeof LEARNING_EVIDENCE_LEVELS)[number];

export const LEARNING_ITEM_KINDS = [
  "book",
  "article",
  "course",
  "podcast",
  "certification",
  "other",
] as const;

export type LearningItemKind = (typeof LEARNING_ITEM_KINDS)[number];

export const LEARNING_PATH_STATUSES = [
  "offered",
  "accepted",
  "in_progress",
  "completed",
  "dismissed",
  "unproven",
] as const;

export type LearningPathStatus = (typeof LEARNING_PATH_STATUSES)[number];

export type ApplicationTrigger = {
  surface: "experience" | "workspace";
  href: string;
  title: string;
  rationale: string;
};

export type LearningPathStep = {
  id: string;
  title: string;
  kind: LearningItemKind | "practice";
  prompt: string;
  applicationTrigger?: ApplicationTrigger | null;
};

export type LearningItemRecord = {
  id: string;
  userId: string;
  kind: LearningItemKind;
  title: string;
  topic: string;
  source: string;
  consumedOn: string | null;
  concepts: string[];
  reflection: string;
  relevanceToRole: string;
  relevanceToGaps: string[];
  targetCompetencyCodes: string[];
  evidenceLevel: LearningEvidenceLevel;
  evidenceId: string | null;
  learningPathId: string | null;
  applicationEvidenceIds: string[];
  applicationHref: string | null;
  /** Invariant: always false. */
  capabilityAssigned: false;
  /** Invariant: always true. */
  learningNotCapability: true;
  createdAt: string;
  updatedAt: string;
};

export type LearningPathRecord = {
  id: string;
  userId: string;
  title: string;
  rationale: string;
  targetGap: string | null;
  competencyCodes: string[];
  status: LearningPathStatus;
  applicationTrigger: ApplicationTrigger | null;
  steps: LearningPathStep[];
  sourceSnapshotId: string | null;
  sourceScoreRunId: string | null;
  frameworkVersionId: string | null;
  outcomeSupported: boolean;
  outcomeEvidenceId: string | null;
  capabilityAssigned: false;
  learningNotCapability: true;
  createdAt: string;
  updatedAt: string;
};

export type CreateLearningItemInput = {
  kind: LearningItemKind;
  title: string;
  topic?: string;
  source?: string;
  consumedOn?: string | null;
  concepts?: string[];
  reflection?: string;
  relevanceToRole?: string;
  relevanceToGaps?: string[];
  targetCompetencyCodes?: string[];
  learningPathId?: string | null;
  /** Optional starting level — clamped by progression rules. */
  evidenceLevel?: LearningEvidenceLevel;
};

export type LearningRecommendation = {
  pathTitle: string;
  rationale: string;
  targetGap: string;
  competencyCodes: string[];
  suggestedKinds: LearningItemKind[];
  concepts: string[];
  applicationTrigger: ApplicationTrigger;
  /** Completing learning alone never upgrades capability. */
  capabilityAssigned: false;
  learningNotCapability: true;
};

export const PI_LEARNING_PATH = "/learning";
export const PI_LEARNING_PROFILE_ALIAS = "/profile/learning";

export function isLearningEvidenceLevel(v: string): v is LearningEvidenceLevel {
  return (LEARNING_EVIDENCE_LEVELS as readonly string[]).includes(v);
}

export function isLearningItemKind(v: string): v is LearningItemKind {
  return (LEARNING_ITEM_KINDS as readonly string[]).includes(v);
}

export function levelRank(level: LearningEvidenceLevel): number {
  return LEARNING_EVIDENCE_LEVELS.indexOf(level);
}
