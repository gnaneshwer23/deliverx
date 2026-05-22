/**
 * Charter Alignment Engine — pure compute, no I/O.
 *
 * Combines delivery signals with charter goal coverage heuristics.
 * AI semantic scoring is blended in by alignment.ts when available.
 */

export type AlignmentTier = "aligned" | "drifting" | "misaligned";
export type AlignmentTrend = "up" | "flat" | "down";

export type AlignmentSignals = {
  goalCount: number;
  goalsReferencedInTasks: number;
  charterWordCount: number;
  openCriticalRisks: number;
  openHighRisks: number;
  approvedDecisions: number;
  proposedDecisions: number;
  tasksDoneRatio: number;
  healthScore: number;
  hasRecentMeetingSummary: boolean;
};

export type AlignmentResult = {
  score: number;
  tier: AlignmentTier;
  trend: AlignmentTrend;
  factors: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function tierFor(score: number): AlignmentTier {
  if (score >= 75) return "aligned";
  if (score >= 50) return "drifting";
  return "misaligned";
}

export function computeCharterAlignment(s: AlignmentSignals): AlignmentResult {
  if (s.charterWordCount < 20 && s.goalCount === 0) {
    return {
      score: 0,
      tier: "misaligned",
      trend: "flat",
      factors: ["Define a project charter to measure alignment"],
    };
  }

  let score = 52;

  if (s.goalCount > 0) {
    const coverage = s.goalsReferencedInTasks / s.goalCount;
    score += coverage * 28;
    if (coverage >= 0.8) {
      score += 5;
    } else if (coverage < 0.3) {
      score -= 8;
    }
  } else if (s.charterWordCount >= 100) {
    score += 12;
  }

  score += s.tasksDoneRatio * 12;
  score += Math.min(s.approvedDecisions * 2, 10);
  score -= s.openCriticalRisks * 10;
  score -= s.openHighRisks * 5;
  score -= Math.min(s.proposedDecisions, 5);
  if (s.healthScore < 55) score -= 12;
  else if (s.healthScore < 70) score -= 6;
  if (s.hasRecentMeetingSummary) score += 4;

  score = clamp(Math.round(score), 0, 100);

  const factors: string[] = [];
  if (s.goalCount > 0) {
    const pct = Math.round((s.goalsReferencedInTasks / s.goalCount) * 100);
    factors.push(`${pct}% of charter goals reflected in active delivery work`);
  }
  if (s.openCriticalRisks > 0) {
    factors.push(`${s.openCriticalRisks} critical open risk(s) pull alignment down`);
  }
  if (s.healthScore < 70) {
    factors.push("Delivery health below target vs charter intent");
  }
  if (s.approvedDecisions > 0) {
    factors.push(`${s.approvedDecisions} approved decision(s) anchor scope`);
  }
  if (factors.length === 0) {
    factors.push("Delivery activity tracks charter baseline");
  }

  return {
    score,
    tier: tierFor(score),
    trend: "flat",
    factors: factors.slice(0, 4),
  };
}

export function blendAlignmentScores(
  heuristic: number,
  aiScore: number | null,
): number {
  if (aiScore == null || Number.isNaN(aiScore)) return heuristic;
  return clamp(Math.round(heuristic * 0.35 + aiScore * 0.65), 0, 100);
}

export function alignmentTrendFromHistory(
  current: number,
  previous: number | null,
): AlignmentTrend {
  if (previous == null) return "flat";
  if (current > previous + 2) return "up";
  if (current < previous - 2) return "down";
  return "flat";
}

export function tierForScore(score: number): AlignmentTier {
  return tierFor(score);
}
