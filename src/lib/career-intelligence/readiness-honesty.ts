/**
 * Launchpad packaging honesty helpers (T7).
 * SnapshotClaims / ScoreRun preferred; heuristics must stay labelled.
 */

export type ReadinessSource =
  | "score_run"
  | "evidence_coverage_heuristic"
  | "mixed";

export function readinessSourceLabel(source: ReadinessSource): string {
  switch (source) {
    case "score_run":
      return "ScoreRun projection";
    case "mixed":
      return "Mixed ScoreRun + evidence coverage (heuristic roles labelled)";
    case "evidence_coverage_heuristic":
      return "Evidence coverage (heuristic — not capability)";
  }
}

export function readinessSourceIsCapabilityTruth(source: ReadinessSource): boolean {
  return false;
}

export function deriveReadinessSource(input: {
  hasScoreRun: boolean;
  usedHeuristicFallback: boolean;
}): ReadinessSource {
  if (!input.hasScoreRun) return "evidence_coverage_heuristic";
  if (input.usedHeuristicFallback) return "mixed";
  return "score_run";
}
