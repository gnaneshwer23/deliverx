import { describe, expect, it } from "vitest";
import {
  buildEngineerShippingKpis,
  buildEngineerShippingSynthesis,
} from "./engineer-shipping-kpis";

describe("engineer-shipping-kpis", () => {
  it("caps at five KPIs", () => {
    const kpis = buildEngineerShippingKpis({
      overview: {
        assignedStories: 5,
        blockedStories: 1,
        openPrs: 2,
        buildHealth: "amber",
        sprintProgress: 40,
        technicalDebt: "Low",
        deploymentRisk: "Low",
      },
      prDashboard: { openPrs: 2, reviewsRequired: 1, avgReviewHours: 4 },
      cicd: {
        buildStatus: "Success",
        deployment: "Staging",
        testCoverage: 80,
        failedTests: 0,
        lastDeployment: "1h ago",
      },
      githubConfigured: true,
      blockedDependencies: 1,
    });
    expect(kpis).toHaveLength(5);
  });

  it("synthesises shipping blockers", () => {
    const summary = buildEngineerShippingSynthesis({
      blockedStories: 2,
      openPrs: 1,
      reviewsRequired: 3,
      blockedDependencies: 0,
      buildHealth: "red",
    });
    expect(summary).toContain("2 blocked stories");
    expect(summary).toContain("CI build failing");
  });
});
