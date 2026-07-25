/**
 * Runtime content packs for Experience scenarios.
 * Shared structural IDs (p-sarah/p-maya/p-james/p-priya) keep consequence engines portable.
 */

import type {
  ExperienceEmphasis,
  ScenarioPersonaSeed,
  ScenarioRuntimePack,
} from "@/lib/experience-planner/types";

function coach(): ScenarioPersonaSeed {
  return {
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
    trust: 80,
  };
}

function defaultCoaching(
  custom: Partial<Record<ExperienceEmphasis, string[]>>,
): Record<ExperienceEmphasis, string[]> {
  return {
    stakeholder: custom.stakeholder ?? [
      "Clarify what is committed vs exploratory before answering commercial pressure.",
      "Watch executive trust — surprise is the primary failure mode.",
    ],
    delivery: custom.delivery ?? [
      "Start with capacity and dependencies before any date commitment.",
      "Name what is in / out of scope explicitly.",
    ],
    discovery: custom.discovery ?? [
      "Review the brief and customer pulse before responding.",
      "Ask what evidence would change the decision.",
    ],
    balanced: custom.balanced ?? [
      "Balance fact-gathering, facilitation, and a clear commit-or-renegotiate call.",
    ],
  };
}

function baseMetrics(
  overrides: Partial<ScenarioRuntimePack["metrics"]> = {},
): ScenarioRuntimePack["metrics"] {
  return {
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
    ...overrides,
  };
}

export const MEDIFLOW_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "mediflow_trustcare_v1",
  businessContext:
    "MediFlow sells care-coordination software to mid-market clinics. TrustCare is a high-visibility patient messaging add-on.",
  businessObjective:
    "Land a clean TrustCare pilot with Metro Clinic without burning engineering or brand trust.",
  timelineDays: 14,
  dependencies: ["Security review", "Clinic SSO setup", "Message template pack"],
  constraints: ["Day-1 decision window", "One major customer promise already floated"],
  successMetrics: [
    "Pilot kickoff date held or consciously renegotiated",
    "Engineering capacity stays above 55%",
    "No stakeholder trust below 40",
    "Customer satisfaction pulse ≥ 70",
  ],
  personas: [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Read TrustCare pilot brief", status: "todo", dueDay: 1 },
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
  coachingByEmphasis: defaultCoaching({
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
  }),
  metrics: baseMetrics(),
  consequenceCopy: {
    reviewContext: {
      summary: "You slowed to review context. Engineering trust rose; Sales feels delayed.",
      messageSubject: "Capacity reality check",
      messageBody:
        "Thanks for asking. We're at 64% — Tuesday is aggressive without cutting scope.",
    },
    discussOptions: {
      summary: "You facilitated options. Trade-offs are clearer; huddle can complete.",
      meetingOutcome:
        "Agreed to present two date options to Metro Clinic with scope notes.",
    },
    makeDecision: {
      summary:
        "You made an explicit call: renegotiate Tuesday to a scoped Friday pilot. Stakeholders realign.",
      meetingOutcome:
        "Decision: Friday pilot with messaging-only scope; billing deferred.",
      messageSubject: "Clear decision — thank you",
      messageBody:
        "Friday with scoped TrustCare is acceptable. Keep customer success in the loop for the email.",
      riskMitigatedTitle: "Sales over-promise on pilot date",
    },
  },
};

export const VITALSYNC_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "vitalsync_ehr_rollout_v1",
  businessContext:
    "VitalSync provides cloud EHR modules to regional hospital groups. A flagship clinic is mid-migration.",
  businessObjective:
    "Sequence the EHR go-live so clinical ops stay safe while the board sees progress.",
  timelineDays: 21,
  dependencies: ["Data migration dry-run", "Clinician training", "Cutover window"],
  constraints: ["Weekend cutover only", "No double-booking of on-call engineers"],
  successMetrics: [
    "Cutover window held or consciously slipped with clinical sign-off",
    "No critical patient-safety risk open",
    "Training completion ≥ 80%",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Dr. Helen Okonkwo",
      role: "Chief Medical Officer",
      kind: "stakeholder",
      responsibilities: ["Clinical safety", "Physician adoption"],
      goals: ["Zero unsafe go-live"],
      constraints: ["Board wants a public date"],
      knowledgeBoundaries: ["Not a software estimator"],
      communicationStyle: "Evidence-first, cautious",
      decisionAuthority: "Clinical go/no-go",
      relationships: [{ personaId: "p-maya", relation: "relies_on" }],
      conflictTriggers: ["Rushed cutovers"],
      escalationBehaviour: "Halts go-live publicly",
      trust: 88,
    },
    {
      id: "p-maya",
      name: "Chris Nguyen",
      role: "Platform Lead",
      kind: "teammate",
      responsibilities: ["Migration reliability", "On-call readiness"],
      goals: ["Protect dry-run quality"],
      constraints: ["Team at 58% after support load"],
      knowledgeBoundaries: ["No board politics"],
      communicationStyle: "Blunt, checklist-driven",
      decisionAuthority: "Technical cutover readiness",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Skipping dry-runs"],
      escalationBehaviour: "Writes risk memo",
      trust: 70,
    },
    {
      id: "p-james",
      name: "Marcus Hale",
      role: "Hospital CIO Sponsor",
      kind: "stakeholder",
      responsibilities: ["Budget", "Vendor pressure"],
      goals: ["Announce go-live this quarter"],
      constraints: ["Board pack due Friday"],
      knowledgeBoundaries: ["Underestimates training lag"],
      communicationStyle: "Deadline-driven",
      decisionAuthority: "Commercial schedule pressure",
      relationships: [{ personaId: "p-sarah", relation: "lobbying" }],
      conflictTriggers: ["Date pushback"],
      escalationBehaviour: "Emails the board early",
      trust: 52,
    },
    {
      id: "p-priya",
      name: "Ana Ruiz",
      role: "Clinical Ops Lead",
      kind: "stakeholder",
      responsibilities: ["Ward workflows", "Training uptake"],
      goals: ["Staff feel ready"],
      constraints: ["Night-shift coverage thin"],
      knowledgeBoundaries: ["Not vendor contract owner"],
      communicationStyle: "Practical, floor-focused",
      decisionAuthority: "Ops readiness signal",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Surprise schedule changes"],
      escalationBehaviour: "Flags unsafe staffing",
      trust: 81,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review cutover readiness brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align CIO date pressure vs clinical safety",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "EHR cutover huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Go-live date vs dry-run gaps",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Board pack needs a hard go-live date",
      body: "Can we lock next Sunday? I need something firm for the board.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Training still at 61%",
      body: "Night shift hasn't finished modules. A surprise cutover will break trust.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Cutover readiness one-pager",
      summary: "Dry-run #2 failed two pharmacy interfaces. Training lag on nights.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Unsafe go-live under board pressure",
      severity: "critical",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    delivery: [
      "Protect dry-run quality before any public date.",
      "Name the pharmacy interface gap explicitly.",
    ],
    stakeholder: [
      "Translate clinical risk into board-ready language for Marcus.",
      "Keep Helen's clinical go/no-go visible.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 58,
    timelinePressure: 70,
    engineeringCapacity: 58,
    customerSatisfaction: 71,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You slowed to review cutover readiness. Platform trust rose; the CIO feels delayed.",
      messageSubject: "Dry-run reality check",
      messageBody:
        "Pharmacy interfaces still fail under load. Sunday is unsafe without a scoped deferral.",
    },
    discussOptions: {
      summary: "You facilitated clinical vs CIO options. Trade-offs are clearer.",
      meetingOutcome:
        "Agreed to present a safe cutover window plus a contingency weekend.",
    },
    makeDecision: {
      summary:
        "You locked a scoped deferred cutover with clinical sign-off. Stakeholders realign.",
      meetingOutcome:
        "Decision: slip one week; pharmacy interfaces + night training gate go-live.",
      messageSubject: "Clear cutover call",
      messageBody:
        "Deferred window accepted if we show a crisp readiness checklist to the board.",
      riskMitigatedTitle: "Unsafe go-live under board pressure",
    },
  },
};

