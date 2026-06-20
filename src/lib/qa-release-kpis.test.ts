import { describe, expect, it } from "vitest";
import {
  buildQaReleaseKpis,
  buildQaReleaseSynthesis,
  deriveQaGoNoGoVerdict,
} from "./qa-release-kpis";

describe("qa-release-kpis", () => {
  it("derives No-Go when critical defects exist", () => {
    expect(
      deriveQaGoNoGoVerdict({
        overall: 85,
        criticalDefects: 1,
        recommendation: "Go with caution",
      }),
    ).toBe("No-Go");
  });

  it("derives Go when readiness is high and no critical defects", () => {
    expect(
      deriveQaGoNoGoVerdict({
        overall: 88,
        criticalDefects: 0,
        recommendation: "Go for release",
      }),
    ).toBe("Go");
  });

  it("synthesises release blockers when live", () => {
    const summary = buildQaReleaseSynthesis({
      releaseReadiness: 55,
      recommendation: "Hold",
      criticalDefects: 2,
      openDefects: 8,
      testCoverage: 60,
      isLive: true,
    });
    expect(summary).toContain("2 critical defects");
    expect(summary).toContain("go/no-go");
  });

  it("returns five KPIs", () => {
    const kpis = buildQaReleaseKpis({
      overview: {
        releaseReadiness: 70,
        testCoverage: 75,
        automationCoverage: 60,
        openDefects: 3,
        criticalDefects: 0,
        uatCompletion: 80,
        productionRisk: "Low",
      },
      releaseReadiness: {
        overall: 70,
        coverage: 75,
        defects: 80,
        performance: 70,
        security: 85,
        uat: 80,
        recommendation: "Hold",
        reason: "UAT incomplete",
      },
      automation: {
        manualTests: 10,
        automatedTests: 20,
        coveragePct: 60,
        pipelineSuccessPct: 95,
      },
      dataSources: { qaMetrics: "live" },
    });
    expect(kpis).toHaveLength(5);
  });
});
