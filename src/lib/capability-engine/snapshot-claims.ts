/**
 * Shared SnapshotClaims projection — single packaging contract for Profile,
 * Career Intelligence and Portfolio. Reads pi_capability_snapshots.profile only.
 * Never assigns or writes capability levels.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { compareGrowth } from "@/lib/capability-engine/growth-and-recommendations";
import type {
  CapabilityLevel,
  CapabilitySnapshotProfile,
} from "@/lib/capability-engine/types";
import type { RoleDefinition, RoleReadinessResult, ScoreRunCareerContext } from "@/lib/career-intelligence/types";
import type { PiProfileLevel, PiProfileScoreRun } from "@/lib/pi-profile/types";

export type SnapshotClaimLevel = {
  competencyId: string;
  indicatorId: string;
  level: CapabilityLevel | string;
  confidence: number;
  evidenceReferences: string[];
  reasoningSummary: string;
  limitations: string;
  reviewStatus?: string;
  intelligenceKinds?: string[];
};

export type SnapshotClaims = {
  snapshotId: string;
  scoreRunId: string | null;
  capturedAt: string;
  schemaVersion: string;
  rubricSlug: string | null;
  rubricVersion: string | null;
  frameworkVersionId: string | null;
  frameworkContentHash: string | null;
  readiness: number | null;
  dimensions: CapabilitySnapshotProfile["dimensions"] | null;
  levels: SnapshotClaimLevel[];
  strengths: string[];
  gaps: string[];
  recommendations: Array<{
    id?: string;
    title: string;
    rationale?: string;
    evidenceReferences?: string[];
  }>;
  targetComparison: CapabilitySnapshotProfile["targetComparison"] | null;
  contradictions: Array<{
    competencyId: string;
    summary: string;
    severity: string;
    evidenceIds: string[];
  }>;
  /** Explicit packaging flag — consumers never invent capability. */
  capabilityAssigned: false;
  source: "pi_capability_snapshots.profile";
};

export type SnapshotGrowthDelta = {
  status: "compared" | "insufficient_history";
  previousSnapshotId: string | null;
  currentSnapshotId: string | null;
  previousCapturedAt: string | null;
  currentCapturedAt: string | null;
  readinessFrom: number | null;
  readinessTo: number | null;
  readinessDelta: number | null;
  levelDeltas: Array<{ competencyId: string; from: string; to: string }>;
  gapsClosed: string[];
  gapsOpened: string[];
  message: string | null;
};

export type PortfolioCapabilityClaim = {
  competencyId: string;
  indicatorId: string;
  level: string;
  confidence: number;
  evidenceCitations: Array<{ evidenceId: string }>;
  reasoningSummary: string;
  limitations: string;
  /** Always false from ScoreRun — external attestation is Phase 8. */
  deliverxVerified: false;
  snapshotId: string;
  scoreRunId: string | null;
  frameworkVersionId: string | null;
  rubricSlug: string | null;
  rubricVersion: string | null;
};

export type SnapshotRowInput = {
  id: string;
  captured_at: string;
  score_run_id: string | null;
  profile: unknown;
};

export type SnapshotPinFields = {
  frameworkVersionId?: string | null;
  frameworkContentHash?: string | null;
  rubricSlug?: string | null;
  rubricVersion?: string | null;
};

const LEVEL_WEIGHT: Record<string, number> = {
  advanced: 1,
  proficient: 0.85,
  developing: 0.55,
  emerging: 0.3,
  insufficient_evidence: 0,
};

/** Minimum cited evidence refs across a role before ScoreRun projection is shown. */
export const ROLE_SCORE_RUN_EVIDENCE_FLOOR = 1;

type LooseProfile = Partial<CapabilitySnapshotProfile> & {
  frameworkVersionId?: string | null;
  frameworkContentHash?: string | null;
};