export const CAREBRIDGE_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "carebridge_referral_v1",
  businessContext:
    "CareBridge connects GP practices to specialist referral networks. A regional health board pilot is at risk.",
  businessObjective:
    "Launch the referral network pilot with clear SLAs and without burning partner trust.",
  timelineDays: 18,
  dependencies: ["Partner API keys", "SLA draft", "GP clinic onboarding"],
  constraints: ["Pilot announced publicly", "Legal still reviewing data sharing"],
  successMetrics: [
    "Partner SLA agreed or consciously renegotiated",
    "≥ 3 clinics onboarded with working referrals",
    "No open critical data-sharing risk",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Lydia Grant",
      role: "Network Director",
      kind: "stakeholder",
      responsibilities: ["Partner relationships", "Public commitments"],
      goals: ["Pilot looks competent externally"],
      constraints: ["Press already briefed"],
      knowledgeBoundaries: ["Not deep on API latency"],
      communicationStyle: "Diplomatic, reputation-aware",
      decisionAuthority: "Partner communication",
      relationships: [{ personaId: "p-james", relation: "tension" }],
      conflictTriggers: ["Public embarrassment"],
      escalationBehaviour: "Calls emergency partner call",
      trust: 84,
    },
    {
      id: "p-maya",
      name: "Omar Farouk",
      role: "Integrations Lead",
      kind: "teammate",
      responsibilities: ["Partner APIs", "Latency budgets"],
      goals: ["Stable referral handoff"],
      constraints: ["Two partners still sandbox-only"],
      knowledgeBoundaries: ["No press strategy"],
      communicationStyle: "Technical, cautious",
      decisionAuthority: "Integration readiness",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Live traffic before sandbox pass"],
      escalationBehaviour: "Blocks production keys",
      trust: 68,
    },
    {
      id: "p-james",
      name: "Becky Stone",
      role: "Partnerships Lead",
      kind: "stakeholder",
      responsibilities: ["Sign partners", "Keep SLAs aggressive"],
      goals: ["Announce five live partners"],
      constraints: ["Quota on signed logos"],
      knowledgeBoundaries: ["Underestimates legal lag"],
      communicationStyle: "Persuasive, urgent",
      decisionAuthority: "Commercial partner promises",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Slow onboarding"],
      escalationBehaviour: "CCs Network Director",
      trust: 45,
    },
    {
      id: "p-priya",
      name: "Tom Adeyemi",
      role: "GP Clinic Champion",
      kind: "stakeholder",
      responsibilities: ["Clinic workflows", "Frontline feedback"],
      goals: ["Referrals that actually arrive"],
      constraints: ["Staff already juggling paper forms"],
      knowledgeBoundaries: ["Not vendor legal"],
      communicationStyle: "Practical, impatient with fluff",
      decisionAuthority: "Clinic pilot willingness",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Broken referral loops"],
      escalationBehaviour: "Withdraws clinic from pilot",
      trust: 76,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Read partner pilot brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align partner promises vs integration readiness",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Referral pilot huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Live partners vs sandbox reality",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Need five live partners for the press note",
      body: "Can we flip the remaining sandboxes to production this week?",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Clinic referral still dangling",
      body: "We sent two test referrals that never acknowledged. Don't add more clinics yet.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Partner pilot one-pager",
      summary: "Legal data-sharing still draft. Two of five APIs sandbox-only.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Public partner count exceeds technical readiness",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    stakeholder: [
      "Protect Lydia's public narrative without lying about live partners.",
      "Facilitate Becky and Omar into one honest SLA story.",
    ],
    discovery: [
      "Validate the dangling referral loop before expanding clinics.",
      "Separate press goals from technical evidence.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 50,
    timelinePressure: 62,
    engineeringCapacity: 61,
    customerSatisfaction: 66,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed integration evidence. Integrations trust rose; Partnerships feels delayed.",
      messageSubject: "Sandbox reality check",
      messageBody:
        "Two partners still fail acknowledgement under load. Live flip this week is unsafe.",
    },
    discussOptions: {
      summary: "You facilitated partner-count options with honest SLAs.",
      meetingOutcome:
        "Agreed to announce three live partners + two sandbox with dated criteria.",
    },
    makeDecision: {
      summary:
        "You reset the public partner count to match readiness. Stakeholders realign.",
      meetingOutcome:
        "Decision: three live partners; sandbox partners gated on acknowledgement tests.",
      messageSubject: "Honest pilot narrative",
      messageBody:
        "Three live partners with clear SLAs is acceptable. Keep the clinic champion updated.",
      riskMitigatedTitle: "Public partner count exceeds technical readiness",
    },
  },
};

