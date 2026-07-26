import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildClarificationGapSeedRows } from "@/lib/businessCaseStructuredAnalysis.shared";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import { requirementChangeToImpactDrafts } from "@/services/loopEventPropagation";

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
  recommendationReasons: ["Clear patient need"],
  executiveSummary: "Modernise patient portal.",
  summary: "Proceed with phased delivery.",
  strengths: ["Strong clinical sponsor"],
  gaps: ["Integration API spec missing"],
  missingInformation: ["Legacy EHR contract end date"],
  clarificationQuestions: ["Which regions launch first?"],
  suggestedProjectName: "Patient Portal",
  suggestedGoal: "Launch self-service portal",
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
  raidSeed: [],
  scenarios: [],
  deliveryConfidenceBreakdown: {
    successProbability: 76,
    timelineConfidence: 72,
    budgetConfidence: 70,
    stakeholderAlignment: 80,
  },
};

describe("0061 requirements migration smoke", () => {
  it("defines clarification_gaps table and project-member RLS", () => {
    const sql = readFileSync(
      join(process.cwd(), "supabase/migrations/0061_requirements_workspace_rls.sql"),
      "utf8",
    );
    expect(sql).toContain("create table if not exists public.clarification_gaps");
    expect(sql).toContain("is_workspace_project_member");
    expect(sql).toContain("requirements_project_member");
    expect(sql).toContain("business_case_review_id");
  });
});

describe("buildClarificationGapSeedRows", () => {
  it("seeds gaps, missing info, and clarification questions", () => {
    const rows = buildClarificationGapSeedRows(SAMPLE_REVIEW);
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows.some((r) => r.gapType === "gap")).toBe(true);
    expect(rows.some((r) => r.gapType === "missing_info")).toBe(true);
    expect(rows.some((r) => r.gapType === "clarification")).toBe(true);
  });
});

describe("requirement accept propagation", () => {
  it("emits PM signal when BA accepts a requirement", () => {
    const drafts = requirementChangeToImpactDrafts({
      reqCode: "REQ-001",
      title: "Online booking",
      statusBefore: "draft",
      statusAfter: "approved",
    });
    expect(
      drafts.some((d) => d.targetRole === "pm" && d.message.includes("approved by BA")),
    ).toBe(true);
  });
});

describe("updateRequirement service exports", () => {
  it("exports CRUD helpers from baRequirements", async () => {
    const mod = await import("@/services/baRequirements");
    expect(typeof mod.updateRequirement).toBe("function");
    expect(
      typeof (mod as Record<string, unknown>).seedRequirementsFromStructuredAnalysis,
    ).toBe("undefined");
    expect(typeof mod.bulkInsertClarificationGaps).toBe("function");
    expect(typeof mod.listClarificationGaps).toBe("function");
  });

  it("exports BC seed helpers from businessCaseStructuredAnalysis", async () => {
    const mod = await import("@/services/businessCaseStructuredAnalysis");
    expect(typeof mod.seedRequirementsFromStructuredAnalysis).toBe("function");
    expect(typeof mod.seedClarificationGapsFromReview).toBe("function");
  });
});
