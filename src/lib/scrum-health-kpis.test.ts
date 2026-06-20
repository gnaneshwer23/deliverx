import { describe, expect, it } from "vitest";
import {
  buildScrumBurndownPoints,
  buildScrumHealthKpis,
  buildScrumHealthSynthesis,
} from "./scrum-health-kpis";

describe("scrum-health-kpis", () => {
  it("returns five team health KPIs", () => {
    const kpis = buildScrumHealthKpis({
      overview: {
        sprintLabel: "Sprint 12",
        completionPct: 45,
        daysRemaining: 4,
        blockedStories: 2,
        velocityTrend: "Stable",
        teamHealth: "Good",
        burnoutRisk: "Low",
        sprintSuccessProbability: 70,
      },
      sprintHealth: {
        plannedPoints: 30,
        completedPoints: 14,
        completionRate: 47,
        spilloverRisk: "Medium",
        deliveryConfidence: 68,
        prediction: "On track with risk",
      },
      impediments: [{ title: "Env access", owner: "DevOps", ageDays: 3, severity: "high" }],
      dataSources: { velocity: "live" },
    });
    expect(kpis).toHaveLength(5);
  });

  it("builds burndown points from sprint health", () => {
    const points = buildScrumBurndownPoints({
      plannedPoints: 20,
      completedPoints: 8,
      daysRemaining: 5,
    });
    expect(points.length).toBeGreaterThan(0);
    expect(points[points.length - 1]?.remaining).toBe(12);
  });

  it("synthesises team blockers", () => {
    const summary = buildScrumHealthSynthesis({
      impedimentCount: 2,
      blockedStories: 1,
      completionPct: 30,
      daysRemaining: 2,
      impedimentTitle: "VPN access",
    });
    expect(summary).toContain("VPN access");
    expect(summary).toContain("unblock the team");
  });
});
