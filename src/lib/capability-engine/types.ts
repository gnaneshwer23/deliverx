/** Capability Engine — shared types. Deterministic orchestration; no single mega-prompt. */

export const ALGORITHM_VERSION = "capability-engine-v1";
export const DEFAULT_RUBRIC_SLUG = "pm-core";
export const DEFAULT_RUBRIC_VERSION = "2026.1";
export const DEFAULT_MODEL_VERSION = "deterministic-v1";
export const DEFAULT_PROMPT_VERSION = "none-orchestrated";

/** Distinguishes evidence/intelligence kinds — learning ≠ competency. */
export const INTELLIGENCE_KINDS = [
  "knowledge",
  "applied_skill",
  "behaviour",
  "competency",
  "outcome",
  "potential",
  "readiness",
] as const;

export type IntelligenceKind = (typeof INTELLIGENCE_KINDS)[number];

export const CAPABILITY_LEVELS = [
  "emerging",
  "developing",
  "proficient",
  "advanced",
  "insufficient_evidence",
] as const;

export type CapabilityLevel = (typeof CAPABILITY_LEVELS)[number];

export type ReviewStatus =
  | "accepted"
  | "pending_review"
  | "rejected"
  | "superseded";

/** Structured judgement — every engine judgement must return this shape. */
export type StructuredJudgement = {
  competencyId: string;
  indicatorId: string;
  levelProposed: CapabilityLevel;
  evidenceReferences: string[];
  reasoningSummary: string;
  counterEvidence: string;
  confidence: number;
  limitations: string;
  modelVersion: string;
  promptVersion: string;
  rubricVersion: string;
  reviewStatus: ReviewStatus;
  intelligenceKinds: IntelligenceKind[];
};

export type EligibleEvidence = {
  id: string;
  sourceType: string;
  category: string;
  title: string;
  summary: string;
  capturedAt: string;
  status: string;
  contentHash: string;
  rawContent: Record<string, unknown>;
  actorType: string;
  userContribution: Record<string, unknown>;
  aiContribution: Record<string, unknown>;
  modelId?: string | null;
  modelVersion?: string | null;
};

export type NormalisedEvidence = EligibleEvidence & {
  intelligenceKinds: IntelligenceKind[];
  isKnowledgeOnly: boolean;
  isAiDominated: boolean;
  ageDays: number;
  normalisedText: string;
};

export type MappedIndicator = {
  evidenceId: string;
  competencyId: string;
  indicatorId: string;
  strengthHint: number;
  intelligenceKinds: IntelligenceKind[];
};

export type Contradiction = {
  competencyId: string;
  evidenceIds: string[];
  summary: string;
  severity: "low" | "medium" | "high";
};

export type AggregatedDemonstration = {
  competencyId: string;
  indicatorId: string;
  evidenceIds: string[];
  demonstrationCount: number;
  latestAt: string;
  kinds: IntelligenceKind[];
};

export type TargetRoleRequirements = {
  role: string;
  seniority: string;
  requiredCompetencies: Array<{
    competencyId: string;
    minLevel: CapabilityLevel;
  }>;
};

export type CapabilitySnapshotProfile = {
  schemaVersion: "1";
  algorithmVersion: string;
  rubricSlug: string;
  rubricVersion: string;
  modelVersion: string;
  promptVersion: string;
  generatedAt: string;
  readiness: number;
  dimensions: {
    knowledge: number;
    appliedSkill: number;
    behaviour: number;
    competency: number;
    outcome: number;
    potential: number;
    readiness: number;
  };
  judgements: StructuredJudgement[];
  strengths: string[];
  gaps: string[];
  recommendations: Array<{
    id: string;
    title: string;
    rationale: string;
    evidenceReferences: string[];
  }>;
  contradictions: Contradiction[];
  targetComparison: {
    role: string;
    seniority: string;
    met: string[];
    unmet: string[];
  };
  /** User-facing only — never include hidden model chain-of-thought. */
  explanations: Array<{ competencyId: string; text: string }>;
};

export type ReviewQueueItem = {
  reason: string;
  judgement?: StructuredJudgement;
  payload: Record<string, unknown>;
};

export type OrchestratorInput = {
  userId: string;
  evidence: EligibleEvidence[];
  targetRole?: string;
  targetSeniority?: string;
  rubricSlug?: string;
  rubricVersion?: string;
  /** Prior snapshot for growth comparison */
  previousSnapshot?: CapabilitySnapshotProfile | null;
  /** Simulate model failure in verifier adapter */
  forceModelFailure?: boolean;
  /** Simulate malformed structured output */
  forceMalformedOutput?: boolean;
  /** Deduplicate processing by input hash */
  skipIfDuplicateHash?: string | null;
  now?: Date;
};

export type OrchestratorResult = {
  ok: boolean;
  duplicate: boolean;
  inputHash: string;
  error?: string;
  judgements: StructuredJudgement[];
  snapshot: CapabilitySnapshotProfile | null;
  growth: {
    fromGeneratedAt: string | null;
    deltas: Array<{ competencyId: string; from: string; to: string }>;
  } | null;
  reviewQueue: ReviewQueueItem[];
  stepsCompleted: string[];
};
