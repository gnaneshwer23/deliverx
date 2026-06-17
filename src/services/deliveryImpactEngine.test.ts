import { describe, expect, it } from "vitest";
import {
  mergeImpactIntoCrossRole,
  proposalApplyToImpactEvents,
} from "@/services/deliveryImpactEngine";

describe("deliveryImpactEngine", () => {
  it("maps create_task to engineer, pm, scrum, and qa roles", () => {
    const events = proposalApplyToImpactEvents({
      actionType: "create_task",
      title: "Fix login bug",
      source: "meeting",
      applyResult: { entityType: "task", entityId: "t1" },
    });

    expect(events).toHaveLength(4);
    expect(events.map((e) => e.targetRole).sort()).toEqual(
      ["engineer", "pm", "qa", "scrum"].sort(),
    );
  });

  it("maps calendar_event to pm and scrum", () => {
    const events = proposalApplyToImpactEvents({
      actionType: "calendar_event",
      title: "Security review",
      source: "meeting",
      applyResult: { entityType: "calendar_event" },
    });

    expect(events).toHaveLength(2);
    expect(events.every((e) => e.message.includes("Security review"))).toBe(true);
  });

  it("merges impact events into cross-role panel rows", () => {
    const base = [
      { role: "Delivery PM", message: "Waiting", tone: "waiting" },
      { role: "Engineers", message: "Waiting", tone: "waiting" },
    ];
    const events = proposalApplyToImpactEvents({
      actionType: "create_task",
      title: "Deploy hotfix",
      source: "meeting",
      applyResult: { entityType: "task" },
    });

    const merged = mergeImpactIntoCrossRole(base, events);
    const pm = merged.find((r) => r.role === "Delivery PM");
    const eng = merged.find((r) => r.role === "Engineers");

    expect(pm?.message).toContain("Deploy hotfix");
    expect(eng?.message).toContain("Deploy hotfix");
    expect(pm?.tone).toBe("updated");
  });
});
