import { describe, expect, it } from "vitest";
import {
  canTransitionIntervention,
  decideInterventionTransition,
  INTERVENTION_TRANSITIONS,
} from "@/lib/workspace-observation/intervention-state-machine";

describe("B9 intervention state machine", () => {
  it("allows offered → accepted | dismissed | expired", () => {
    expect(INTERVENTION_TRANSITIONS.offered).toEqual([
      "accepted",
      "dismissed",
      "expired",
    ]);
    expect(canTransitionIntervention("offered", "accepted")).toBe(true);
    expect(canTransitionIntervention("offered", "completed")).toBe(false);
  });

  it("allows accepted → completed | dismissed and treats terminals as closed", () => {
    expect(canTransitionIntervention("accepted", "completed")).toBe(true);
    expect(canTransitionIntervention("accepted", "dismissed")).toBe(true);
    expect(canTransitionIntervention("completed", "accepted")).toBe(false);
    expect(canTransitionIntervention("dismissed", "offered")).toBe(false);
    expect(canTransitionIntervention("expired", "accepted")).toBe(false);
  });

  it("treats same-state as idempotent noop", () => {
    expect(decideInterventionTransition("offered", "offered")).toEqual({
      kind: "noop",
      status: "offered",
    });
    expect(decideInterventionTransition("completed", "completed").kind).toBe("noop");
  });

  it("returns invalid with reason for illegal jumps (no silent success)", () => {
    const decision = decideInterventionTransition("dismissed", "accepted");
    expect(decision.kind).toBe("invalid");
    if (decision.kind === "invalid") {
      expect(decision.reason).toMatch(/Cannot move/);
    }
  });

  it("never implies capability — transitions are status-only", () => {
    const apply = decideInterventionTransition("offered", "accepted");
    expect(apply).toEqual({ kind: "apply", from: "offered", to: "accepted" });
    // Machine has no capability / Verified fields by design
    expect(Object.keys(INTERVENTION_TRANSITIONS)).toEqual([
      "offered",
      "accepted",
      "dismissed",
      "completed",
      "expired",
    ]);
  });
});
