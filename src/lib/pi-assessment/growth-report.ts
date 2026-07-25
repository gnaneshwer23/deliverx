/**
 * Citation-backed growth report: baseline → practice/Experience → final/transfer.
 * Reuses compareGrowth / SnapshotClaims. Hard-refuses cross-framework comparison.
 * Never assigns capability levels.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  compareGrowth,
} from "@/lib/capability-engine/growth-and-recommendations";
import {
  loadRecentSnapshotClaims,
  projectGrowthDelta,
  projectSnapshotClaims,
  type SnapshotClaims,
  type SnapshotGrowthDelta,
} from "@/lib/capability-engine/snapshot-claims";
import type { CapabilitySnapshotProfile } from "@/lib/capability-engine/types";
import { industriesCollide } from "@/lib/pi-assessment/transfer-catalog";
import type { FinalNextAction } from "@/lib/pi-assessment/types";

export type GrowthReportLevelRow = {
  competencyId: string;
  baselineLevel: string | null;
  practiceLevel: string | null;
  finalLevel: string | null;
  baselineConfidence: number | null;
  practiceConfidence: number | null;
  finalConfidence: number | null;
  evidenceIds: string[];
};

export type GrowthReportBody = {
  schemaVersion: "1";
  status: "insufficient_history" | "ready" | "blocked_cross_version";
  message: string | null;
  frameworkSlug: string;
  frameworkVersion: string;
  frameworkVersionId: string | null;
  experienceIndustry: string | null;
  transferIndustry: string | null;
  transferSlug: string | null;
  transferDiffersFromExperience: boolean;
  baseline: SnapshotClaims | null;
  practice: SnapshotClaims | null;
  final: SnapshotClaims | null;
  baselineToPractice: SnapshotGrowthDelta;
  practiceToFinal: SnapshotGrowthDelta;
  baselineToFinal: SnapshotGrowthDelta;
  levels: GrowthReportLevelRow[];
  transferableStrengths: string[];
  remainingLimitations: string[];
  practicePerformance: {
    readiness: number | null;
    strengths: string[];
    gaps: string[];
  };
  transferPerformance: {
    readiness: number | null;
    strengths: string[];
    gaps: string[];
    note: string;
  };
  evidenceIds: string[];
  nextAction: FinalNextAction;
  capabilityAssigned: false;
  deliverxVerified: false;
};

export type GrowthReportRecord = {
  id: string;
  userId: string;
  status: GrowthReportBody["status"];
  report: GrowthReportBody;
  evidenceIds: string[];
  citationCount: number;
  createdAt: string;
};

function claimsToProfile(claims: SnapshotClaims): CapabilitySnapshotProfile {
  return {
    schemaVersion: "1",
    algorithmVersion: "growth-report",
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
      levelProposed: l.level as CapabilitySnapshotProfile["judgements"][number]["levelProposed"],
      evidenceReferences: l.evidenceReferences,
      reasoningSummary: l.reasoningSummary,
      counterEvidence: "",
      confidence: l.confidence,
      limitations: l.limitations,
      modelVersion: "n/a",
      promptVersion: "n/a",
      rubricVersion: claims.rubricVersion ?? "unknown",
      reviewStatus: "accepted",
      intelligenceKinds: ["competency"],
    })),
    strengths: claims.strengths,
    gaps: claims.gaps,
    recommendations: [],
    contradictions: [],
    targetComparison: claims.targetComparison ?? {
      role: "",
      seniority: "",
      met: [],
      unmet: [],
    },
    explanations: [],
  };
}

function sameFrameworkPin(
  a: SnapshotClaims | null,
  b: SnapshotClaims | null,
): boolean {
  if (!a || !b) return true;
  if (a.frameworkVersionId && b.frameworkVersionId) {
    return a.frameworkVersionId === b.frameworkVersionId;
  }
  return (
    (a.rubricSlug ?? "") === (b.rubricSlug ?? "") &&
    (a.rubricVersion ?? "") === (b.rubricVersion ?? "")
  );
}

function buildLevelRows(
  baseline: SnapshotClaims | null,
  practice: SnapshotClaims | null,
  finalClaims: SnapshotClaims | null,
): GrowthReportLevelRow[] {
  const keys = new Set<string>();
  for (const pack of [baseline, practice, finalClaims]) {
    for (const l of pack?.levels ?? []) keys.add(l.competencyId);
  }
  return [...keys].sort().map((competencyId) => {
    const b = baseline?.levels.find((l) => l.competencyId === competencyId);
    const p = practice?.levels.find((l) => l.competencyId === competencyId);
    const f = finalClaims?.levels.find((l) => l.competencyId === competencyId);
    const evidenceIds = [
      ...new Set([
        ...(b?.evidenceReferences ?? []),
        ...(p?.evidenceReferences ?? []),
        ...(f?.evidenceReferences ?? []),
      ]),
    ];
    return {
      competencyId,
      baselineLevel: b ? String(b.level) : null,
      practiceLevel: p ? String(p.level) : null,
      finalLevel: f ? String(f.level) : null,
      baselineConfidence: b?.confidence ?? null,
      practiceConfidence: p?.confidence ?? null,
      finalConfidence: f?.confidence ?? null,
      evidenceIds,
    };
  });
}

function buildNextAction(input: {
  status: GrowthReportBody["status"];
  transferableStrengths: string[];
}): FinalNextAction {
  if (input.status === "insufficient_history") {
    return {
      title: "Accumulate ScoreRuns before a growth report",
      rationale:
        "A citation-backed growth report needs baseline and final snapshots under the same framework pin.",
      href: "/profile/evidence?run=1",
      kind: "evidence",
    };
  }
  if (input.transferableStrengths.length > 0) {
    return {
      title: "Review Portfolio eligibility",
      rationale:
        "Your growth report cites transferable strengths. Package portfolio entries from evidence — the Verified badge stays off until employer attestation (Phase 8).",
      href: "/portfolio",
      kind: "portfolio_eligibility",
    };
  }
  return {
    title: "Explore Career readiness",
    rationale:
      "Use your growth report gaps and transfer performance to guide Career Intelligence — readiness signals are descriptive, not a Verified credential.",
    href: "/launchpad/app",
    kind: "career_readiness",
  };
}

export function buildGrowthReportBody(input: {
  baseline: SnapshotClaims | null;
  practice: SnapshotClaims | null;
  final: SnapshotClaims | null;
  frameworkSlug: string;
  frameworkVersion: string;
  frameworkVersionId: string | null;
  experienceIndustry: string | null;
  transferIndustry: string | null;
  transferSlug: string | null;
  finalEvidenceIds?: string[];
}): GrowthReportBody {
  const { baseline, practice, final: finalClaims } = input;

  if (!baseline || !finalClaims) {
    const emptyDelta = projectGrowthDelta(null, finalClaims ?? baseline);
    return {
      schemaVersion: "1",
      status: "insufficient_history",
      message:
        "Need both a baseline ScoreRun and a final ScoreRun under the same framework to build a growth report.",
      frameworkSlug: input.frameworkSlug,
      frameworkVersion: input.frameworkVersion,
      frameworkVersionId: input.frameworkVersionId,
      experienceIndustry: input.experienceIndustry,
      transferIndustry: input.transferIndustry,
      transferSlug: input.transferSlug,
      transferDiffersFromExperience: !industriesCollide(
        input.experienceIndustry,
        input.transferIndustry,
      ),
      baseline,
      practice,
      final: finalClaims,
      baselineToPractice: projectGrowthDelta(baseline, practice),
      practiceToFinal: projectGrowthDelta(practice, finalClaims),
      baselineToFinal: emptyDelta,
      levels: [],
      transferableStrengths: [],
      remainingLimitations: [],
      practicePerformance: {
        readiness: practice?.readiness ?? null,
        strengths: practice?.strengths ?? [],
        gaps: practice?.gaps ?? [],
      },
      transferPerformance: {
        readiness: finalClaims?.readiness ?? null,
        strengths: finalClaims?.strengths ?? [],
        gaps: finalClaims?.gaps ?? [],
        note: "Transfer performance is reported separately from practice.",
      },
      evidenceIds: input.finalEvidenceIds ?? [],
      nextAction: buildNextAction({
        status: "insufficient_history",
        transferableStrengths: [],
      }),
      capabilityAssigned: false,
      deliverxVerified: false,
    };
  }

  if (
    !sameFrameworkPin(baseline, finalClaims) ||
    (practice && !sameFrameworkPin(baseline, practice))
  ) {
    return {
      schemaVersion: "1",
      status: "blocked_cross_version",
      message:
        "Cross-framework-version comparison is blocked without a published mapping. Re-run ScoreRun under the same framework_version_id.",
      frameworkSlug: input.frameworkSlug,
      frameworkVersion: input.frameworkVersion,
      frameworkVersionId: input.frameworkVersionId,
      experienceIndustry: input.experienceIndustry,
      transferIndustry: input.transferIndustry,
      transferSlug: input.transferSlug,
      transferDiffersFromExperience: !industriesCollide(
        input.experienceIndustry,
        input.transferIndustry,
      ),
      baseline,
      practice,
      final: finalClaims,
      baselineToPractice: projectGrowthDelta(null, null),
      practiceToFinal: projectGrowthDelta(null, null),
      baselineToFinal: projectGrowthDelta(null, null),
      levels: [],
      transferableStrengths: [],
      remainingLimitations: finalClaims.gaps.slice(0, 5),
      practicePerformance: {
        readiness: practice?.readiness ?? null,
        strengths: practice?.strengths ?? [],
        gaps: practice?.gaps ?? [],
      },
      transferPerformance: {
        readiness: finalClaims.readiness,
        strengths: finalClaims.strengths,
        gaps: finalClaims.gaps,
        note: "Transfer performance withheld from delta until framework pins match.",
      },
      evidenceIds: input.finalEvidenceIds ?? [],
      nextAction: {
        title: "Align framework pin and re-run",
        rationale:
          "Growth comparison refused — baseline and final must share framework_version_id.",
        href: "/profile/evidence?run=1",
        kind: "evidence",
      },
      capabilityAssigned: false,
      deliverxVerified: false,
    };
  }

  const baselineToPractice = projectGrowthDelta(baseline, practice);
  const practiceToFinal = projectGrowthDelta(practice, finalClaims);
  const baselineToFinal = projectGrowthDelta(baseline, finalClaims);

  // Confidence-aware: surface compareGrowth deltas for citation
  const growth = compareGrowth(claimsToProfile(baseline), claimsToProfile(finalClaims));
  void growth;

  const levels = buildLevelRows(baseline, practice, finalClaims);
  const evidenceIds = [
    ...new Set([
      ...(input.finalEvidenceIds ?? []),
      ...levels.flatMap((l) => l.evidenceIds),
    ]),
  ];

  const transferableStrengths = finalClaims.strengths.filter(
    (s) =>
      baseline.strengths.includes(s) ||
      (practice?.strengths ?? []).includes(s) ||
      baselineToFinal.gapsClosed.some((g) => s.includes(g.split(":")[0] ?? "")),
  );
  const strengthsForNext =
    transferableStrengths.length > 0
      ? transferableStrengths
      : finalClaims.strengths.slice(0, 3);

  const remainingLimitations = [
    ...new Set([...finalClaims.gaps, ...baselineToFinal.gapsOpened]),
  ].slice(0, 8);

  const status: GrowthReportBody["status"] = "ready";
  return {
    schemaVersion: "1",
    status,
    message: null,
    frameworkSlug: input.frameworkSlug,
    frameworkVersion: input.frameworkVersion,
    frameworkVersionId: input.frameworkVersionId,
    experienceIndustry: input.experienceIndustry,
    transferIndustry: input.transferIndustry,
    transferSlug: input.transferSlug,
    transferDiffersFromExperience: !industriesCollide(
      input.experienceIndustry,
      input.transferIndustry,
    ),
    baseline,
    practice,
    final: finalClaims,
    baselineToPractice,
    practiceToFinal,
    baselineToFinal,
    levels,
    transferableStrengths: strengthsForNext,
    remainingLimitations,
    practicePerformance: {
      readiness: practice?.readiness ?? null,
      strengths: practice?.strengths ?? [],
      gaps: practice?.gaps ?? [],
    },
    transferPerformance: {
      readiness: finalClaims.readiness,
      strengths: finalClaims.strengths,
      gaps: finalClaims.gaps,
      note: "Transfer and practice are reported separately to detect teaching-to-the-test.",
    },
    evidenceIds,
    nextAction: buildNextAction({
      status,
      transferableStrengths: strengthsForNext,
    }),
    capabilityAssigned: false,
    deliverxVerified: false,
  };
}

async function loadSnapshotByRunKind(
  supabase: SupabaseClient,
  userId: string,
  runKind: "baseline" | "standard" | "final" | "transfer",
): Promise<{ claims: SnapshotClaims | null; scoreRunId: string | null; snapshotId: string | null }> {
  const { data: run } = await supabase
    .from("pi_capability_score_runs")
    .select("id, framework_version_id, framework_content_hash, rubric_slug, rubric_version")
    .eq("user_id", userId)
    .eq("run_kind", runKind)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!run) {
    return { claims: null, scoreRunId: null, snapshotId: null };
  }

  const { data: snap } = await supabase
    .from("pi_capability_snapshots")
    .select("id, captured_at, score_run_id, profile")
    .eq("user_id", userId)
    .eq("score_run_id", run.id)
    .maybeSingle();

  if (!snap) {
    return { claims: null, scoreRunId: run.id as string, snapshotId: null };
  }

  const claims = projectSnapshotClaims(
    {
      id: snap.id as string,
      captured_at: snap.captured_at as string,
      score_run_id: snap.score_run_id as string,
      profile: snap.profile,
    },
    {
      frameworkVersionId: run.framework_version_id as string | null,
      frameworkContentHash: run.framework_content_hash as string | null,
      rubricSlug: run.rubric_slug as string | null,
      rubricVersion: run.rubric_version as string | null,
    },
  );

  return {
    claims,
    scoreRunId: run.id as string,
    snapshotId: snap.id as string,
  };
}

/** Pick a mid-arc practice snapshot: prefer non-baseline/non-final, else second-latest. */
async function loadPracticeSnapshot(
  supabase: SupabaseClient,
  userId: string,
  baselineSnapshotId: string | null,
  finalSnapshotId: string | null,
): Promise<{ claims: SnapshotClaims | null; scoreRunId: string | null; snapshotId: string | null }> {
  const pack = await loadRecentSnapshotClaims(supabase, userId, 8);
  const candidates = [pack.latest, pack.previous].filter(Boolean) as SnapshotClaims[];

  // Also try standard runs
  const standard = await loadSnapshotByRunKind(supabase, userId, "standard");
  if (
    standard.claims &&
    standard.snapshotId !== baselineSnapshotId &&
    standard.snapshotId !== finalSnapshotId
  ) {
    return standard;
  }

  for (const c of candidates) {
    if (c.snapshotId === baselineSnapshotId || c.snapshotId === finalSnapshotId) continue;
    return {
      claims: c,
      scoreRunId: c.scoreRunId,
      snapshotId: c.snapshotId,
    };
  }

  return { claims: null, scoreRunId: null, snapshotId: null };
}