export const BRIGHTPATH_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "brightpath_adaptive_v1",
  businessContext:
    "BrightPath Academy builds adaptive learning for secondary schools. A district wants an MVP module this term.",
  businessObjective:
    "Ship a credible adaptive practice MVP without overclaiming learning outcomes.",
  timelineDays: 28,
  dependencies: ["Curriculum mapping", "Teacher pilot cohort", "Analytics events"],
  constraints: ["Term ends in six weeks", "Accessibility review incomplete"],
  successMetrics: [
    "MVP scope locked to one subject strand",
    "Teacher pilot NPS ≥ 30",
    "No overclaimed outcome language in parent comms",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Nina Brooks",
      role: "Head of Curriculum",
      kind: "stakeholder",
      responsibilities: ["Pedagogy integrity", "District trust"],
      goals: ["Evidence-based claims only"],
      constraints: ["Parents already emailed about 'AI tutoring'"],
      knowledgeBoundaries: ["Not sprint planner"],
      communicationStyle: "Measured, values-led",
      decisionAuthority: "Curriculum go/no-go",
      relationships: [{ personaId: "p-james", relation: "tension" }],
      conflictTriggers: ["Outcome overclaims"],
      escalationBehaviour: "Pulls district pilot",
      trust: 86,
    },
    {
      id: "p-maya",
      name: "Dev Kapoor",
      role: "Learning Eng Lead",
      kind: "teammate",
      responsibilities: ["Adaptive engine", "Event quality"],
      goals: ["Ship a thin reliable loop"],
      constraints: ["Accessibility bugs open"],
      knowledgeBoundaries: ["No district politics"],
      communicationStyle: "Detail-oriented",
      decisionAuthority: "Technical MVP scope",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Feature sprawl"],
      escalationBehaviour: "Flags a11y blockers",
      trust: 74,
    },
    {
      id: "p-james",
      name: "Claire Dunn",
      role: "Growth Lead",
      kind: "stakeholder",
      responsibilities: ["District expansion", "Demo narrative"],
      goals: ["Show full personalisation in demos"],
      constraints: ["Sales deck already promises three subjects"],
      knowledgeBoundaries: ["Underestimates a11y work"],
      communicationStyle: "Story-first, optimistic",
      decisionAuthority: "External demo promises",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Scope cuts"],
      escalationBehaviour: "Forwards parent emails to exec",
      trust: 50,
    },
    {
      id: "p-priya",
      name: "Jordan Lee",
      role: "Pilot Teacher",
      kind: "stakeholder",
      responsibilities: ["Classroom reality", "Student feedback"],
      goals: ["Something teachers can run Monday"],
      constraints: ["40-minute periods"],
      knowledgeBoundaries: ["Not vendor roadmap"],
      communicationStyle: "Direct, time-poor",
      decisionAuthority: "Classroom pilot willingness",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Tools that need prep time"],
      escalationBehaviour: "Skips using the product",
      trust: 79,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review adaptive MVP brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align demo promises vs one-strand MVP",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Adaptive MVP huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Subject scope vs demo narrative",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "District demo wants three subjects",
      body: "Can we keep multi-subject in the deck? They're visiting Thursday.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "I need a Monday-ready flow",
      body: "If setup takes more than 5 minutes, my class won't use it.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Adaptive MVP one-pager",
      summary: "One maths strand ready; a11y contrast bugs open; analytics partial.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Demo overclaims multi-subject personalisation",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    discovery: [
      "Separate learning-outcome claims from what the MVP can evidence.",
      "Start from the teacher Monday flow before expanding subjects.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 44,
    timelinePressure: 60,
    engineeringCapacity: 67,
    roadmapHealth: 70,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed MVP readiness. Engineering trust rose; Growth feels delayed.",
      messageSubject: "A11y + strand reality",
      messageBody:
        "One maths strand is solid. Multi-subject would slip a11y and teacher prep.",
    },
    discussOptions: {
      summary: "You facilitated a one-strand MVP vs demo narrative trade-off.",
      meetingOutcome:
        "Agreed to demo one strand live and mark others as roadmap with dates.",
    },
    makeDecision: {
      summary:
        "You locked a one-strand MVP and reset demo claims. Stakeholders realign.",
      meetingOutcome:
        "Decision: ship maths strand; revise deck; a11y gate before parent email.",
      messageSubject: "Honest MVP narrative",
      messageBody:
        "One-strand demo with clear next subjects is acceptable to curriculum.",
      riskMitigatedTitle: "Demo overclaims multi-subject personalisation",
    },
  },
};

export const CAMPUSFLOW_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "campusflow_onboarding_v1",
  businessContext:
    "CampusFlow runs student onboarding for universities. Autumn intake go-live is two weeks out.",
  businessObjective:
    "Recover a slipping onboarding release without breaking registrar trust.",
  timelineDays: 14,
  dependencies: ["Identity federation", "Housing form", "Payment gateway"],
  constraints: ["Hard intake date", "Vendor SLA already waived once"],
  successMetrics: [
    "Critical path services green before intake",
    "Registrar communications accurate",
    "No payment outage during peak window",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Patricia Moen",
      role: "University Registrar",
      kind: "stakeholder",
      responsibilities: ["Student intake integrity", "Comms accuracy"],
      goals: ["Students complete onboarding without chaos"],
      constraints: ["Parents already asking for dates"],
      knowledgeBoundaries: ["Not vendor engineering"],
      communicationStyle: "Formal, risk-averse",
      decisionAuthority: "Go-live communication",
      relationships: [{ personaId: "p-james", relation: "tension" }],
      conflictTriggers: ["Surprise outages"],
      escalationBehaviour: "Escalates to VC office",
      trust: 82,
    },
    {
      id: "p-maya",
      name: "Samir Patel",
      role: "Release Manager",
      kind: "teammate",
      responsibilities: ["Release train", "Dependency tracking"],
      goals: ["Protect critical path"],
      constraints: ["Payment vendor delayed"],
      knowledgeBoundaries: ["No university politics"],
      communicationStyle: "Checklist, calm under pressure",
      decisionAuthority: "Release readiness",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Scope adds mid-freeze"],
      escalationBehaviour: "Opens war-room",
      trust: 71,
    },
    {
      id: "p-james",
      name: "Ellie Park",
      role: "Student Experience Director",
      kind: "stakeholder",
      responsibilities: ["Student NPS", "Housing experience"],
      goals: ["Keep housing form in this release"],
      constraints: ["Marketing already advertised housing self-serve"],
      knowledgeBoundaries: ["Underestimates payment dependency"],
      communicationStyle: "Empathetic, insistent",
      decisionAuthority: "Experience scope pressure",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Cutting student-facing features"],
      escalationBehaviour: "Forwards parent complaints",
      trust: 55,
    },
    {
      id: "p-priya",
      name: "Noah Kim",
      role: "Support Desk Lead",
      kind: "stakeholder",
      responsibilities: ["Ticket volume", "Script accuracy"],
      goals: ["Supportable go-live"],
      constraints: ["Temps not hired yet"],
      knowledgeBoundaries: ["Not product owner"],
      communicationStyle: "Operational, blunt",
      decisionAuthority: "Support readiness signal",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Unscripted failures"],
      escalationBehaviour: "Declares support red",
      trust: 77,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review intake release brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align housing scope vs payment critical path",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Intake release huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Housing form vs payment gate",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Housing self-serve must stay",
      body: "Parents saw the email. Pulling housing will create a firestorm.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Support red if payment flakes",
      body: "We cannot staff payment tickets and housing tickets the same week.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Intake release one-pager",
      summary: "Payment vendor ETA slipped 5 days. Housing form 70% complete.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Housing included despite payment critical-path slip",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    delivery: [
      "Protect payment critical path before housing niceties.",
      "Make the release train visible to Ellie and Patricia.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 61,
    timelinePressure: 78,
    engineeringCapacity: 55,
    teamMorale: 62,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed critical-path status. Release trust rose; Student Experience feels delayed.",
      messageSubject: "Payment gate reality",
      messageBody:
        "Payment vendor still red. Housing in the same train risks intake.",
    },
    discussOptions: {
      summary: "You facilitated a phased release option set.",
      meetingOutcome:
        "Agreed to ship payment + identity first; housing as day-3 follow-on.",
    },
    makeDecision: {
      summary:
        "You staged housing behind payment readiness. Stakeholders realign.",
      meetingOutcome:
        "Decision: critical path only for intake day; housing delayed with honest comms.",
      messageSubject: "Phased intake accepted",
      messageBody:
        "Registrar accepts phased plan if parent email is rewritten today.",
      riskMitigatedTitle: "Housing included despite payment critical-path slip",
    },
  },
};

