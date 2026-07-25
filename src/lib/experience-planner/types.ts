/** Experience planner — gap-ranked practice plans. Never assigns capability. */

export type ExperienceEmphasis =
  | "stakeholder"
  | "delivery"
  | "discovery"
  | "balanced";

export type ExperienceScenarioDef = {
  slug: string;
  title: string;
  companyKey: "mediflow";
  projectKey: "trustcare";
  emphasis: ExperienceEmphasis;
  competencyCodes: string[];
  promptVersion: string;
  summary: string;
  coachingFocus: string;
  /** Decision ids to surface / reorder for this emphasis. */
  decisionEmphasis: string[];
  frameworkSlug: string;
  frameworkVersion: string;
  isFallback?: boolean;
};

export type RankedGap = {
  gap: string;
  competencyId: string | null;
  level: string | null;
  score: number;
  matchedEmphasis: ExperienceEmphasis | null;
};

export type ExperiencePlanRecommendation = {
  scenarioSlug: string;
  emphasis: ExperienceEmphasis;
  title: string;
  summary: string;
  coachingFocus: string;
  decisionEmphasis: string[];
  targetedCompetencies: string[];
  rankedGaps: RankedGap[];
  rationale: string;
  evidenceLinks: Array<{ kind: string; id: string; label?: string }>;
  href: string;
  targetRole: string | null;
  targetSeniority: string | null;
  snapshotId: string | null;
  scoreRunId: string | null;
  frameworkVersionId: string | null;
  plannerVersion: string;
  /** Explicit: planner never writes levels. */
  capabilityAssigned: false;
};

export type ExperiencePlanRecord = ExperiencePlanRecommendation & {
  id: string;
  status: "active" | "accepted" | "completed" | "superseded";
  createdAt: string;
  enrolmentId: string | null;
};

export type PlanFromGapsInput = {
  gaps: string[];
  levels?: Array<{
    competencyId: string;
    level: string;
    confidence?: number;
  }>;
  recommendations?: Array<{ title: string; rationale?: string }>;
  targetRole?: string | null;
  targetSeniority?: string | null;
  snapshotId?: string | null;
  scoreRunId?: string | null;
  frameworkVersionId?: string | null;
  evidenceRefs?: string[];
};
