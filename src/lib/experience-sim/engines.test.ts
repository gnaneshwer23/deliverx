import { describe, expect, it } from "vitest";
import {
  applyDecisionConsequences,
  captureReflection,
  evaluateCompletion,
  failExperience,
  recoverExperience,
} from "@/lib/experience-sim/engines";
import { generateMediFlowExperience } from "@/lib/experience-sim/mediflow";

describe("experience-sim MediFlow E2E loop", () => {
  it("seeds persistent company/project/team state", () => {
    const state = generateMediFlowExperience({ userRole: "APM" });
    expect(state.schemaVersion).toBe(2);
    expect(state.company.name).toBe("MediFlow");
    expect(state.project.name).toContain("TrustCare");
    expect(state.team.length).toBeGreaterThan(0);
    expect(state.stakeholders.length).toBeGreaterThan(0);
    expect(state.availableDecisions.map((d) => d.id)).toEqual([
      "review_context",
      "discuss_options",
      "make_decision",
    ]);
  });

  it("applies make_decision consequences to trust, risk, timeline, tasks, meetings", () => {
    const start = generateMediFlowExperience({});
    const beforeRisk = start.metrics.projectRisk;
    const beforeJames = start.metrics.stakeholderTrust["p-james"];

    const { state, effects, events } = applyDecisionConsequences(start, {
      choiceId: "make_decision",
      label: "Make decision",
      rationale: "Scoped Friday pilot",
      decisionRowId: "dec-1",
    });

    expect(state.metrics.projectRisk).toBeLessThan(beforeRisk);
    expect(state.metrics.stakeholderTrust["p-james"]).toBeGreaterThan(beforeJames!);
    expect(state.metrics.timelinePressure).toBeLessThan(start.metrics.timelinePressure);
    expect(state.tasks.find((t) => t.id === "t-align")?.status).toBe("done");
    expect(state.meetings.find((m) => m.id === "m-standup")?.status).toBe("completed");
    expect(state.risks.find((r) => r.id === "r-overpromise")?.status).toBe("mitigated");
    expect(state.consequences).toHaveLength(1);
    expect(state.availableDecisions).toHaveLength(0);
    expect(state.lifecycle).toBe("reflecting");
    expect(state.completion.decisionMade).toBe(true);
    expect(state.completion.consequenceApplied).toBe(true);
    expect(state.completion.meetingRecorded).toBe(true);
    expect(effects.projectRisk).toBeLessThan(0);
    expect(events.some((e) => e.type === "ConsequenceApplied")).toBe(true);
    expect(state.coachingHints[0]).toContain("Capability");
  });

  it("review_context path can still complete via reflection criteria", () => {
    const start = generateMediFlowExperience({});
    let { state } = applyDecisionConsequences(start, {
      choiceId: "review_context",
      label: "Review context",
      decisionRowId: "dec-2",
    });
    expect(state.completion.meetingRecorded).toBe(true);
    expect(state.lifecycle).toBe("reflecting");
    expect(state.messages[0]?.fromPersonaId).toBe("p-maya");

    state = {
      ...state,
      completion: { ...state.completion, observationEmitted: true },
    };
    state = captureReflection(
      state,
      "I slowed down to gather capacity facts before answering Sales.",
    );
    const { complete, missing } = evaluateCompletion(state);
    expect(missing).toEqual([]);
    expect(complete).toBe(true);
  });

  it("failure and recovery preserve decisions and restore lifecycle", () => {
    let state = generateMediFlowExperience({});
    ({ state } = applyDecisionConsequences(state, {
      choiceId: "discuss_options",
      label: "Discuss options",
      decisionRowId: "dec-3",
    }));
    state = failExperience(state, "Session timeout");
    expect(state.lifecycle).toBe("failed");
    expect(state.decisions).toHaveLength(1);
    state = recoverExperience(state);
    expect(state.lifecycle).toBe("reflecting");
  });

  it("does not expose a capability assignment API on engines", async () => {
    const engines = await import("@/lib/experience-sim/engines");
    expect(Object.keys(engines).some((k) => /capability|score/i.test(k))).toBe(
      false,
    );
  });
});
