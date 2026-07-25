/** Experience planner — gap-ranked practice plans. Never assigns capability. */

export type ExperienceEmphasis =
  | "stakeholder"
  | "delivery"
  | "discovery"
  | "balanced";

export type ExperienceIndustry =
  | "healthcare"
  | "education"
  | "saas"
  | "product_management"
  | "project_management";

export type ScenarioEngine = "mediflow" | "shared";

export type ScenarioPersonaSeed = {
  id: "p-sarah" | "p-maya" | "p-james" | "p-priya" | "p-coach";
  name: string;
  role: string;
  kind: "teammate" | "stakeholder";
  responsibilities: string[];
  goals: string[];
  constraints: string[];
  knowledgeBoundaries: string[];
  communicationStyle: string;
  decisionAuthority: string;
  relationships: Array<{ personaId: string; relation: string }>;
  conflictTriggers: string[];
  escalationBehaviour: string;
  trust: number;
};

export type ScenarioRuntimePack = {
  experienceKey: string;
  businessContext: string;
  businessObjective: string;
  timelineDays: number;
  dependencies: string[];
  constraints: string[];
  successMetrics: string[];
  personas: ScenarioPersonaSeed[];
  tasks: Array<{
    id: string;
    title: string;
    status: "todo" | "in_progress" | "blocked" | "done";
    ownerPersonaId?: string;
    dueDay: number;
  }>;
  meetings: Array<{
    id: string;
    title: string;
    day: number;
    status: "scheduled" | "completed" | "cancelled";
    attendeeIds: string[];
    agenda: string;
  }>;
  messages: Array<{
    id: string;
    fromPersonaId: string;
    subject: string;
    body: string;
    day: number;
    read: boolean;
  }>;
  documents: Array<{
    id: string;
    title: string;
    summary: string;
    createdDay: number;
  }>;
  risks: Array<{
    id: string;
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    status: "open" | "mitigated" | "accepted";
  }>;
  coachingByEmphasis: Record<ExperienceEmphasis, string[]>;
  metrics: {
    projectRisk: number;
    timelinePressure: number;
    budgetHealth: number;
    scopeCreep: number;
    teamMorale: number;
    businessOutcome: number;
    revenueProtected: number;
    customerSatisfaction: number;
    engineeringCapacity: number;
    roadmapHealth: number;
  };
  consequenceCopy: {
    reviewContext: { summary: string; messageSubject: string; messageBody: string };
    discussOptions: { summary: string; meetingOutcome: string };
    makeDecision: {
      summary: string;
      meetingOutcome: string;
      messageSubject: string;
      messageBody: string;
      riskMitigatedTitle: string;
    };
  };
};

export type ExperienceScenarioDef = {
  slug: string;
  title: string;
  companyKey: string;
  companyName: string;
  projectKey: string;
  projectName: string;
  industry: ExperienceIndustry;
  /** Strings matched against onboarding industry preferences. */
  industryLabels: string[];
  roleFamily: string;
  candidateRole: string;
  problem: string;
  objectives: string[];
  emphasis: ExperienceEmphasis;
  competencyCodes: string[];
  promptVersion: string;
  summary: string;
  coachingFocus: string;
  /** Decision ids to surface / reorder for this emphasis. */
  decisionEmphasis: string[];
  frameworkSlug: string;
  frameworkVersion: string;
  engine: ScenarioEngine;
  runtime: ScenarioRuntimePack;
  isFallback?: boolean;
  /** Legacy MediFlow emphasis-only rows (still resolvable). */
  legacyEmphasisVariant?: boolean;
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
  companyName: string;
  companyKey: string;
  industry: ExperienceIndustry;
  projectName: string;
  candidateRole: string;
  problem: string;
  decisionEmphasis: string[];
  targetedCompetencies: string[];
  rankedGaps: RankedGap[];
  rationale: string;
  evidenceLinks: Array<{ kind: string; id: string; label?: string }>;
  href: string;
  targetRole: string | null;
  targetSeniority: string | null;
  preferredIndustries: string[];
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
  preferredIndustries?: string[];
  snapshotId?: string | null;
  scoreRunId?: string | null;
  frameworkVersionId?: string | null;
  evidenceRefs?: string[];
};