export function projectSnapshotClaims(
  row: SnapshotRowInput | null | undefined,
  pin?: SnapshotPinFields | null,
): SnapshotClaims | null {
  if (!row) return null;
  const profile = (row.profile ?? {}) as LooseProfile;

  const levels: SnapshotClaimLevel[] = (profile.judgements ?? [])
    .filter((j) => j.levelProposed !== "insufficient_evidence")
    .map((j) => ({
      competencyId: j.competencyId,
      indicatorId: j.indicatorId,
      level: j.levelProposed,
      confidence: j.confidence,
      evidenceReferences: j.evidenceReferences ?? [],
      reasoningSummary: j.reasoningSummary ?? "",
      limitations: j.limitations ?? "",
      reviewStatus: j.reviewStatus,
      intelligenceKinds: j.intelligenceKinds,
    }));

  return {
    snapshotId: row.id,
    scoreRunId: row.score_run_id,
    capturedAt: row.captured_at,
    schemaVersion: profile.schemaVersion ?? "1",
    rubricSlug: pin?.rubricSlug ?? profile.rubricSlug ?? null,
    rubricVersion: pin?.rubricVersion ?? profile.rubricVersion ?? null,
    frameworkVersionId:
      pin?.frameworkVersionId ?? profile.frameworkVersionId ?? null,
    frameworkContentHash:
      pin?.frameworkContentHash ?? profile.frameworkContentHash ?? null,
    readiness: typeof profile.readiness === "number" ? profile.readiness : null,
    dimensions: profile.dimensions ?? null,
    levels,
    strengths: Array.isArray(profile.strengths) ? profile.strengths : [],
    gaps: Array.isArray(profile.gaps) ? profile.gaps : [],
    recommendations: Array.isArray(profile.recommendations)
      ? profile.recommendations.map((r) => ({
          id: r.id,
          title: r.title,
          rationale: r.rationale,
          evidenceReferences: r.evidenceReferences,
        }))
      : [],
    targetComparison: profile.targetComparison ?? null,
    contradictions: Array.isArray(profile.contradictions)
      ? profile.contradictions.map((c) => ({
          competencyId: c.competencyId,
          summary: c.summary,
          severity: c.severity,
          evidenceIds: c.evidenceIds ?? [],
        }))
      : [],
    capabilityAssigned: false,
    source: "pi_capability_snapshots.profile",
  };
}

export function projectGrowthDelta(
  previous: SnapshotClaims | null,
  current: SnapshotClaims | null,
): SnapshotGrowthDelta {
  if (!current) {
    return {
      status: "insufficient_history",
      previousSnapshotId: null,
      currentSnapshotId: null,
      previousCapturedAt: null,
      currentCapturedAt: null,
      readinessFrom: null,
      readinessTo: null,
      readinessDelta: null,
      levelDeltas: [],
      gapsClosed: [],
      gapsOpened: [],
      message: "No ScoreRun yet — growth appears after two capability snapshots.",
    };
  }

  if (!previous) {
    return {
      status: "insufficient_history",
      previousSnapshotId: null,
      currentSnapshotId: current.snapshotId,
      previousCapturedAt: null,
      currentCapturedAt: current.capturedAt,
      readinessFrom: null,
      readinessTo: current.readiness,
      readinessDelta: null,
      levelDeltas: [],
      gapsClosed: [],
      gapsOpened: [],
      message:
        "First ScoreRun recorded. Growth delta appears after a second run under the same framework.",
    };
  }

  const previousProfile = claimsToComparableProfile(previous);
  const currentProfile = claimsToComparableProfile(current);
  const growth = compareGrowth(previousProfile, currentProfile);

  const prevGaps = new Set(previous.gaps);
  const currGaps = new Set(current.gaps);
  const gapsClosed = [...prevGaps].filter((g) => !currGaps.has(g));
  const gapsOpened = [...currGaps].filter((g) => !prevGaps.has(g));

  const readinessFrom = previous.readiness;
  const readinessTo = current.readiness;
  const readinessDelta =
    typeof readinessFrom === "number" && typeof readinessTo === "number"
      ? Math.round(readinessTo - readinessFrom)
      : null;

  return {
    status: "compared",
    previousSnapshotId: previous.snapshotId,
    currentSnapshotId: current.snapshotId,
    previousCapturedAt: previous.capturedAt,
    currentCapturedAt: current.capturedAt,
    readinessFrom,
    readinessTo,
    readinessDelta,
    levelDeltas: growth.deltas,
    gapsClosed,
    gapsOpened,
    message: null,
  };
}

