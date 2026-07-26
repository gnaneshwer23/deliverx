import { describe, expect, it } from "vitest";
import type { ExperienceSimState } from "@/lib/experience-sim/types";
import { EXPERIENCE_STATE_VERSION } from "@/lib/experience-sim/types";
import {
  CEREMONY_HONESTY_NOTE,
  CEREMONY_STEP_IDS,
  CEREMONY_STEPS,
  ceremonyProgress,
  ceremonyStepAt,
  ceremonyStepIndex,
  completeCeremony,
  createCeremonyState,
  deriveCeremonyContent,
  goToCeremonyStep,
  isCeremonyFinished,
  isCeremonyStepId,
  isFirstCeremonyStep,
  isLastCeremonyStep,
  isXpEntryCeremonyEnabled,
  nextCeremonyStep,
  previousCeremonyStep,
  skipCeremony,
} from "@/lib/xperience/entry-ceremony";

function sampleState(overrides: Partial<ExperienceSimState> = {}): ExperienceSimState {
  return {
    schemaVersion: EXPERIENCE_STATE_VERSION,
    lifecycle: "active",
    company: {
      id: "co-mediflow",
      name: "MediFlow",
      industry: "healthcare",
      businessContext: "A healthcare scaleup under delivery pressure.",
      businessObjective: "Protect revenue while keeping customers safe.",
    },
    project: {
      id: "proj-trustcare",
      name: "TrustCare reporting",
      successMetrics: ["Ship a trusted report", "Protect revenue"],
      constraints: ["Two-week deadline", "Fixed engineering capacity"],
      timelineDays: 14,
      dependencies: ["Engineering", "Sales"],
    },
    userRole: "Associate Product Manager",
    day: 1,
    metrics: {
      stakeholderTrust: {},
      projectRisk: 0,
      timelinePressure: 0,
      budgetHealth: 0,
      scopeCreep: 0,
      teamMorale: 0,
      businessOutcome: 0,
      revenueProtected: 0,
      customerSatisfaction: 0,
      engineeringCapacity: 0,
      roadmapHealth: 0,
    },
    team: [
      {
        id: "p-maya",
        name: "Maya Patel",
        role: "Engineering Lead",
        kind: "teammate",
        responsibilities: [],
        goals: [],
        constraints: [],
        knowledgeBoundaries: [],
        communicationStyle: "Precise and cautious",
        decisionAuthority: "",
        relationships: [],
        memory: [],
        conflictTriggers: [],
        escalationBehaviour: "",
      },
    ],
    stakeholders: [
      {
        id: "p-james",
        name: "James Wilson",
        role: "Head of Sales",
        kind: "stakeholder",
        responsibilities: [],
        goals: [],
        constraints: [],
        knowledgeBoundaries: [],
        communicationStyle: "Urgent and commercial",
        decisionAuthority: "",
        relationships: [],
        memory: [],
        conflictTriggers: [],
        escalationBehaviour: "",
      },
    ],
    tasks: [],
    meetings: [],
    messages: [],
    documents: [],
    risks: [],
    decisions: [],
    consequences: [],
    reflections: [],
    coachingHints: [],
    availableDecisions: [
      {
        id: "review_context",
        label: "Review context",
        description: "Gather the facts before responding to pressure.",
        impactHints: { trust: 4, delivery: 2, clarity: 6 },
      },
    ],
    completion: {
      decisionMade: false,
      consequenceApplied: false,
      meetingRecorded: false,
      reflectionCaptured: false,
      observationEmitted: false,
    },
    scenarioMeta: {
      slug: "mediflow-trustcare",
      companyKey: "mediflow",
      problem: "Sales promised a feature engineering says will slip two weeks.",
    },
    ...overrides,
  };
}

describe("ceremony step order", () => {
  it("has the five pack-specified steps in order", () => {
    expect(CEREMONY_STEP_IDS).toEqual([
      "company",
      "role",
      "team",
      "project",
      "first_activity",
    ]);
    expect(CEREMONY_STEPS.map((s) => s.id)).toEqual([...CEREMONY_STEP_IDS]);
  });

  it("maps ids and indices", () => {
    expect(ceremonyStepAt(0)).toBe("company");
    expect(ceremonyStepAt(4)).toBe("first_activity");
    expect(ceremonyStepAt(99)).toBe("first_activity");
    expect(ceremonyStepAt(-3)).toBe("company");
    expect(ceremonyStepIndex("project")).toBe(3);
    expect(isCeremonyStepId("team")).toBe(true);
    expect(isCeremonyStepId("nope")).toBe(false);
  });
});

