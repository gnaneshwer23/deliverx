import { describe, expect, it } from "vitest";
import {
  buildCollaborativeLoopSnapshot,
  buildStakeholderPulse,
  buildTeamNeeds,
  runCollaborativeLoopEngineSmokeTest,
} from "@/services/collaborativeLoopEngine";

const baseInput = {
  persona: "ba" as const,
  governance: {
    openRisks: 1,
    openIssues: 2,
    pendingDecisions: 1,
    openChanges: 0,
  },
  blockedTasks: 2,
  openClarifications: 3,
  pendingProposals: 2,
  criticalDefects: 1,
  clarifications: [
    { id: "c1", question: "Define acceptance criteria for login", stakeholderRole: "Sponsor" },
  ],
  pendingDecisions: [{ id: "d1", title: "Approve scope change", projectId: "proj-1" }],
  criticalRisks: [{ id: "r1", title: "Third-party API outage" }],
  requirementsApproved: 8,
  requirementsTotal: 12,
  storiesReady: 5,
};

describe("collaborativeLoopEngine", () => {
  it("builds stakeholder loop rows for each persona", () => {
    const personas = ["founder", "product", "pm", "ba", "engineer", "qa", "scrum"] as const;
    for (const persona of personas) {
      const snapshot = buildCollaborativeLoopSnapshot({ ...baseInput, persona });
      expect(snapshot.stakeholderLoop.length).toBeGreaterThanOrEqual(4);
      expect(snapshot.stakeholderLoop[0].youNeed).toBeTruthy();
      expect(snapshot.stakeholderLoop[0].theyNeed).toBeTruthy();
    }
  });

  it("categorises team needs by kind", () => {
    const needs = buildTeamNeeds(baseInput);
    expect(needs.some((n) => n.kind === "clarification")).toBe(true);
    expect(needs.some((n) => n.kind === "decision")).toBe(true);
    expect(needs.some((n) => n.kind === "blocker")).toBe(true);
    expect(needs.some((n) => n.kind === "defect")).toBe(true);
  });

  it("includes governance and delivery signals in pulse", () => {
    const pulse = buildStakeholderPulse(baseInput);
    expect(pulse.find((p) => p.label === "Open risks")?.value).toBe(1);
    expect(pulse.find((p) => p.label === "Blocked tasks")?.value).toBe(2);
    expect(pulse.find((p) => p.label === "Clarifications")?.value).toBe(3);
  });

  it("passes engine smoke test", () => {
    const result = runCollaborativeLoopEngineSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.personaCount).toBe(7);
  });
});