export const SCHOLARLINK_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "scholarlink_portal_v1",
  businessContext:
    "ScholarLink is redesigning a university research portal used by faculty and grant offices.",
  businessObjective:
    "Prioritise discovery evidence before committing redesign scope to a vendor.",
  timelineDays: 30,
  dependencies: ["Faculty interviews", "Grant office workflows", "Accessibility audit"],
  constraints: ["Vendor kickoff booked", "Legacy CMS contract ends soon"],
  successMetrics: [
    "Top 5 jobs-to-be-done validated with faculty",
    "Scope cut that protects grant submission path",
    "No redesign of low-use vanity pages in v1",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Prof. Irene Cho",
      role: "Faculty Senate Lead",
      kind: "stakeholder",
      responsibilities: ["Faculty trust", "Research visibility"],
      goals: ["Portal that finds grants and collaborators"],
      constraints: ["Faculty fatigue with redesigns"],
      knowledgeBoundaries: ["Not vendor contracting"],
      communicationStyle: "Sceptical, precise",
      decisionAuthority: "Faculty endorsement",
      relationships: [{ personaId: "p-james", relation: "tension" }],
      conflictTriggers: ["Cosmetic redesign without research"],
      escalationBehaviour: "Blocks senate endorsement",
      trust: 80,
    },
    {
      id: "p-maya",
      name: "Luis Ortega",
      role: "UX Research Lead",
      kind: "teammate",
      responsibilities: ["Discovery quality", "Interview synthesis"],
      goals: ["Evidence before IA rewrite"],
      constraints: ["Only 6 interviews done"],
      knowledgeBoundaries: ["No budget authority"],
      communicationStyle: "Curious, firm on methods",
      decisionAuthority: "Research readiness",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Skipping synthesis"],
      escalationBehaviour: "Publishes risk note",
      trust: 73,
    },
    {
      id: "p-james",
      name: "Kate Morrow",
      role: "Digital Transformation PM",
      kind: "stakeholder",
      responsibilities: ["Vendor start", "Budget burn"],
      goals: ["Kick off vendor on Monday"],
      constraints: ["Unused budget returns next month"],
      knowledgeBoundaries: ["Underestimates discovery lag"],
      communicationStyle: "Schedule-driven",
      decisionAuthority: "Vendor kickoff pressure",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Discovery delays"],
      escalationBehaviour: "Threatens to proceed without research",
      trust: 49,
    },
    {
      id: "p-priya",
      name: "Ben Okada",
      role: "Grant Office Manager",
      kind: "stakeholder",
      responsibilities: ["Submission deadlines", "Compliance forms"],
      goals: ["Never break grant submission"],
      constraints: ["Peak season in 3 weeks"],
      knowledgeBoundaries: ["Not design systems"],
      communicationStyle: "Operational, anxious about change",
      decisionAuthority: "Grant-path veto signal",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Broken submission forms"],
      escalationBehaviour: "Escalates to finance VP",
      trust: 83,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review discovery synthesis brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align vendor kickoff vs evidence gaps",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Portal discovery huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Kickoff readiness vs interview gaps",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Vendor team arrives Monday",
      body: "Can we brief them on full IA rewrite? Budget won't wait.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Do not touch grant forms yet",
      body: "Peak season. Any redesign of submission must be gated.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Discovery status one-pager",
      summary: "6 interviews; grant path is critical; vanity faculty pages low use.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Vendor kickoff without discovery synthesis",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    discovery: [
      "Protect synthesis quality before IA rewrite.",
      "Keep grant submission out of cosmetic scope.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 40,
    timelinePressure: 58,
    engineeringCapacity: 72,
    roadmapHealth: 65,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed discovery evidence. Research trust rose; Transformation feels delayed.",
      messageSubject: "Interview gap note",
      messageBody:
        "Grant path is validated; vanity pages are not. Full IA rewrite is premature.",
    },
    discussOptions: {
      summary: "You facilitated a scoped kickoff with discovery gates.",
      meetingOutcome:
        "Agreed to kick off vendor on grant-path IA only; rest after synthesis.",
    },
    makeDecision: {
      summary:
        "You scoped vendor kickoff to grant-critical IA. Stakeholders realign.",
      meetingOutcome:
        "Decision: phase 1 = grant submission path; vanity pages deferred.",
      messageSubject: "Scoped kickoff approved",
      messageBody:
        "Faculty senate endorses grant-first scope. Keep discovery running in parallel.",
      riskMitigatedTitle: "Vendor kickoff without discovery synthesis",
    },
  },
};

