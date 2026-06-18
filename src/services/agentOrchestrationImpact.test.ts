import { describe, expect, it } from "vitest";
import {
  orchestrationEventsToImpactDrafts,
  runAgentOrchestrationImpactSmokeTest,
} from "@/services/agentOrchestrationImpact";

describe("agentOrchestrationImpact", () => {
  it("maps cross-role blocker insights to impact drafts", () => {
    const drafts = orchestrationEventsToImpactDrafts([
      {
        agentRole: "engineer_agent",
        eventType: "insight",
        message: "Engineering blocked — unblock before starting new stories",
      },
      {
        agentRole: "qa_agent",
        eventType: "insight",
        message: "2 critical defect(s) — hold release candidate",
      },
    ]);

    expect(drafts.some((d) => d.targetRole === "engineer" && d.tone === "blocked")).toBe(true);
    expect(drafts.some((d) => d.targetRole === "pm")).toBe(true);
    expect(drafts.some((d) => d.targetRole === "qa" && d.tone === "blocked")).toBe(true);
  });

  it("passes smoke test", () => {
    const result = runAgentOrchestrationImpactSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.draftCount).toBeGreaterThanOrEqual(3);
  });
});
