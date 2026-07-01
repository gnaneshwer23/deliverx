import { describe, expect, it } from "vitest";
import {
  acceptedCategoryIds,
  allCategoriesResolved,
  applyBusinessCaseWorkspace,
  buildBusinessCaseReviewPayload,
  buildClarificationGapSeedRows,
  buildStructuredAnalysisFromReview,
  categoriesReadyToApply,
  structuredAnalysisToProjectDraft,
} from "@/services/businessCaseStructuredAnalysis";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";

const SAMPLE_REVIEW: BusinessCaseReview = {
  score: 78,
  healthDimensions: {
    problemClarity: 80,
    marketNeed: 85,
    feasibility: 75,
    roi: 70,
    risk: 65,
    dependencies: 72,
    innovation: 68,
  },
  feasibilityScore: 75,
  riskScore: 35,
  innovationScore: 68,
  financialConfidence: 70,
  deliveryConfidence: 76,
  recommendation: "conditional_go",
  recommendationConfidence: 82,
  recommendationReasons: ["Clear patient need", "Achievable phased delivery"],
  executiveSummary: "Modernise patient portal for self-service bookings.",
  summary: "Proceed with phased delivery.",
  strengths: ["Strong clinical sponsor"],
  gaps: ["Integration API spec missing"],
  missingInformation: ["Legacy EHR contract end date"],
  clarificationQuestions: ["Which regions launch first?"],
  suggestedProjectName: "Patient Portal",
  suggestedGoal: "Launch self-service portal for 50k patients",
  suggestedDeliveryType: "Digital Transformation",
  initialRisks: ["Integration complexity"],
  innovationAnalysis: {
    noveltyScore: 60,
    competitorComparison: "Comparable portals exist",
    differentiationGaps: [],
  },
  financialIntelligence: {
    devCostMin: 80000,
    devCostMax: 120000,
    infraCostMonthly: 3000,
    breakEvenMonths: 14,
    roi3YearPct: 140,
    currency: "GBP",
  },
  raidSeed: [{ type: "dependency", title: "EHR vendor API", severity: "high" }],
  scenarios: [{ title: "Phased rollout", deliveryDelayWeeks: 4, costReductionPct: 10, revenueImpact: "Neutral" }],
  deliveryConfidenceBreakdown: {
    successProbability: 76,
    timelineConfidence: 72,
    budgetConfidence: 70,
    stakeholderAlignment: 80,
  },
};

describe("buildStructuredAnalysisFromReview", () => {
  it("extracts all five PM review categories", () => {
    const analysis = buildStructuredAnalysisFromReview(SAMPLE_REVIEW, "Brief excerpt");
    expect(analysis.categories.map((c) => c.id)).toEqual([
      "requirements",
      "objectives",
      "risks",
      "scope",
      "timeline",
    ]);
    expect(analysis.categories.find((c) => c.id === "requirements")?.items.length).toBeGreaterThan(0);
    expect(analysis.categories.find((c) => c.id === "risks")?.items.length).toBeGreaterThan(0);
    expect(analysis.summary).toContain("Modernise patient portal");
  });
});

describe("buildBusinessCaseReviewPayload", () => {
  it("includes structured analysis and structure draft for artifact review", () => {
    const payload = buildBusinessCaseReviewPayload({
      review: SAMPLE_REVIEW,
      briefExcerpt: "Patient portal brief",
      projectName: "Patient Portal",
      extractionStatus: "queued",
    });

    expect(payload.structuredAnalysis).toBeDefined();
    expect(payload.draft).toBeDefined();
    expect((payload.draft as { workstreams: unknown[] }).workstreams.length).toBeGreaterThan(0);
    expect(payload.score).toBe(78);
  });
});

describe("structuredAnalysisToProjectDraft", () => {
  it("maps scope, risks, objectives, and timeline into delivery structure", () => {
    const analysis = buildStructuredAnalysisFromReview(SAMPLE_REVIEW);
    const draft = structuredAnalysisToProjectDraft(analysis, "Patient Portal");

    expect(draft.workstreams.length).toBe(1);
    expect(draft.raidItems.length).toBeGreaterThan(0);
    expect(draft.milestones.length).toBeGreaterThan(0);
    expect(draft.tasks.length).toBeGreaterThan(0);
  });
});

describe("category review decisions", () => {
  it("requires at least one accepted category before apply", () => {
    const analysis = buildStructuredAnalysisFromReview(SAMPLE_REVIEW);
    expect(categoriesReadyToApply(analysis)).toBe(false);
    expect(allCategoriesResolved(analysis)).toBe(false);

    analysis.categories[0].decision = "accepted";
    expect(categoriesReadyToApply(analysis)).toBe(true);
    expect(acceptedCategoryIds(analysis)).toContain("requirements");
  });
});

describe("applyBusinessCaseWorkspace", () => {
  it("is exported for approval-gated workspace bootstrap", () => {
    expect(typeof applyBusinessCaseWorkspace).toBe("function");
  });
});

describe("buildClarificationGapSeedRows", () => {
  it("maps BC review gaps into seed rows", () => {
    const rows = buildClarificationGapSeedRows(SAMPLE_REVIEW);
    expect(rows.some((r) => r.title.includes("Integration API"))).toBe(true);
  });
});
