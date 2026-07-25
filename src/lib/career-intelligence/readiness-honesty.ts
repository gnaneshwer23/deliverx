/**
 * Launchpad packaging honesty helpers (T7).
 * SnapshotClaims / capability assessment preferred; heuristics must stay labelled.
 * Engine identifier remains ScoreRun internally.
 */

import { CAPABILITY_ASSESSMENT_COPY } from "@/lib/ux/capability-assessment-copy";

export type ReadinessSource =
  | "score_run"
  | "evidence_coverage_heuristic"
  | "mixed";

export function readinessSourceLabel(source: ReadinessSource): string {
  switch (source) {
    case "score_run":
      return CAPABILITY_ASSESSMENT_COPY.projectionLabel;
    case "mixed":
      return "Mixed assessment + evidence coverage (heuristic roles labelled)";
    case "evidence_coverage_heuristic":
      return CAPABILITY_ASSESSMENT_COPY.coverageLabel;
  }
}

export function readinessSourceIsCapabilityTruth(source: ReadinessSource): boolean {
  void source;
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

/** Header chip for Career Intelligence readiness source. */
export function readinessSourceChip(source: ReadinessSource | undefined): string {
  switch (source) {
    case "score_run":
      return CAPABILITY_ASSESSMENT_COPY.readinessFromAssessment;
    case "mixed":
      return CAPABILITY_ASSESSMENT_COPY.readinessMixed;
    case "evidence_coverage_heuristic":
    default:
      return CAPABILITY_ASSESSMENT_COPY.readinessHeuristic;
  }
}