export const NOVADESK_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "novadesk_sla_v1",
  businessContext:
    "NovaDesk is a B2B helpdesk SaaS. An enterprise customer is demanding a custom SLA feature before renewal.",
  businessObjective:
    "Decide whether to commit a custom SLA without collapsing the roadmap.",
  timelineDays: 21,
  dependencies: ["Entitlements service", "Legal SLA language", "Support tooling"],
  constraints: ["Renewal in 18 days", "Platform team already at capacity"],
  successMetrics: [
    "Renewal protected or consciously traded",
    "No unscoped custom work entering sprint",
    "Support can operate the SLA without heroics",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Alex Rivera",
      role: "VP Customer Success",
      kind: "stakeholder",
      responsibilities: ["Renewals", "Enterprise health"],
      goals: ["Keep Contoso renewal"],
      constraints: ["Churn narrative with board"],
      knowledgeBoundaries: ["Not entitlement architecture"],
      communicationStyle: "Urgent, relationship-first",
      decisionAuthority: "Renewal concessions",
      relationships: [{ personaId: "p-james", relation: "allied" }],
      conflictTriggers: ["Saying no to enterprise"],
      escalationBehaviour: "Escalates to CEO",
      trust: 75,
    },
    {
      id: "p-maya",
      name: "Priya Nair",
      role: "Platform Eng Manager",
      kind: "teammate",
      responsibilities: ["Entitlements", "Reliability"],
      goals: ["Avoid one-off enterprise forks"],
      constraints: ["Team at 60%"],
      knowledgeBoundaries: ["No commercial pricing"],
      communicationStyle: "Systems thinker, firm",
      decisionAuthority: "Technical feasibility",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Custom forks"],
      escalationBehaviour: "Writes architecture objection",
      trust: 69,
    },
    {
      id: "p-james",
      name: "Dan Cole",
      role: "Enterprise AE",
      kind: "stakeholder",
      responsibilities: ["Close renewal", "Upsell"],
      goals: ["Promise custom SLA this quarter"],
      constraints: ["Comp plan"],
      knowledgeBoundaries: ["Underestimates platform cost"],
      communicationStyle: "Optimistic, pressure-heavy",
      decisionAuthority: "Commercial promise (contested)",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Roadmap pushback"],
      escalationBehaviour: "CCs VP CS",
      trust: 42,
    },
    {
      id: "p-priya",
      name: "Morgan Ellis",
      role: "Support Ops Lead",
      kind: "stakeholder",
      responsibilities: ["Ticket SLAs", "Agent tooling"],
      goals: ["Operable commitments"],
      constraints: ["Agents already overloaded"],
      knowledgeBoundaries: ["Not product pricing"],
      communicationStyle: "Operational, sceptical",
      decisionAuthority: "Ops feasibility signal",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Unmeasurable SLAs"],
      escalationBehaviour: "Declares support red",
      trust: 78,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review Contoso SLA ask brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align renewal ask vs platform capacity",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Enterprise SLA huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Custom SLA vs configurable entitlements",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Contoso needs a yes by Friday",
      body: "Can we commit custom SLA in writing? Renewal is on the line.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "We cannot staff a bespoke SLA",
      body: "If it isn't measurable in the agent console, don't promise it.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Contoso SLA ask one-pager",
      summary: "Wants 15-min response on P1. Platform has tiered entitlements half-built.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Custom SLA fork for one enterprise renewal",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    stakeholder: [
      "Translate platform risk into renewal language Alex can use.",
      "Separate Dan's urgency from a sustainable commitment.",
    ],
    delivery: [
      "Prefer configurable entitlements over a one-off fork.",
      "Make support operability a hard gate.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 48,
    timelinePressure: 72,
    engineeringCapacity: 60,
    revenueProtected: 480000,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed entitlements readiness. Platform trust rose; Sales feels delayed.",
      messageSubject: "Entitlements reality",
      messageBody:
        "Tiered SLA config is 60% done. A custom fork would cost a full quarter.",
    },
    discussOptions: {
      summary: "You facilitated configurable SLA vs custom fork options.",
      meetingOutcome:
        "Agreed to offer near-term operational workaround + dated entitlements delivery.",
    },
    makeDecision: {
      summary:
        "You refused a custom fork and offered a dated entitlements path. Stakeholders realign.",
      meetingOutcome:
        "Decision: no one-off; pilot operational workaround; ship entitlements in 3 sprints.",
      messageSubject: "Renewal path without a fork",
      messageBody:
        "VP CS can defend this if we put dates and support tooling in writing.",
      riskMitigatedTitle: "Custom SLA fork for one enterprise renewal",
    },
  },
};

export const PULSEBOARD_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "pulseboard_launch_v1",
  businessContext:
    "PulseBoard is a SaaS analytics product packing a launch for mid-market customers.",
  businessObjective:
    "Cut launch scope so the pack ships on the conference date without junk metrics.",
  timelineDays: 16,
  dependencies: ["Chart performance", "Export CSV", "Onboarding checklist"],
  constraints: ["Conference booth demo locked", "Two engineers out sick"],
  successMetrics: [
    "Demo-critical charts green",
    "No known P0 in launch pack",
    "Onboarding checklist completable in < 10 minutes",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Rita Solis",
      role: "CEO",
      kind: "stakeholder",
      responsibilities: ["Conference narrative", "Brand"],
      goals: ["Impressive live demo"],
      constraints: ["Keynote slot booked"],
      knowledgeBoundaries: ["Not query performance"],
      communicationStyle: "High energy, deadline-first",
      decisionAuthority: "Launch go/no-go",
      relationships: [{ personaId: "p-james", relation: "allied" }],
      conflictTriggers: ["Thin demo"],
      escalationBehaviour: "Cuts other roadmap live on stage planning",
      trust: 85,
    },
    {
      id: "p-maya",
      name: "Hank Zhou",
      role: "Data Platform Lead",
      kind: "teammate",
      responsibilities: ["Query latency", "Export reliability"],
      goals: ["No embarassing live timeouts"],
      constraints: ["P95 latency still 4.2s on big tenants"],
      knowledgeBoundaries: ["No marketing copy"],
      communicationStyle: "Numbers-first",
      decisionAuthority: "Performance readiness",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Shipping known timeouts"],
      escalationBehaviour: "Shows latency graphs in huddle",
      trust: 70,
    },
    {
      id: "p-james",
      name: "Sophie Tran",
      role: "Marketing Lead",
      kind: "stakeholder",
      responsibilities: ["Booth story", "Launch email"],
      goals: ["Keep 12 chart types in the pack"],
      constraints: ["One-pager already printed"],
      knowledgeBoundaries: ["Underestimates perf work"],
      communicationStyle: "Narrative-driven",
      decisionAuthority: "Launch messaging",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Scope cuts"],
      escalationBehaviour: "Forwards printed one-pager to CEO",
      trust: 54,
    },
    {
      id: "p-priya",
      name: "Ivy Chen",
      role: "Customer Onboarding",
      kind: "stakeholder",
      responsibilities: ["Time-to-value", "Checklist quality"],
      goals: ["Customers finish setup fast"],
      constraints: ["Support scripts unfinished"],
      knowledgeBoundaries: ["Not chart engineering"],
      communicationStyle: "Empathetic, practical",
      decisionAuthority: "Onboarding readiness signal",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Complex setup"],
      escalationBehaviour: "Flags launch as unsupportable",
      trust: 80,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review launch pack brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align chart count vs latency reality",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Launch pack huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Chart scope vs conference demo",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Printed one-pager lists 12 charts",
      body: "Please don't cut below 10 — booth visitors will notice.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Onboarding still 18 minutes",
      body: "If we add more charts without simplifying setup, TTV gets worse.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Launch pack one-pager",
      summary: "6 charts green; 6 flaky under big tenants; CSV export intermittent.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Conference demo includes known latency failures",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    delivery: [
      "Cut to demo-critical green charts before adding vanity visuals.",
      "Protect onboarding time-to-value as a launch gate.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 52,
    timelinePressure: 80,
    engineeringCapacity: 52,
    customerSatisfaction: 74,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed latency evidence. Platform trust rose; Marketing feels delayed.",
      messageSubject: "Latency reality check",
      messageBody:
        "Six charts are demo-safe. The rest time out on big tenants.",
    },
    discussOptions: {
      summary: "You facilitated a slim demo pack vs printed narrative.",
      meetingOutcome:
        "Agreed to demo six green charts and sticker-over the printed extras.",
    },
    makeDecision: {
      summary:
        "You locked a six-chart launch pack. Stakeholders realign.",
      meetingOutcome:
        "Decision: ship six green charts + CSV; defer flaky charts post-conference.",
      messageSubject: "Slim launch accepted",
      messageBody:
        "CEO accepts a sharp six-chart demo over a flaky twelve-chart story.",
      riskMitigatedTitle: "Conference demo includes known latency failures",
    },
  },
};

