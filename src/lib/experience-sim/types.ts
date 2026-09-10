/** Persistent Experience simulation — state model & contracts. */

export const EXPERIENCE_STATE_VERSION = 2 as const;

export type ExperienceLifecycle =
  | "draft"
  | "active"
  | "reflecting"
  | "assessing"
  | "completed"
  | "failed"
  | "paused";

export type PersonaContract = {
  id: string;
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
  memory: Array<{ at: string; note: string; eventType: string }>;
  conflictTriggers: string[];
  escalationBehaviour: string;
  trust?: number;
};

export type SimTask = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  ownerPersonaId?: string;
  dueDay: number;
};

export type SimMeeting = {
  id: string;
  title: string;
  day: number;
  status: "scheduled" | "completed" | "cancelled";
  attendeeIds: string[];
  agenda: string;
  outcome?: string;
};

export type SimMessage = {
  id: string;
  fromPersonaId: string;
  subject: string;
  body: string;
  day: number;
  read: boolean;
};

export type SimDocument = {
  id: string;
  title: string;
  summary: string;
  createdDay: number;
};

export type SimRisk = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "mitigated" | "accepted";
};

export type SimDecision = {
  id: string;
  choiceId: string;
  label: string;
  rationale: string;
  day: number;
  userContribution: Record<string, unknown>;
  aiContribution: Record<string, unknown>;
};

export type ProjectMetrics = {
  stakeholderTrust: Record<string, number>;
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

export type HiringInterviewStatus = "pending" | "in_progress" | "completed" | "skipped";

export type HiringInterviewSpeakerRole = "manager" | "stakeholder" | "candidate";

export type HiringInterviewTurn = {
  id: string;
  role: HiringInterviewSpeakerRole;
  speakerId: string;
  speakerName: string;
  text: string;
  citations: Array<{ sourceType: string; sourceId: string; excerpt?: string; label?: string }>;
  at: string;
};

export type HiringPanelMember = {
  id: string;
  name: string;
  role: string;
  kind: "teammate" | "stakeholder";
};

export type HiringPlacement = {
  companyName: string;
  roleTitle: string;
  projectName: string;
  teamSummary: string;
  firstWeekFocus: string;
  honesty: string;
};

export type HiringInterviewState = {
  status: HiringInterviewStatus;
  panel: { manager: HiringPanelMember; stakeholder: HiringPanelMember };
  turns: HiringInterviewTurn[];
  placement: HiringPlacement | null;
  completedAt?: string;
};

export type ExperienceSimState = {
  schemaVersion: typeof EXPERIENCE_STATE_VERSION;
  lifecycle: ExperienceLifecycle;
  company: {
    id: string;
    name: string;
    industry: string;
    businessContext: string;
    businessObjective: string;
  };
  project: {
    id: string;
    name: string;
    successMetrics: string[];
    constraints: string[];
    timelineDays: number;
    dependencies: string[];
  };
  userRole: string;
  day: number;
  metrics: ProjectMetrics;
  team: PersonaContract[];
  stakeholders: PersonaContract[];
  tasks: SimTask[];
  meetings: SimMeeting[];
  messages: SimMessage[];
  documents: SimDocument[];
  risks: SimRisk[];
  decisions: SimDecision[];
  consequences: Array<{ id: string; summary: string; day: number; effects: Record<string, number> }>;
  reflections: Array<{ id: string; text: string; day: number }>;
  coachingHints: string[];
  availableDecisions: Array<{
    id: string;
    label: string;
    description: string;
    impactHints: { trust: number; delivery: number; clarity: number };
  }>;
  completion: {
    decisionMade: boolean;
    consequenceApplied: boolean;
    meetingRecorded: boolean;
    reflectionCaptured: boolean;
    observationEmitted: boolean;
  };
  /** Optional Phase 3 planner metadata — emphasis only; never capability. */
  planner?: {
    planId: string | null;
    emphasis: "stakeholder" | "delivery" | "discovery" | "balanced";
    rationale: string | null;
    experienceKey: string;
  };
  /**
   * Optional Experience hiring interview (slice 1). Placement only — never
   * capability, scores, or Verified. Absent on enrolments started before this slice.
   */
  hiringInterview?: HiringInterviewState;
  /** Multi-company catalogue metadata for shared consequence copy. */
  scenarioMeta?: {
    slug: string;
    companyKey: string;
    problem: string;
    consequenceCopy?: {
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
};

export type ExperienceSimEventType =
  | "ExperienceStarted"
  | "HiringInterviewStarted"
  | "HiringInterviewTurn"
  | "HiringInterviewCompleted"
  | "HiringInterviewSkipped"
  | "DecisionRecorded"
  | "ConsequenceApplied"
  | "TaskUpdated"
  | "MeetingScheduled"
  | "MeetingCompleted"
  | "MessageSent"
  | "RiskChanged"
  | "PersonaMemoryUpdated"
  | "ObservationEmitted"
  | "CoachingHintIssued"
  | "ReflectionCaptured"
  | "ExperienceCompleted";
