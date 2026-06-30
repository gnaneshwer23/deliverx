import { HONEST_KPI_EMPTY } from "@/lib/honest-kpi";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";
import type { BusinessCaseStructuredAnalysis } from "@/services/businessCaseStructuredAnalysis";

export type ExtractionSummaryCounts = {
  requirements: number | null;
  gaps: number | null;
  objectives: number | null;
  traceability: number | null;
  risks: number | null;
};

export function buildExtractionCounts(input: {
  requirementsExtracted: number;
  traceabilityScore: number | null;
  report: BusinessCaseReview | null;
  structuredAnalysis?: BusinessCaseStructuredAnalysis | null;
}): ExtractionSummaryCounts {
  const report = input.report;
  const structured = input.structuredAnalysis;

  const categoryCount = (id: BusinessCaseStructuredAnalysis["categories"][number]["id"]) => {
    const cat = structured?.categories.find((c) => c.id === id);
    const len = cat?.items.length ?? 0;
    return len > 0 ? len : structured ? 0 : null;
  };

  const gaps = report?.gaps?.length ?? null;
  const objectives = structured
    ? categoryCount("objectives")
    : (report?.clarificationQuestions?.length ??
      (report?.suggestedGoal?.trim() ? 1 : null));
  const risks = structured
    ? categoryCount("risks")
    : report != null
      ? (report.initialRisks?.length ?? 0) + (report.raidSeed?.length ?? 0)
      : null;

  const structuredRequirements = categoryCount("requirements");

  return {
    requirements:
      input.requirementsExtracted > 0
        ? input.requirementsExtracted
        : structuredRequirements,
    gaps: gaps != null && gaps > 0 ? gaps : gaps === 0 ? 0 : null,
    objectives: objectives != null && objectives > 0 ? objectives : objectives === 0 ? 0 : null,
    traceability:
      input.traceabilityScore != null && input.traceabilityScore > 0
        ? input.traceabilityScore
        : null,
    risks: risks != null && risks > 0 ? risks : risks === 0 ? 0 : null,
  };
}

export function formatExtractionCount(value: number | null): string {
  if (value == null) return HONEST_KPI_EMPTY;
  return String(value);
}
