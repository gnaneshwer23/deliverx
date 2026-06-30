import { HONEST_KPI_EMPTY } from "@/lib/honest-kpi";
import type { BusinessCaseReview } from "@/services/aiBusinessCaseReview";

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
}): ExtractionSummaryCounts {
  const report = input.report;
  const gaps = report?.gaps?.length ?? null;
  const objectives =
    report?.clarificationQuestions?.length ??
    (report?.suggestedGoal?.trim() ? 1 : null);
  const risks =
    report != null
      ? (report.initialRisks?.length ?? 0) + (report.raidSeed?.length ?? 0)
      : null;

  return {
    requirements: input.requirementsExtracted > 0 ? input.requirementsExtracted : null,
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
