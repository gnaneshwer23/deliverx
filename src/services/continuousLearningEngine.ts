/**
 * Continuous learning — pure classification and scoring for Stage 15.
 */

export type LessonCategory =
  | "estimation"
  | "governance"
  | "technical"
  | "stakeholder"
  | "process"
  | "quality"
  | "general";

export type DefectLeakageCategory =
  | "req_ambiguity"
  | "code_defect"
  | "env_config"
  | "process_gap"
  | "unknown";

export type StructuredLessonDraft = {
  lesson: string;
  category: LessonCategory;
  confidence: number;
};

export type EstimateVarianceRow = {
  role: string;
  plannedDays: number;
  actualDays: number;
  varianceDays: number;
  variancePct: number | null;
};

export type ProposalQualityInput = {
  status: string;
  source: string;
  actionType: string;
  createdAt: string;
  decidedAt: string | null;
  appliedAt: string | null;
};

export type ProposalQualityResult = {
  qualityScore: number;
  signals: {
    status: string;
    source: string;
    hoursToDecision: number | null;
    meetingSource: boolean;
  };
};

const LESSON_RULES: Array<{ category: LessonCategory; pattern: RegExp }> = [
  { category: "estimation", pattern: /\b(estimates?|effort|duration|scope creep|sizing)\b/i },
  { category: "governance", pattern: /\b(governance|steering|approval|decision|raid|risk)\b/i },
  { category: "technical", pattern: /\b(architecture|technical|debt|integration|api|deploy)\b/i },
  { category: "stakeholder", pattern: /\b(stakeholder|sponsor|communication|expectation)\b/i },
  { category: "process", pattern: /\b(process|ceremony|standup|handoff|workflow)\b/i },
  { category: "quality", pattern: /\b(test|qa|defect|quality|uat|regression)\b/i },
];

const LEAKAGE_RULES: Array<{ category: DefectLeakageCategory; pattern: RegExp }> = [
  { category: "req_ambiguity", pattern: /\b(requirement|ambiguous|unclear|spec|acceptance)\b/i },
  { category: "code_defect", pattern: /\b(bug|regression|null|crash|exception|logic)\b/i },
  { category: "env_config", pattern: /\b(environment|config|deployment|infra|pipeline|release)\b/i },
  { category: "process_gap", pattern: /\b(process|handoff|workflow|documentation|training)\b/i },
];

export function categorizeLesson(lesson: string): StructuredLessonDraft {
  const trimmed = lesson.trim();
  if (!trimmed) {
    return { lesson: "", category: "general", confidence: 0.5 };
  }

  for (const rule of LESSON_RULES) {
    if (rule.pattern.test(trimmed)) {
      return { lesson: trimmed, category: rule.category, confidence: 0.85 };
    }
  }

  return { lesson: trimmed, category: "general", confidence: 0.7 };
}

export function classifyDefectLeakage(title: string, description?: string | null): DefectLeakageCategory {
  const text = `${title} ${description ?? ""}`.trim();
  if (!text) return "unknown";

  for (const rule of LEAKAGE_RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }

  return "unknown";
}

export function computeEstimateVariance(
  role: string,
  plannedDays: number,
  actualDays: number,
): EstimateVarianceRow {
  const planned = Math.max(plannedDays, 0);
  const actual = Math.max(actualDays, 0);
  const varianceDays = Math.round((actual - planned) * 10) / 10;
  const variancePct =
    planned > 0 ? Math.round(((actual - planned) / planned) * 1000) / 10 : null;

  return {
    role,
    plannedDays: planned,
    actualDays: actual,
    varianceDays,
    variancePct,
  };
}

export function distributeActualDaysByRole(
  totalActualDays: number,
  plannedByRole: Array<{ role: string; plannedDays: number }>,
): EstimateVarianceRow[] {
  const totalPlanned = plannedByRole.reduce((sum, row) => sum + row.plannedDays, 0);
  if (totalPlanned <= 0 || totalActualDays <= 0) return [];

  return plannedByRole.map(({ role, plannedDays }) => {
    const share = plannedDays / totalPlanned;
    const actualDays = Math.round(totalActualDays * share * 10) / 10;
    return computeEstimateVariance(role, plannedDays, actualDays);
  });
}

export function scoreProposalQuality(input: ProposalQualityInput): ProposalQualityResult {
  const created = new Date(input.createdAt).getTime();
  const decided = input.decidedAt ? new Date(input.decidedAt).getTime() : null;
  const hoursToDecision =
    decided != null && Number.isFinite(decided)
      ? Math.round(((decided - created) / 3_600_000) * 10) / 10
      : null;

  let qualityScore = 50;
  if (input.status === "applied") qualityScore = 95;
  else if (input.status === "approved") qualityScore = 80;
  else if (input.status === "rejected") qualityScore = 25;
  else if (input.status === "pending") {
    const ageHours = (Date.now() - created) / 3_600_000;
    qualityScore = ageHours > 168 ? 35 : 55;
  }

  if (input.source === "meeting" && input.status === "applied") {
    qualityScore = Math.min(100, qualityScore + 5);
  }

  if (hoursToDecision != null && hoursToDecision <= 24 && input.status !== "rejected") {
    qualityScore = Math.min(100, qualityScore + 5);
  }

  return {
    qualityScore,
    signals: {
      status: input.status,
      source: input.source,
      hoursToDecision,
      meetingSource: input.source === "meeting",
    },
  };
}

export function summarizeLeakageTaxonomy(
  rows: Array<{ category: DefectLeakageCategory; count: number }>,
): Array<{ category: DefectLeakageCategory; count: number; pct: number }> {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) return [];

  return rows.map((row) => ({
    ...row,
    pct: Math.round((row.count / total) * 1000) / 10,
  }));
}
