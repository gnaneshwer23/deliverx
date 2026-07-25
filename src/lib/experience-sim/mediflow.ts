import type { ExperienceSimState, PersonaContract } from "@/lib/experience-sim/types";
import { EXPERIENCE_STATE_VERSION } from "@/lib/experience-sim/types";

function persona(
  partial: Omit<PersonaContract, "memory"> & { memory?: PersonaContract["memory"] },
): PersonaContract {
  return { memory: [], ...partial };
}

/** Company Generator + Project Generator + Team Generator — MediFlow TrustCare v1 only. */
export function generateMediFlowExperience(input: {
  userRole?: string;
  personalisedBy?: Record<string, unknown>;
  /** Phase 3 planner emphasis — reorders coaching + decision salience. */
  plannerEmphasis?: "stakeholder" | "delivery" | "discovery" | "balanced";
  planId?: string | null;
  planRationale?: string | null;
}): ExperienceSimState {
  const emphasis =
    input.plannerEmphasis ??
    (typeof input.personalisedBy?.plannerEmphasis === "string"
      ? (input.personalisedBy.plannerEmphasis as
          | "stakeholder"
          | "delivery"
          | "discovery"
          | "balanced")
      : "balanced");

  const coachingByEmphasis: Record<string, string[]> = {
    stakeholder: [
      "Clarify what is committed vs exploratory before answering James.",
      "Watch Sarah's trust — executive surprise is the primary failure mode.",
      "Facilitate James and Maya into one shared commitment narrative.",
    ],
    delivery: [
      "Start with Maya's capacity (64%) before any date commitment.",
      "Protect quality — unscoped commits are the delivery failure mode.",
      "Name what is in / out of TrustCare pilot scope explicitly.",
    ],
    discovery: [
      "Review the TrustCare brief and customer pulse before responding to Sales.",
      "Ask what evidence would change the pilot date decision.",
      "Separate problem clarity from commercial pressure.",
    ],
    balanced: [
      "Clarify what is committed vs exploratory before answering James.",
    ],
  };

  const decisionsBase = [
    {
      id: "review_context",
      label: "Review context",
      description: "Gather facts from Maya and the brief before responding to Sales.",
      impactHints: { trust: 4, delivery: 2, clarity: 6 },
    },
    {
      id: "discuss_options",
      label: "Discuss options",
      description: "Facilitate a trade-off conversation between James and Maya.",
      impactHints: { trust: 6, delivery: 3, clarity: 5 },
    },
    {
      id: "make_decision",
      label: "Make decision",
      description: "Commit or renegotiate the pilot date with a clear rationale.",
      impactHints: { trust: 8, delivery: 5, clarity: 4 },
    },
  ];

  const orderByEmphasis: Record<string, string[]> = {
    stakeholder: ["discuss_options", "make_decision", "review_context"],
    delivery: ["review_context", "make_decision", "discuss_options"],
    discovery: ["review_context", "discuss_options", "make_decision"],
    balanced: ["review_context", "discuss_options", "make_decision"],
  };
  const order = orderByEmphasis[emphasis] ?? orderByEmphasis.balanced;
  const availableDecisions = order
    .map((id) => decisionsBase.find((d) => d.id === id)!)
    .filter(Boolean);

  const sarah = persona({
    id: "p-sarah",
    name: "Sarah Chen",
    role: "CEO",
    kind: "stakeholder",
    responsibilities: ["Set company direction", "Protect revenue"],
    goals: ["Ship TrustCare without brand damage"],
    constraints: ["Board scrutiny", "Limited runway narrative"],
    knowledgeBoundaries: ["Does not deep-dive engineering estimates"],
    communicationStyle: "Direct, executive, time-poor",
    decisionAuthority: "Final go/no-go on customer commitments",
    relationships: [
      { personaId: "p-maya", relation: "relies_on" },
      { personaId: "p-james", relation: "tension" },
    ],
    conflictTriggers: ["Slipped customer promises", "Surprise scope"],
    escalationBehaviour: "Calls emergency steering if trust < 60",
    trust: 91,
  });

  const maya = persona({
    id: "p-maya",
    name: "Maya Patel",
    role: "Engineering Lead",
    kind: "teammate",
    responsibilities: ["Delivery feasibility", "Tech risk"],
    goals: ["Protect quality and capacity"],
    constraints: ["Team at 64% capacity"],
    knowledgeBoundaries: ["No final commercial pricing"],
    communicationStyle: "Precise, sceptical of vague asks",
    decisionAuthority: "Technical sequencing",
    relationships: [
      { personaId: "p-sarah", relation: "reports_context" },
      { personaId: "p-user", relation: "partner" },
    ],
    conflictTriggers: ["Unscoped commits", "Hero culture"],
    escalationBehaviour: "Flags risk in writing before slipping dates",
    trust: 72,
  });

  const james = persona({
    id: "p-james",
    name: "James Wilson",
    role: "Sales Director",
    kind: "stakeholder",
    responsibilities: ["Close deals", "Customer expansion"],
    goals: ["Promise TrustCare to key account this quarter"],
    constraints: ["Quota pressure"],
    knowledgeBoundaries: ["Underestimates engineering effort"],
    communicationStyle: "Optimistic, urgency-driven",
    decisionAuthority: "Commercial commitments (contested)",
    relationships: [
      { personaId: "p-sarah", relation: "lobbying" },
      { personaId: "p-maya", relation: "conflict" },
    ],
    conflictTriggers: ["Pushback on dates"],
    escalationBehaviour: "CCs CEO when blocked",
    trust: 48,
  });

  const priya = persona({
    id: "p-priya",
    name: "Priya Shah",
    role: "Customer Success",
    kind: "stakeholder",
    responsibilities: ["Retain accounts", "Surface customer risk"],
    goals: ["Keep TrustCare pilot healthy"],
    constraints: ["Customer already frustrated"],
    knowledgeBoundaries: ["Not a product owner"],
    communicationStyle: "Empathetic, escalation-aware",
    decisionAuthority: "Customer communication tone",
    relationships: [{ personaId: "p-sarah", relation: "informs" }],
    conflictTriggers: ["Radio silence to customer"],
    escalationBehaviour: "Opens severity ticket to exec",
    trust: 85,
  });

  const coach = persona({
    id: "p-coach",
    name: "Experience Coach",
    role: "AI Coach",
    kind: "teammate",
    responsibilities: ["Surface trade-offs", "Never decide for user"],
    goals: ["Build judgement through consequence"],
    constraints: ["No capability score assignment"],
    knowledgeBoundaries: ["Cannot invent unverified customer facts"],
    communicationStyle: "Socratic, concise",
    decisionAuthority: "Advisory only",
    relationships: [{ personaId: "p-user", relation: "coaches" }],
    conflictTriggers: [],
    escalationBehaviour: "Asks clarifying questions",
  });

  return {
    schemaVersion: EXPERIENCE_STATE_VERSION,
    lifecycle: "active",
    company: {
      id: "co-mediflow",
      name: "MediFlow",
      industry: "Healthtech",
      businessContext:
        "MediFlow sells care-coordination software to mid-market clinics. TrustCare is a high-visibility patient messaging add-on.",
      businessObjective:
        "Land a clean TrustCare pilot with Metro Clinic without burning engineering or brand trust.",
    },
    project: {
      id: "proj-trustcare",
      name: "TrustCare Pilot — Metro Clinic",
      successMetrics: [
        "Pilot kickoff date held or consciously renegotiated",
        "Engineering capacity stays above 55%",
        "No stakeholder trust below 40",
        "Customer satisfaction pulse ≥ 70",
      ],
      constraints: ["Day-1 decision window", "One major customer promise already floated"],
      timelineDays: 14,
      dependencies: ["Security review", "Clinic SSO setup", "Message template pack"],
    },
    userRole: input.userRole || "Associate Product Manager",
    day: 1,
    metrics: {
      stakeholderTrust: {
        "p-sarah": 91,
        "p-maya": 72,
        "p-james": 48,
        "p-priya": 85,
      },
      projectRisk: 42,
      timelinePressure: 55,
      budgetHealth: 78,
      scopeCreep: 20,
      teamMorale: 70,
      businessOutcome: 60,
      revenueProtected: 120000,
      customerSatisfaction: 78,
      engineeringCapacity: 64,
      roadmapHealth: 82,
    },
    team: [maya, coach],
    stakeholders: [sarah, james, priya],
    tasks: [
      {
        id: "t-brief",
        title: "Read TrustCare pilot brief",
        status: "todo",
        dueDay: 1,
      },
      {
        id: "t-align",
        title: "Align Sales vs Engineering on pilot date",
        status: "todo",
        ownerPersonaId: "p-maya",
        dueDay: 2,
      },
    ],
    meetings: [
      {
        id: "m-standup",
        title: "TrustCare huddle",
        day: 1,
        status: "scheduled",
        attendeeIds: ["p-maya", "p-james", "p-user"],
        agenda: "Date commitment vs capacity",
      },
    ],
    messages: [
      {
        id: "msg-james",
        fromPersonaId: "p-james",
        subject: "Metro Clinic wants a hard date",
        body: "Can we confirm TrustCare pilot for next Tuesday? They're waiting on my email.",
        day: 1,
        read: false,
      },
      {
        id: "msg-priya",
        fromPersonaId: "p-priya",
        subject: "Customer pulse",
        body: "Metro Clinic CSAT soft. Please don't surprise them.",
        day: 1,
        read: false,
      },
    ],
    documents: [
      {
        id: "d-brief",
        title: "TrustCare pilot one-pager",
        summary: "Scope: secure messaging + triage rules. Out of scope: billing.",
        createdDay: 1,
      },
    ],
    risks: [
      {
        id: "r-overpromise",
        title: "Sales over-promise on pilot date",
        severity: "high",
        status: "open",
      },
    ],
    decisions: [],
    consequences: [],
    reflections: [],
    coachingHints: coachingByEmphasis[emphasis] ?? coachingByEmphasis.balanced,
    availableDecisions,
    completion: {
      decisionMade: false,
      consequenceApplied: false,
      meetingRecorded: false,
      reflectionCaptured: false,
      observationEmitted: false,
    },
    planner: {
      planId: input.planId ?? null,
      emphasis,
      rationale: input.planRationale ?? null,
      experienceKey: "mediflow_trustcare_v1",
    },
  };
}

export function isExperienceSimState(value: unknown): value is ExperienceSimState {
  if (!value || typeof value !== "object") return false;
  const v = value as { schemaVersion?: number };
  return v.schemaVersion === EXPERIENCE_STATE_VERSION;
}
