import { describe, expect, it } from "vitest";
import { computeReleaseReadinessFromDb } from "@/services/qaQualityData";

describe("computeReleaseReadinessFromDb", () => {
  it("computes readiness from test pass rate, defects, and UAT", () => {
    const metrics = computeReleaseReadinessFromDb({
      testCases: [
        {
          code: "TC-1",
          title: "Login",
          priority: "high",
          linkedStory: "US-1",
          automationCandidate: true,
          type: "functional",
          status: "passed",
        },
        {
          code: "TC-2",
          title: "Logout",
          priority: "medium",
          linkedStory: "US-1",
          automationCandidate: false,
          type: "functional",
          status: "failed",
        },
      ],
      defects: [
        {
          code: "D-1",
          title: "Crash on save",
          severity: "critical",
          owner: "Eng",
          status: "open",
        },
      ],
      uat: [{ group: "Ops", completionPct: 80 }],
      storyCount: 4,
    });

    expect(metrics.openDefects).toBe(1);
    expect(metrics.criticalDefects).toBe(1);
    expect(metrics.passedTests).toBe(1);
    expect(metrics.failedTests).toBe(1);
    expect(metrics.testCoverage).toBe(50);
    expect(metrics.automationCoverage).toBe(50);
    expect(metrics.releaseReadiness).toBeGreaterThan(0);
    expect(metrics.releaseReadiness).toBeLessThan(100);
  });

  it("returns zero coverage when no stories or executed tests", () => {
    const metrics = computeReleaseReadinessFromDb({
      testCases: [
        {
          code: "TC-1",
          title: "Draft case",
          priority: "low",
          linkedStory: "—",
          automationCandidate: false,
          type: "functional",
          status: "draft",
        },
      ],
      defects: [],
      uat: [],
      storyCount: 0,
    });

    expect(metrics.testCoverage).toBe(0);
    expect(metrics.uatCompletion).toBe(0);
  });
});