function claimsToComparableProfile(claims: SnapshotClaims): CapabilitySnapshotProfile {
  return {
    schemaVersion: "1",
    algorithmVersion: "snapshot-claims",
    rubricSlug: claims.rubricSlug ?? "pm-core",
    rubricVersion: claims.rubricVersion ?? "unknown",
    modelVersion: "n/a",
    promptVersion: "n/a",
    generatedAt: claims.capturedAt,
    readiness: claims.readiness ?? 0,
    dimensions: claims.dimensions ?? {
      knowledge: 0,
      appliedSkill: 0,
      behaviour: 0,
      competency: 0,
      outcome: 0,
      potential: 0,
      readiness: 0,
    },
    judgements: claims.levels.map((l) => ({
      competencyId: l.competencyId,
      indicatorId: l.indicatorId,
      levelProposed: (l.level as CapabilityLevel) || "insufficient_evidence",
      evidenceReferences: l.evidenceReferences,
      reasoningSummary: l.reasoningSummary,
      counterEvidence: "",
      confidence: l.confidence,
      limitations: l.limitations,
      modelVersion: "n/a",
      promptVersion: "n/a",
      rubricVersion: claims.rubricVersion ?? "unknown",
      reviewStatus: (l.reviewStatus as CapabilitySnapshotProfile["judgements"][number]["reviewStatus"]) ?? "accepted",
      intelligenceKinds: (l.intelligenceKinds as CapabilitySnapshotProfile["judgements"][number]["intelligenceKinds"]) ?? [
        "competency",
      ],
    })),
    strengths: claims.strengths,
    gaps: claims.gaps,
    recommendations: claims.recommendations.map((r, i) => ({
      id: r.id ?? `rec-${i}`,
      title: r.title,
      rationale: r.rationale ?? "",
      evidenceReferences: r.evidenceReferences ?? [],
    })),
    contradictions: claims.contradictions.map((c) => ({
      competencyId: c.competencyId,
      evidenceIds: c.evidenceIds,
      summary: c.summary,
      severity: (c.severity as "low" | "medium" | "high") || "low",
    })),
    targetComparison: claims.targetComparison ?? {
      role: "",
      seniority: "",
      met: [],
      unmet: [],
    },
    explanations: [],
  };
}

export function toPiProfileScoreRun(claims: SnapshotClaims): PiProfileScoreRun {
  const levels: PiProfileLevel[] = claims.levels.slice(0, 12).map((l) => ({
    competencyId: l.competencyId,
    indicatorId: l.indicatorId,
    level: l.level,
    confidence: l.confidence,
    evidenceReferences: l.evidenceReferences,
    reasoningSummary: l.reasoningSummary,
  }));

  return {
    snapshotId: claims.snapshotId,
    scoreRunId: claims.scoreRunId,
    capturedAt: claims.capturedAt,
    rubricSlug: claims.rubricSlug,
    rubricVersion: claims.rubricVersion,
    frameworkVersionId: claims.frameworkVersionId,
    readinessSignal: claims.readiness,
    strengths: claims.strengths,
    gaps: claims.gaps,
    levels,
    recommendations: claims.recommendations.map((r) => ({
      id: r.id,
      title: r.title,
      rationale: r.rationale,
    })),
    emptyGuidance: null,
  };
}