export const LATTICEOPS_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "latticeops_permissions_v1",
  businessContext:
    "LatticeOps is redesigning multi-tenant permissions for a B2B ops platform after a security review.",
  businessObjective:
    "Scope a permissions redesign that closes audit findings without freezing all feature work.",
  timelineDays: 25,
  dependencies: ["Threat model", "Migration of roles", "Admin UI"],
  constraints: ["Audit deadline in 30 days", "Two enterprise tenants on legacy roles"],
  successMetrics: [
    "Critical audit findings addressed or waived with evidence",
    "Legacy tenants have a migration path",
    "Feature freeze limited to security-critical surfaces",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Gina Holt",
      role: "CISO",
      kind: "stakeholder",
      responsibilities: ["Audit response", "Risk acceptance"],
      goals: ["Close critical findings"],
      constraints: ["External auditor on calendar"],
      knowledgeBoundaries: ["Not product roadmap trade-offs in detail"],
      communicationStyle: "Blunt, compliance-first",
      decisionAuthority: "Security go/no-go",
      relationships: [{ personaId: "p-maya", relation: "relies_on" }],
      conflictTriggers: ["Waving critical findings quietly"],
      escalationBehaviour: "Escalates to board risk committee",
      trust: 90,
    },
    {
      id: "p-maya",
      name: "Theo Banks",
      role: "Identity Eng Lead",
      kind: "teammate",
      responsibilities: ["RBAC model", "Migration tooling"],
      goals: ["Clean role model without big-bang cutover"],
      constraints: ["Legacy tenants brittle"],
      knowledgeBoundaries: ["No sales renewals"],
      communicationStyle: "Careful, diagrams-heavy",
      decisionAuthority: "Technical migration design",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Big-bang cutovers"],
      escalationBehaviour: "Blocks unsafe migrations",
      trust: 72,
    },
    {
      id: "p-james",
      name: "Vanessa Chu",
      role: "Head of Product",
      kind: "stakeholder",
      responsibilities: ["Feature velocity", "Roadmap optics"],
      goals: ["Avoid total feature freeze"],
      constraints: ["Customers waiting on workflow builder"],
      knowledgeBoundaries: ["Underestimates migration risk"],
      communicationStyle: "Outcome-oriented, impatient",
      decisionAuthority: "Roadmap freeze pressure",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Long freezes"],
      escalationBehaviour: "Reopens feature work unilaterally",
      trust: 58,
    },
    {
      id: "p-priya",
      name: "Carl Mendes",
      role: "Enterprise Customer Admin",
      kind: "stakeholder",
      responsibilities: ["Tenant admin UX", "Role mapping"],
      goals: ["Don't break existing admins"],
      constraints: ["200 custom roles"],
      knowledgeBoundaries: ["Not threat modeling"],
      communicationStyle: "Practical, change-averse",
      decisionAuthority: "Tenant migration willingness",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Forced role resets"],
      escalationBehaviour: "Threatens churn on security grounds ironically",
      trust: 74,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review audit findings brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align freeze scope vs migration plan",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Permissions redesign huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Critical findings vs feature freeze breadth",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Workflow builder cannot slip another quarter",
      body: "Can security work be parallelised instead of a freeze?",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Please don't wipe our custom roles",
      body: "We need a mapping tool before any cutover.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Audit findings one-pager",
      summary: "3 critical RBAC findings. Legacy tenants lack migration tooling.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Feature work continues on insecure permission surfaces",
      severity: "critical",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    discovery: [
      "Map which surfaces actually touch the critical findings.",
      "Design migration evidence before cutting features broadly.",
    ],
    delivery: [
      "Limit freeze to security-critical surfaces.",
      "Require role-mapping tooling before tenant cutover.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 66,
    timelinePressure: 68,
    engineeringCapacity: 57,
    roadmapHealth: 55,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed audit evidence. Identity trust rose; Product feels delayed.",
      messageSubject: "Critical surface map",
      messageBody:
        "Only admin + API auth surfaces are critical. Workflow builder can stay if isolated.",
    },
    discussOptions: {
      summary: "You facilitated a narrow freeze with migration gates.",
      meetingOutcome:
        "Agreed to freeze security surfaces only; workflow builder continues behind a flag.",
    },
    makeDecision: {
      summary:
        "You set a narrow freeze and migration-first plan. Stakeholders realign.",
      meetingOutcome:
        "Decision: close 3 critical findings; role-mapping tool before legacy cutover.",
      messageSubject: "Scoped security plan accepted",
      messageBody:
        "CISO accepts narrow freeze with dated evidence pack for the auditor.",
      riskMitigatedTitle: "Feature work continues on insecure permission surfaces",
    },
  },
};

