import { describe, expect, it } from "vitest";
import {
  buildIntelligenceLoopSnapshot,
  runIntelligenceLoopSmokeTest,
} from "./intelligenceLoopEngine";

describe("intelligenceLoopEngine", () => {
  it("runs smoke test with healthy closed loop", () => {
    const result = runIntelligenceLoopSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.stageCount).toBe(6);
    expect(result.loopScore).toBeGreaterThanOrEqual(70);
  });

  it("marks approve stage blocked when backlog is high", () => {
    const snapshot = buildIntelligenceLoopSnapshot({
      activeProjectCount: 2,
      standupsToday: 1,
      meetingsWithNotes: 1,
      openTasks: 5,
      ragMemoryHits: 2,
      traceLinkCount: 3,
      twinPortfolioHealth: 72,
      forecastConfidence: 0.7,
      agentRunsLast24h: 1,
      agentInsightsLast24h: 2,
      pendingProposals: 5,
      pendingApprovals: 6,
      lessonsCaptured: 1,
      proposalQualityAvg: 70,
      estimateVarianceRows: 1,
    });

    const approve = snapshot.stages.find((s) => s.id === "approve");
    expect(approve?.status).toBe("blocked");
    expect(snapshot.humanGateActive).toBe(true);
  });

  it("returns idle loop when no active projects", () => {
    const snapshot = buildIntelligenceLoopSnapshot({
      activeProjectCount: 0,
      standupsToday: 0,
      meetingsWithNotes: 0,
      openTasks: 0,
      ragMemoryHits: 0,
      traceLinkCount: 0,
      twinPortfolioHealth: null,
      forecastConfidence: null,
      agentRunsLast24h: 0,
      agentInsightsLast24h: 0,
      pendingProposals: 0,
      pendingApprovals: 0,
      lessonsCaptured: 0,
      proposalQualityAvg: null,
      estimateVarianceRows: 0,
    });

    expect(snapshot.loopScore).toBeLessThan(60);
    expect(snapshot.stages.every((s) => s.status === "idle" || s.id === "approve")).toBe(true);
  });
});