export function toScoreRunCareerContext(
  claims: SnapshotClaims,
): ScoreRunCareerContext | null {
  if (typeof claims.readiness !== "number") return null;
  return {
    snapshotId: claims.snapshotId,
    scoreRunId: claims.scoreRunId,
    capturedAt: claims.capturedAt,
    readiness: claims.readiness,
    strengths: claims.strengths,
    gaps: claims.gaps,
    recommendations: claims.recommendations.map((r) => ({
      id: r.id,
      title: r.title,
      rationale: r.rationale,
    })),
    levels: claims.levels.map((l) => ({
      competencyId: l.competencyId,
      level: String(l.level),
      confidence: l.confidence,
      evidenceReferences: l.evidenceReferences,
    })),
    frameworkVersionId: claims.frameworkVersionId,
    rubricSlug: claims.rubricSlug,
    rubricVersion: claims.rubricVersion,
  };
}

/**
 * Portfolio claim packaging from SnapshotClaims.
 * When `allowedEvidenceIds` is set, citations outside the set are dropped.
 * Claims with no remaining citations are omitted (public/privacy-safe).
 */
export function toPortfolioCapabilityClaims(
  claims: SnapshotClaims,
  opts?: {
    allowedEvidenceIds?: Set<string> | null;
    requireCitations?: boolean;
  },
): PortfolioCapabilityClaim[] {
  const allowed = opts?.allowedEvidenceIds ?? null;
  const requireCitations = opts?.requireCitations ?? Boolean(allowed);

  return claims.levels
    .map((l) => {
      const refs = l.evidenceReferences.filter((id) =>
        allowed ? allowed.has(id) : true,
      );
      return {
        competencyId: l.competencyId,
        indicatorId: l.indicatorId,
        level: String(l.level),
        confidence: l.confidence,
        evidenceCitations: refs.map((evidenceId) => ({ evidenceId })),
        reasoningSummary: l.reasoningSummary,
        limitations: l.limitations,
        deliverxVerified: false as const,
        snapshotId: claims.snapshotId,
        scoreRunId: claims.scoreRunId,
        frameworkVersionId: claims.frameworkVersionId,
        rubricSlug: claims.rubricSlug,
        rubricVersion: claims.rubricVersion,
      };
    })
    .filter((c) => (requireCitations ? c.evidenceCitations.length > 0 : true));
}

function hintMatchesCompetency(hint: string, competencyId: string): boolean {
  const h = hint.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const c = competencyId.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!h || !c) return false;
  return c.includes(h) || h.includes(c) || c.includes(hint.toLowerCase().split(/\s+/)[0] ?? "");
}

/**
 * Derive per-role readiness from SnapshotClaims (not a second capability engine).
 * Returns null when evidence citations fall below the floor (thin projection suppressed).
 */
