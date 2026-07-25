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
};

export type ExperienceSimEventType =
  | "ExperienceStarted"
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