describe("ceremony state transitions", () => {
  it("starts at the first step in progress", () => {
    const state = createCeremonyState();
    expect(state.index).toBe(0);
    expect(state.status).toBe("in_progress");
    expect(state.visited).toEqual(["company"]);
    expect(isFirstCeremonyStep(state)).toBe(true);
    expect(isLastCeremonyStep(state)).toBe(false);
  });

  it("advances forward and records visited steps", () => {
    let state = createCeremonyState();
    state = nextCeremonyStep(state);
    expect(ceremonyStepAt(state.index)).toBe("role");
    state = nextCeremonyStep(state);
    state = nextCeremonyStep(state);
    expect(ceremonyStepAt(state.index)).toBe("project");
    expect(state.visited).toEqual(["company", "role", "team", "project"]);
  });

  it("completes on advancing past the last step", () => {
    let state = createCeremonyState();
    for (let i = 0; i < CEREMONY_STEPS.length - 1; i += 1) {
      state = nextCeremonyStep(state);
    }
    expect(isLastCeremonyStep(state)).toBe(true);
    state = nextCeremonyStep(state);
    expect(state.status).toBe("completed");
    expect(isCeremonyFinished(state)).toBe(true);
  });

  it("retreats but floors at the first step", () => {
    let state = createCeremonyState();
    state = nextCeremonyStep(state);
    state = previousCeremonyStep(state);
    expect(state.index).toBe(0);
    state = previousCeremonyStep(state);
    expect(state.index).toBe(0);
  });

  it("jumps directly to a step", () => {
    let state = createCeremonyState();
    state = goToCeremonyStep(state, "first_activity");
    expect(ceremonyStepAt(state.index)).toBe("first_activity");
    expect(state.visited).toContain("first_activity");
  });

  it("skips to finished", () => {
    const state = skipCeremony(createCeremonyState());
    expect(state.status).toBe("skipped");
    expect(isCeremonyFinished(state)).toBe(true);
  });

  it("does not mutate a finished ceremony", () => {
    const done = completeCeremony(createCeremonyState());
    expect(nextCeremonyStep(done)).toBe(done);
    expect(previousCeremonyStep(done)).toBe(done);
    expect(skipCeremony(done)).toBe(done);
    expect(goToCeremonyStep(done, "team")).toBe(done);
  });

  it("reports 1-indexed progress", () => {
    let state = createCeremonyState();
    expect(ceremonyProgress(state)).toEqual({ current: 1, total: 5 });
    state = nextCeremonyStep(state);
    expect(ceremonyProgress(state)).toEqual({ current: 2, total: 5 });
  });
});

describe("ceremony content derivation", () => {
  it("derives from generated sim state without inventing scores", () => {
    const content = deriveCeremonyContent(sampleState());
    expect(content.isFallback).toBe(false);
    expect(content.company.name).toBe("MediFlow");
    expect(content.role.title).toBe("Associate Product Manager");
    expect(content.team.teammates).toHaveLength(1);
    expect(content.team.stakeholders[0].name).toBe("James Wilson");
    expect(content.project.name).toBe("TrustCare reporting");
    expect(content.project.timelineDays).toBe(14);
    expect(content.firstActivity.title).toBe("Review context");
    expect(content.firstActivity.problem).toContain("Sales promised");
    expect(content.honesty).toBe(CEREMONY_HONESTY_NOTE);
    // Ceremony content carries no metrics / numeric readiness fields — it is
    // narrative only and must never surface the sim's internal score numbers.
    expect(content).not.toHaveProperty("metrics");
    expect(JSON.stringify(content)).not.toMatch(/%|percent|readiness/i);
  });

  it("falls back safely when state is missing", () => {
    const content = deriveCeremonyContent(null);
    expect(content.isFallback).toBe(true);
    expect(content.company.name).toBe("your company");
    expect(content.firstActivity.title).toBe("Open your workspace");
    expect(content.honesty).toBe(CEREMONY_HONESTY_NOTE);
  });

  it("falls back when core entities are absent", () => {
    const content = deriveCeremonyContent({ schemaVersion: 2 } as unknown as ExperienceSimState);
    expect(content.isFallback).toBe(true);
  });

  it("prefers a scheduled meeting when no decisions exist", () => {
    const content = deriveCeremonyContent(
      sampleState({
        availableDecisions: [],
        meetings: [
          {
            id: "m1",
            title: "Roadmap review",
            day: 1,
            status: "scheduled",
            attendeeIds: [],
            agenda: "Align on the two-week commitment.",
          },
        ],
      }),
    );
    expect(content.firstActivity.title).toBe("Roadmap review");
    expect(content.firstActivity.description).toContain("two-week commitment");
  });
});

describe("ceremony rollout flag (kill-switch, default on)", () => {
  it("defaults on when unset", () => {
    expect(isXpEntryCeremonyEnabled({})).toBe(true);
  });

  it("stays on for explicit on values", () => {
    expect(isXpEntryCeremonyEnabled({ DELIVERX_XP_ENTRY_CEREMONY: "on" })).toBe(true);
    expect(isXpEntryCeremonyEnabled({ DELIVERX_XP_ENTRY_CEREMONY: "true" })).toBe(true);
  });

  it("rolls back with off values", () => {
    for (const value of ["off", "0", "false", "disabled", "OFF", " Off "]) {
      expect(isXpEntryCeremonyEnabled({ DELIVERX_XP_ENTRY_CEREMONY: value })).toBe(false);
    }
  });
});