export const ROADMAPHQ_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "roadmaphq_cut_v1",
  businessContext:
    "RoadmapHQ is an internal product-management scenario: board pressure to cut the Q3 roadmap.",
  businessObjective:
    "Lead a transparent roadmap cut that protects strategy without performative prioritisation.",
  timelineDays: 10,
  dependencies: ["Outcome metrics", "Engineering capacity model", "Board deck"],
  constraints: ["Board meeting Thursday", "Sales already sold two cut candidates"],
  successMetrics: [
    "Cut decisions tied to outcomes not politics",
    "Sold commitments consciously renegotiated",
    "Engineering capacity model visible in the deck",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Board Chair (proxy)",
      role: "Board Sponsor",
      kind: "stakeholder",
      responsibilities: ["Capital efficiency", "Narrative coherence"],
      goals: ["See a ruthless but credible cut"],
      constraints: ["Public growth story"],
      knowledgeBoundaries: ["Not feature detail"],
      communicationStyle: "Terse, outcome-obsessed",
      decisionAuthority: "Board narrative",
      relationships: [{ personaId: "p-james", relation: "pressure" }],
      conflictTriggers: ["Laundry-list roadmaps"],
      escalationBehaviour: "Demands another cut cycle",
      trust: 70,
    },
    {
      id: "p-maya",
      name: "Ravi Shah",
      role: "Eng Director",
      kind: "teammate",
      responsibilities: ["Capacity truth", "WIP limits"],
      goals: ["Stop overcommit"],
      constraints: ["Two squads already mid-epic"],
      knowledgeBoundaries: ["No board theatre"],
      communicationStyle: "Candid, capacity-first",
      decisionAuthority: "Capacity model",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Fake 120% plans"],
      escalationBehaviour: "Shows WIP burn in meeting",
      trust: 76,
    },
    {
      id: "p-james",
      name: "Helena Vogt",
      role: "VP Sales",
      kind: "stakeholder",
      responsibilities: ["Sold roadmap items", "Quota"],
      goals: ["Protect two customer-sold epics"],
      constraints: ["Customer letters already sent"],
      knowledgeBoundaries: ["Underestimates WIP"],
      communicationStyle: "Forceful, anecdote-heavy",
      decisionAuthority: "Commercial commitment pressure",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Cutting sold work"],
      escalationBehaviour: "Reads customer letter aloud",
      trust: 46,
    },
    {
      id: "p-priya",
      name: "Mina Park",
      role: "Strategy Ops",
      kind: "stakeholder",
      responsibilities: ["Outcome metrics", "Deck quality"],
      goals: ["Board sees trade-offs clearly"],
      constraints: ["Deck freeze Wednesday"],
      knowledgeBoundaries: ["Not sprint planning"],
      communicationStyle: "Structured, calm",
      decisionAuthority: "Deck framing",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Vague prioritisation language"],
      escalationBehaviour: "Rewrites deck overnight",
      trust: 84,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review Q3 cut brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align sold commitments vs capacity model",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Roadmap cut huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Which sold epics survive the cut",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Customer letter on Epic Orion",
      body: "We cannot cut Orion. I already confirmed Q3 to the customer.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Board wants outcome logic",
      body: "If we keep Orion, name what dies and why in outcome terms.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Q3 capacity one-pager",
      summary: "Plan is at 135% capacity. Two sold epics; three strategic bets.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Roadmap remains over capacity after 'cut'",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    stakeholder: [
      "Make capacity visible before debating anecdotes.",
      "Renegotiate sold work explicitly — don't hide cuts.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 55,
    timelinePressure: 75,
    engineeringCapacity: 48,
    roadmapHealth: 40,
    revenueProtected: 250000,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed capacity truth. Eng trust rose; Sales feels delayed.",
      messageSubject: "Capacity model",
      messageBody:
        "We are at 135%. Keeping Orion requires cutting two strategic bets — say so.",
    },
    discussOptions: {
      summary: "You facilitated an outcome-tied cut set.",
      meetingOutcome:
        "Agreed to keep Orion with a written customer renegotiation on scope; cut two bets.",
    },
    makeDecision: {
      summary:
        "You published an honest cut with renegotiated sold scope. Stakeholders realign.",
      meetingOutcome:
        "Decision: Orion reduced scope; two bets deferred; capacity ≤ 100%.",
      messageSubject: "Board-ready cut",
      messageBody:
        "Board sponsor accepts the cut if outcome logic and renegotiation notes are in the deck.",
      riskMitigatedTitle: "Roadmap remains over capacity after 'cut'",
    },
  },
};

export const SPRINTFORGE_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "sprintforge_recovery_v1",
  businessContext:
    "SprintForge is a project-management recovery scenario: a cross-team release train is red.",
  businessObjective:
    "Recover the release train with clear owners, WIP cuts, and stakeholder honesty.",
  timelineDays: 12,
  dependencies: ["Integration environment", "QA capacity", "Comms plan"],
  constraints: ["External launch date public", "Three teams thrashing"],
  successMetrics: [
    "Single critical path with named owners",
    "WIP cut visible in boards",
    "External date held or renegotiated with evidence",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Derek Lang",
      role: "Programme Sponsor",
      kind: "stakeholder",
      responsibilities: ["External date", "Cross-team funding"],
      goals: ["Stop the thrash"],
      constraints: ["Already slipped once"],
      knowledgeBoundaries: ["Not ticket detail"],
      communicationStyle: "Impatient, wants one plan",
      decisionAuthority: "Programme go/no-go",
      relationships: [{ personaId: "p-james", relation: "pressure" }],
      conflictTriggers: ["Multiple competing plans"],
      escalationBehaviour: "Installs a new lead mid-stream",
      trust: 60,
    },
    {
      id: "p-maya",
      name: "Aisha Rahman",
      role: "QA Lead",
      kind: "teammate",
      responsibilities: ["Release quality", "Environment stability"],
      goals: ["Stop untested merges"],
      constraints: ["Integration env flaky"],
      knowledgeBoundaries: ["No commercial dates"],
      communicationStyle: "Risk-register calm",
      decisionAuthority: "Quality gate",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Bypassing QA"],
      escalationBehaviour: "Blocks release",
      trust: 68,
    },
    {
      id: "p-james",
      name: "Pete Alvarez",
      role: "Team Lead — Alpha",
      kind: "stakeholder",
      responsibilities: ["Alpha delivery", "Local commitments"],
      goals: ["Keep Alpha features in train"],
      constraints: ["Team morale low"],
      knowledgeBoundaries: ["Ignores other teams' WIP"],
      communicationStyle: "Defensive, local-optimising",
      decisionAuthority: "Alpha scope pressure",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Cutting Alpha"],
      escalationBehaviour: "Appeals to sponsor with demos",
      trust: 50,
    },
    {
      id: "p-priya",
      name: "Sue Brennan",
      role: "Comms Lead",
      kind: "stakeholder",
      responsibilities: ["External messaging", "Status truth"],
      goals: ["One honest status"],
      constraints: ["Blog post already drafted"],
      knowledgeBoundaries: ["Not engineering estimates"],
      communicationStyle: "Clarity-seeking",
      decisionAuthority: "External status language",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Contradictory updates"],
      escalationBehaviour: "Holds the blog post",
      trust: 81,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review release-train status brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align WIP cuts across teams",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Release train recovery huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Critical path + WIP cuts",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Alpha needs its features",
      body: "If we cut Alpha again, my team checks out.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "I need one status by noon",
      body: "Blog draft still says green. Tell me if we're amber.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Release train one-pager",
      summary: "3 critical path items red; 14 in-flight stories across teams.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Public launch date with no single critical path",
      severity: "critical",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    delivery: [
      "Create one critical path with owners before debating features.",
      "Cut WIP visibly — don't just rename statuses.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 70,
    timelinePressure: 85,
    engineeringCapacity: 50,
    teamMorale: 55,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You mapped the critical path. QA trust rose; Alpha feels threatened.",
      messageSubject: "Critical path map",
      messageBody:
        "Only three items are launch-critical. Fourteen in-flight stories are thrash.",
    },
    discussOptions: {
      summary: "You facilitated WIP cuts with named owners.",
      meetingOutcome:
        "Agreed to freeze non-critical work and publish an amber external status.",
    },
    makeDecision: {
      summary:
        "You locked a recovery plan with WIP cuts and honest comms. Stakeholders realign.",
      meetingOutcome:
        "Decision: three critical items only; Alpha non-critical deferred; amber status published.",
      messageSubject: "Recovery plan accepted",
      messageBody:
        "Sponsor accepts amber + cuts if owners and dates are on one page.",
      riskMitigatedTitle: "Public launch date with no single critical path",
    },
  },
};

