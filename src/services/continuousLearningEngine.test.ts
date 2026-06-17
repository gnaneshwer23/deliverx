import { describe, expect, it } from "vitest";
import {
  categorizeLesson,
  classifyDefectLeakage,
  computeEstimateVariance,
  distributeActualDaysByRole,
  scoreProposalQuality,
  summarizeLeakageTaxonomy,
} from "@/services/continuousLearningEngine";

describe("continuousLearningEngine", () => {
  it("categorizes closure lessons by domain", () => {
    expect(categorizeLesson("Estimates were too optimistic for QA").category).toBe("estimation");
    expect(categorizeLesson("Steering committee needed earlier involvement").category).toBe(
      "governance",
    );
  });

  it("classifies defect leakage taxonomy", () => {
    expect(classifyDefectLeakage("Requirement ambiguity on acceptance criteria")).toBe(
      "req_ambiguity",
    );
    expect(classifyDefectLeakage("Null pointer regression in checkout")).toBe("code_defect");
  });

  it("computes estimate variance rows", () => {
    const row = computeEstimateVariance("engineering", 20, 26);
    expect(row.varianceDays).toBe(6);
    expect(row.variancePct).toBe(30);
  });

  it("distributes actual days across roles proportionally", () => {
    const rows = distributeActualDaysByRole(30, [
      { role: "pm", plannedDays: 10 },
      { role: "engineering", plannedDays: 20 },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0].actualDays + rows[1].actualDays).toBeCloseTo(30, 0);
  });

  it("scores meeting proposal quality", () => {
    const applied = scoreProposalQuality({
      status: "applied",
      source: "meeting",
      actionType: "create_task",
      createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      decidedAt: new Date().toISOString(),
      appliedAt: new Date().toISOString(),
    });
    expect(applied.qualityScore).toBeGreaterThanOrEqual(95);

    const rejected = scoreProposalQuality({
      status: "rejected",
      source: "meeting",
      actionType: "create_raid",
      createdAt: new Date().toISOString(),
      decidedAt: null,
      appliedAt: null,
    });
    expect(rejected.qualityScore).toBeLessThanOrEqual(30);
  });

  it("summarizes leakage taxonomy percentages", () => {
    const summary = summarizeLeakageTaxonomy([
      { category: "code_defect", count: 3 },
      { category: "req_ambiguity", count: 1 },
    ]);
    expect(summary.find((s) => s.category === "code_defect")?.pct).toBe(75);
    expect(summary.find((s) => s.category === "req_ambiguity")?.pct).toBe(25);
  });
});