export function projectRoleReadinessFromClaims(
  role: RoleDefinition,
  claims: SnapshotClaims,
  evidenceFloor: number = ROLE_SCORE_RUN_EVIDENCE_FLOOR,
): RoleReadinessResult | null {
  const cited = new Set<string>();
  let earned = 0;
  let total = 0;

  const matches = role.requirements.map((req) => {
    const weight = req.weight ?? 1;
    total += weight;

    const hitLevels = claims.levels.filter((l) =>
      req.competencyHints.some((h) => hintMatchesCompetency(h, l.competencyId)),
    );
    for (const l of hitLevels) {
      for (const id of l.evidenceReferences) cited.add(id);
    }

    const met = claims.targetComparison?.met.some((m) =>
      req.competencyHints.some((h) => hintMatchesCompetency(h, m)),
    );
    const unmet = claims.targetComparison?.unmet.some((m) =>
      req.competencyHints.some((h) => hintMatchesCompetency(h, m)),
    );

    const bestWeight = hitLevels.reduce(
      (max, l) => Math.max(max, LEVEL_WEIGHT[String(l.level)] ?? 0),
      0,
    );

    let level: RoleReadinessResult["matches"][number]["level"];
    let gapExplanation: string;
    let recommendation: string | undefined;

    if (hitLevels.length > 0 && bestWeight >= 0.85) {
      level = "satisfied_strong";
      gapExplanation = `ScoreRun projection: ${hitLevels[0]?.competencyId} at ${hitLevels[0]?.level}.`;
      earned += weight;
    } else if (hitLevels.length > 0 && bestWeight >= 0.5) {
      level = "partially_supported";
      gapExplanation = `ScoreRun projection: developing signal on ${hitLevels[0]?.competencyId}.`;
      recommendation = "Generate stronger practice evidence, then re-run ScoreRun.";
      earned += weight * 0.5;
    } else if (met) {
      level = "partially_supported";
      gapExplanation = "ScoreRun target comparison marks related competencies as met.";
      earned += weight * 0.5;
    } else if (unmet || hitLevels.some((l) => String(l.level) === "emerging")) {
      level = "not_demonstrated";
      gapExplanation = "ScoreRun marks this requirement as unmet or emerging.";
      recommendation = `Close gap via Experience covering: ${req.competencyHints.join(", ")}.`;
    } else if (hitLevels.length > 0) {
      level = "claimed_unverified";
      gapExplanation = "ScoreRun signal is thin for this requirement.";
      earned += weight * 0.15;
    } else {
      level = "not_assessed";
      gapExplanation =
        "No ScoreRun judgement matched this role requirement — not assessed for this catalogue role.";
    }

    return {
      requirementId: req.id,
      label: req.label,
      level,
      evidenceCited: hitLevels
        .flatMap((l) => l.evidenceReferences)
        .slice(0, 5)
        .map((id) => ({ id, title: id, kind: "ledger" as const })),
      gapExplanation,
      recommendation,
    };
  });

  if (cited.size < evidenceFloor) {
    return null;
  }

  const readinessPct = total === 0 ? 0 : Math.round((earned / total) * 100);
  const strongCount = matches.filter((m) => m.level === "satisfied_strong").length;
  const partialCount = matches.filter((m) => m.level === "partially_supported").length;
  const gapCount = matches.filter(
    (m) => m.level === "not_demonstrated" || m.level === "claimed_unverified",
  ).length;
  const unexplainedCount = matches.filter((m) => m.level === "not_assessed").length;

  return {
    roleId: role.id,
    roleTitle: role.title,
    readinessPct,
    matches,
    strongCount,
    partialCount,
    gapCount,
    unexplainedCount,
    summary: [
      `${role.title}: ${readinessPct}% ScoreRun projection (from capability snapshot ${claims.snapshotId.slice(0, 8)}).`,
      `${strongCount} strong, ${partialCount} partial, ${gapCount} gaps.`,
      "This packages the ScoreRun — Career does not assign capability.",
    ].join(" "),
    capabilityAssigned: false,
    readinessKind: "score_run_projection",
  };
}

export async function loadRecentSnapshotClaims(
  supabase: SupabaseClient,
  userId: string,
  limit = 2,
): Promise<{
  latest: SnapshotClaims | null;
  previous: SnapshotClaims | null;
  growth: SnapshotGrowthDelta;
}> {
  const { data: rows } = await supabase
    .from("pi_capability_snapshots")
    .select("id, captured_at, profile, score_run_id")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false })
    .limit(limit);

  const list = (rows ?? []) as SnapshotRowInput[];
  const latestRow = list[0] ?? null;
  const previousRow = list[1] ?? null;

  let pin: SnapshotPinFields | null = null;
  if (latestRow?.score_run_id) {
    const { data: run } = await supabase
      .from("pi_capability_score_runs")
      .select("framework_version_id, framework_content_hash, rubric_slug, rubric_version")
      .eq("id", latestRow.score_run_id)
      .maybeSingle();
    if (run) {
      pin = {
        frameworkVersionId: (run.framework_version_id as string | null) ?? null,
        frameworkContentHash: (run.framework_content_hash as string | null) ?? null,
        rubricSlug: (run.rubric_slug as string | null) ?? null,
        rubricVersion: (run.rubric_version as string | null) ?? null,
      };
    }
  }

  const latest = projectSnapshotClaims(latestRow, pin);
  const previous = projectSnapshotClaims(previousRow);
  const growth = projectGrowthDelta(previous, latest);

  return { latest, previous, growth };
}