export async function buildAndPersistGrowthReport(
  supabase: SupabaseClient,
  input: {
    userId: string;
    assessmentSessionId: string;
    frameworkSlug: string;
    frameworkVersion: string;
    frameworkVersionId: string | null;
    experiencePlanId: string | null;
    experienceIndustry: string | null;
    transferIndustry: string | null;
    transferSlug: string | null;
    finalScoreRunId: string | null;
    finalSnapshotId: string | null;
    finalEvidenceIds: string[];
  },
): Promise<GrowthReportRecord> {
  const baselinePack = await loadSnapshotByRunKind(supabase, input.userId, "baseline");
  let finalPack = {
    claims: null as SnapshotClaims | null,
    scoreRunId: input.finalScoreRunId,
    snapshotId: input.finalSnapshotId,
  };

  if (input.finalSnapshotId) {
    const { data: snap } = await supabase
      .from("pi_capability_snapshots")
      .select("id, captured_at, score_run_id, profile")
      .eq("id", input.finalSnapshotId)
      .eq("user_id", input.userId)
      .maybeSingle();
    if (snap) {
      finalPack = {
        claims: projectSnapshotClaims({
          id: snap.id as string,
          captured_at: snap.captured_at as string,
          score_run_id: snap.score_run_id as string,
          profile: snap.profile,
        }),
        scoreRunId: (snap.score_run_id as string) ?? input.finalScoreRunId,
        snapshotId: snap.id as string,
      };
    }
  }
  if (!finalPack.claims) {
    finalPack = await loadSnapshotByRunKind(supabase, input.userId, "final");
  }

  const practicePack = await loadPracticeSnapshot(
    supabase,
    input.userId,
    baselinePack.snapshotId,
    finalPack.snapshotId,
  );

  const report = buildGrowthReportBody({
    baseline: baselinePack.claims,
    practice: practicePack.claims,
    final: finalPack.claims,
    frameworkSlug: input.frameworkSlug,
    frameworkVersion: input.frameworkVersion,
    frameworkVersionId: input.frameworkVersionId,
    experienceIndustry: input.experienceIndustry,
    transferIndustry: input.transferIndustry,
    transferSlug: input.transferSlug,
    finalEvidenceIds: input.finalEvidenceIds,
  });

  const { data: row, error } = await supabase
    .from("pi_growth_reports")
    .insert({
      user_id: input.userId,
      framework_version_id: input.frameworkVersionId,
      framework_slug: input.frameworkSlug,
      framework_version: input.frameworkVersion,
      baseline_snapshot_id: baselinePack.snapshotId,
      practice_snapshot_id: practicePack.snapshotId,
      final_snapshot_id: finalPack.snapshotId,
      baseline_score_run_id: baselinePack.scoreRunId,
      practice_score_run_id: practicePack.scoreRunId,
      final_score_run_id: finalPack.scoreRunId,
      assessment_session_id: input.assessmentSessionId,
      experience_plan_id: input.experiencePlanId,
      experience_industry: input.experienceIndustry,
      transfer_industry: input.transferIndustry,
      transfer_slug: input.transferSlug,
      status: report.status,
      report,
      evidence_ids: report.evidenceIds,
      citation_count: report.evidenceIds.length,
      next_action_kind: report.nextAction.kind,
      capability_assigned: false,
    })
    .select("id, created_at")
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "Failed to persist growth report");
  }

  await supabase
    .from("pi_assessment_sessions")
    .update({ growth_report_id: row.id })
    .eq("id", input.assessmentSessionId)
    .eq("user_id", input.userId);

  return {
    id: row.id as string,
    userId: input.userId,
    status: report.status,
    report,
    evidenceIds: report.evidenceIds,
    citationCount: report.evidenceIds.length,
    createdAt: row.created_at as string,
  };
}

export async function loadLatestGrowthReport(
  supabase: SupabaseClient,
  userId: string,
): Promise<GrowthReportRecord | null> {
  const { data, error } = await supabase
    .from("pi_growth_reports")
    .select("id, user_id, status, report, evidence_ids, citation_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id as string,
    userId: data.user_id as string,
    status: data.status as GrowthReportBody["status"],
    report: data.report as GrowthReportBody,
    evidenceIds: (data.evidence_ids as string[]) ?? [],
    citationCount: (data.citation_count as number) ?? 0,
    createdAt: data.created_at as string,
  };
}
