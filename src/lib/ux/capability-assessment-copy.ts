/**
 * Presentation-layer labels for capability assessment.
 * Internal engine identifier remains ScoreRun (APIs, DB, code).
 * User-facing primary CTAs and headings must not say "ScoreRun".
 */

export const CAPABILITY_ASSESSMENT_COPY = {
  /** Short product action name */
  productName: "Capability assessment",
  runCta: "Run assessment",
  runningCta: "Running assessment…",
  reRunCta: "Update your capability profile",
  reRunOptionalCta: "Update capability profile (optional)",
  latestHeading: "Latest assessment",
  evidenceNav: "Evidence & capability",
  finishBaselineCta: "Finish baseline & assessment",
  seeCapabilityCta: "See your capability profile",
  openEvidenceCta: "Open Evidence & capability",
  /** Career / readiness source chip text */
  readinessFromAssessment: "readiness from capability assessment",
  readinessMixed: "readiness mixed (assessment + labelled heuristic)",
  readinessHeuristic: "readiness from evidence coverage (heuristic)",
  /** Per-role % source labels — never present heuristic as capability truth */
  projectionLabel: "Capability assessment projection",
  projectionTitle: "Assessment projection — not a free-floating capability invent",
  coverageLabel: "Evidence coverage (heuristic — not capability)",
  coverageTitle: "Evidence coverage heuristic — not capability",
  projectionAbbrev: "proj.",
  coverageAbbrev: "cov.",
  noAssessmentYet:
    "No capability assessment yet — percentages below are evidence coverage (heuristic), not capability.",
  readinessSignalPrefix: "Assessment readiness signal",
  failed: "Assessment failed",
  couldNotComplete: "Assessment could not complete — add more practice evidence.",
  runningNotice: "Running capability assessment against your Evidence Ledger…",
  readyNotice: "Evidence Ledger ready. Capability assessment projects capability from this evidence.",
  completeNotice: "Assessment complete. Readiness, strengths and gaps are projected from evidence.",
  reusedNotice: "Same inputs — reused prior assessment (deterministic).",
  emptySnapshotHint:
    "No snapshot yet. After you have evidence, run an assessment to see readiness, strengths and gaps.",
  growthSinceLast: "Growth since last assessment",
  noOpenGaps: "No open gaps on the latest assessment — keep packaging evidence or explore opportunities.",
  engineFooter:
    "Capability levels are projected by the Capability Engine from the Evidence Ledger. This page never assigns capability.",
} as const;

/** Career Intelligence is the user-facing product name; /launchpad remains the route family. */
export const CAREER_PRODUCT_COPY = {
  productName: "Career Intelligence",
  routeFamily: "Launchpad",
  hubJourneyName: "Career Intelligence",
  hubCta: "Open Career Intelligence",
  hubProgress: "Evidence-backed readiness, roadmap, interview lab, applications",
  chromeEyebrow: "DeliverX · Launchpad",
  metadataTitle: "Career Intelligence | DeliverX",
} as const;

export function readinessKindUserLabel(
  kind: "score_run_projection" | "evidence_coverage" | undefined,
): string {
  if (kind === "score_run_projection") return CAPABILITY_ASSESSMENT_COPY.projectionLabel;
  return CAPABILITY_ASSESSMENT_COPY.coverageLabel;
}

export function readinessKindTitle(
  kind: "score_run_projection" | "evidence_coverage" | undefined,
): string {
  if (kind === "score_run_projection") return CAPABILITY_ASSESSMENT_COPY.projectionTitle;
  return CAPABILITY_ASSESSMENT_COPY.coverageTitle;
}

export function readinessKindAbbrev(
  kind: "score_run_projection" | "evidence_coverage" | undefined,
): string {
  if (kind === "score_run_projection") return CAPABILITY_ASSESSMENT_COPY.projectionAbbrev;
  return CAPABILITY_ASSESSMENT_COPY.coverageAbbrev;
}