export const BRIEFCASE_RUNTIME: ScenarioRuntimePack = {
  experienceKey: "briefcase_pricing_v1",
  businessContext:
    "Briefcase is deciding packaging and pricing for a product-led growth motion.",
  businessObjective:
    "Choose a packaging cut that sales can sell and product can support without discount chaos.",
  timelineDays: 14,
  dependencies: ["Willingness-to-pay interviews", "Entitlement matrix", "Sales enablement"],
  constraints: ["Price list ships next week", "Legacy discounts still active"],
  successMetrics: [
    "Three clear packages max",
    "Discount policy documented",
    "Entitlements match packaging story",
  ],
  personas: [
    {
      id: "p-sarah",
      name: "Olivia Grant",
      role: "CFO",
      kind: "stakeholder",
      responsibilities: ["Margin", "Discount leakage"],
      goals: ["Stop unstructured discounting"],
      constraints: ["Board margin target"],
      knowledgeBoundaries: ["Not feature packaging nuance"],
      communicationStyle: "Numeric, sceptical",
      decisionAuthority: "Price approval",
      relationships: [{ personaId: "p-james", relation: "tension" }],
      conflictTriggers: ["Open-ended discounts"],
      escalationBehaviour: "Freezes price list",
      trust: 78,
    },
    {
      id: "p-maya",
      name: "Jules Okonkwo",
      role: "Product Ops Lead",
      kind: "teammate",
      responsibilities: ["Entitlement matrix", "Packaging coherence"],
      goals: ["Packages match what we can turn on"],
      constraints: ["Entitlements half-migrated"],
      knowledgeBoundaries: ["No CFO politics"],
      communicationStyle: "Systems, precise",
      decisionAuthority: "Entitlement feasibility",
      relationships: [{ personaId: "p-user", relation: "partner" }],
      conflictTriggers: ["Packages that can't be provisioned"],
      escalationBehaviour: "Shows entitlement gaps",
      trust: 74,
    },
    {
      id: "p-james",
      name: "Craig Mills",
      role: "VP Sales",
      kind: "stakeholder",
      responsibilities: ["Deal velocity", "Discount flexibility"],
      goals: ["Keep negotiation room"],
      constraints: ["Reps already pitching five SKUs"],
      knowledgeBoundaries: ["Underestimates ops cost of SKUs"],
      communicationStyle: "Deal-driven",
      decisionAuthority: "Sales packaging pressure",
      relationships: [{ personaId: "p-maya", relation: "conflict" }],
      conflictTriggers: ["Rigid packaging"],
      escalationBehaviour: "Threatens missed quarter",
      trust: 48,
    },
    {
      id: "p-priya",
      name: "Dana West",
      role: "Customer Research",
      kind: "stakeholder",
      responsibilities: ["WTP evidence", "Segment clarity"],
      goals: ["Packages map to jobs"],
      constraints: ["Only 9 interviews"],
      knowledgeBoundaries: ["Not pricing maths"],
      communicationStyle: "Evidence-led",
      decisionAuthority: "Research confidence signal",
      relationships: [{ personaId: "p-sarah", relation: "informs" }],
      conflictTriggers: ["Ignoring interview themes"],
      escalationBehaviour: "Publishes dissent note",
      trust: 82,
    },
    coach(),
  ],
  tasks: [
    { id: "t-brief", title: "Review packaging evidence brief", status: "todo", dueDay: 1 },
    {
      id: "t-align",
      title: "Align SKU count vs entitlement reality",
      status: "todo",
      ownerPersonaId: "p-maya",
      dueDay: 2,
    },
  ],
  meetings: [
    {
      id: "m-standup",
      title: "Packaging decision huddle",
      day: 1,
      status: "scheduled",
      attendeeIds: ["p-maya", "p-james", "p-user"],
      agenda: "Three packages vs five SKUs",
    },
  ],
  messages: [
    {
      id: "msg-james",
      fromPersonaId: "p-james",
      subject: "Reps need the five-SKU grid",
      body: "Collapsing to three will kill mid-market deals.",
      day: 1,
      read: false,
    },
    {
      id: "msg-priya",
      fromPersonaId: "p-priya",
      subject: "Interviews cluster into three jobs",
      body: "Five SKUs confuse buyers. Evidence supports three packages.",
      day: 1,
      read: false,
    },
  ],
  documents: [
    {
      id: "d-brief",
      title: "Packaging evidence one-pager",
      summary: "Three job clusters; entitlements support three; discount leakage high.",
      createdDay: 1,
    },
  ],
  risks: [
    {
      id: "r-overpromise",
      title: "Five SKUs without entitlement or discount control",
      severity: "high",
      status: "open",
    },
  ],
  coachingByEmphasis: defaultCoaching({
    discovery: [
      "Anchor packages in interview jobs, not sales anecdotes.",
      "Make entitlement feasibility a packaging gate.",
    ],
    stakeholder: [
      "Give Sales a clear discount policy instead of endless SKUs.",
      "Help CFO see margin protection in the three-pack model.",
    ],
  }),
  metrics: baseMetrics({
    projectRisk: 43,
    timelinePressure: 66,
    engineeringCapacity: 63,
    revenueProtected: 310000,
    roadmapHealth: 68,
  }),
  consequenceCopy: {
    reviewContext: {
      summary:
        "You reviewed packaging evidence. Product Ops trust rose; Sales feels delayed.",
      messageSubject: "Entitlement + interview reality",
      messageBody:
        "We can provision three packages cleanly. Five SKUs would invent shadow discounts.",
    },
    discussOptions: {
      summary: "You facilitated three-pack vs five-SKU options with a discount policy.",
      meetingOutcome:
        "Agreed to three packages plus a documented discount ladder for Sales.",
    },
    makeDecision: {
      summary:
        "You locked three packages and a discount policy. Stakeholders realign.",
      meetingOutcome:
        "Decision: three packages; discount ladder; entitlement matrix as source of truth.",
      messageSubject: "Packaging decision accepted",
      messageBody:
        "CFO approves if discount leakage rules are in the price list footnote.",
      riskMitigatedTitle: "Five SKUs without entitlement or discount control",
    },
  },
};
