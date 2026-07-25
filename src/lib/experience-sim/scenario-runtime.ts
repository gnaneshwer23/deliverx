/**
 * Shared scenario runtime — parameterised Day-1 Experience loops.
 * Uses catalogue runtime packs; structural IDs stay compatible with consequence engines.
 */

import type { ExperienceScenarioDef } from "@/lib/experience-planner/types";
import type { ExperienceSimState, PersonaContract } from "@/lib/experience-sim/types";
import { EXPERIENCE_STATE_VERSION } from "@/lib/experience-sim/types";

function toPersona(
  seed: ExperienceScenarioDef["runtime"]["personas"][number],
): PersonaContract {
  return {
    id: seed.id,
    name: seed.name,
    role: seed.role,
    kind: seed.kind,
    responsibilities: seed.responsibilities,
    goals: seed.goals,
    constraints: seed.constraints,
    knowledgeBoundaries: seed.knowledgeBoundaries,
    communicationStyle: seed.communicationStyle,
    decisionAuthority: seed.decisionAuthority,
    relationships: seed.relationships,
    conflictTriggers: seed.conflictTriggers,
    escalationBehaviour: seed.escalationBehaviour,
    trust: seed.trust,
    memory: [],
  };
}

const DECISIONS_BASE = [
  {
    id: "review_context",
    label: "Review context",
    description: "Gather facts from delivery and the brief before responding to pressure.",
    impactHints: { trust: 4, delivery: 2, clarity: 6 },
  },
  {
    id: "discuss_options",
    label: "Discuss options",
    description: "Facilitate a trade-off conversation between competing stakeholders.",
    impactHints: { trust: 6, delivery: 3, clarity: 5 },
  },
  {
    id: "make_decision",
    label: "Make decision",
    description: "Commit or renegotiate with a clear rationale.",
    impactHints: { trust: 8, delivery: 5, clarity: 4 },
  },
];

const ORDER_BY_EMPHASIS: Record<string, string[]> = {
  stakeholder: ["discuss_options", "make_decision", "review_context"],
  delivery: ["review_context", "make_decision", "discuss_options"],
  discovery: ["review_context", "discuss_options", "make_decision"],
  balanced: ["review_context", "discuss_options", "make_decision"],
};

export function generateFromScenarioDef(
  scenario: ExperienceScenarioDef,
  input: {
    userRole?: string;
    plannerEmphasis?: "stakeholder" | "delivery" | "discovery" | "balanced";
    planId?: string | null;
    planRationale?: string | null;
    personalisedBy?: Record<string, unknown>;
  },
): ExperienceSimState {
  const emphasis =
    input.plannerEmphasis ??
    (typeof input.personalisedBy?.plannerEmphasis === "string"
      ? (input.personalisedBy.plannerEmphasis as
          | "stakeholder"
          | "delivery"
          | "discovery"
          | "balanced")
      : scenario.emphasis);

  const pack = scenario.runtime;
  const order = ORDER_BY_EMPHASIS[emphasis] ?? ORDER_BY_EMPHASIS.balanced;
  const availableDecisions = order
    .map((id) => DECISIONS_BASE.find((d) => d.id === id)!)
    .filter(Boolean);

  const personas = pack.personas.map(toPersona);
  const team = personas.filter((p) => p.kind === "teammate");
  const stakeholders = personas.filter((p) => p.kind === "stakeholder");

  const trustMap: Record<string, number> = {};
  for (const p of personas) {
    if (typeof p.trust === "number") trustMap[p.id] = p.trust;
  }

  return {
    schemaVersion: EXPERIENCE_STATE_VERSION,
    lifecycle: "active",
    company: {
      id: `co-${scenario.companyKey}`,
      name: scenario.companyName,
      industry: scenario.industry.replace(/_/g, " "),
      businessContext: pack.businessContext,
      businessObjective: pack.businessObjective,
    },
    project: {
      id: `proj-${scenario.projectKey}`,
      name: scenario.projectName,
      successMetrics: pack.successMetrics,
      constraints: pack.constraints,
      timelineDays: pack.timelineDays,
      dependencies: pack.dependencies,
    },
    userRole: input.userRole || scenario.candidateRole,
    day: 1,
    metrics: {
      stakeholderTrust: trustMap,
      ...pack.metrics,
    },
    team,
    stakeholders,
    tasks: pack.tasks.map((t) => ({ ...t })),
    meetings: pack.meetings.map((m) => ({ ...m })),
    messages: pack.messages.map((m) => ({ ...m })),
    documents: pack.documents.map((d) => ({ ...d })),
    risks: pack.risks.map((r) => ({ ...r })),
    decisions: [],
    consequences: [],
    reflections: [],
    coachingHints: pack.coachingByEmphasis[emphasis] ?? pack.coachingByEmphasis.balanced,
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
      experienceKey: pack.experienceKey,
    },
    scenarioMeta: {
      slug: scenario.slug,
      companyKey: scenario.companyKey,
      problem: scenario.problem,
      consequenceCopy: pack.consequenceCopy,
    },
  };
}
