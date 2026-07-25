/**
 * PI Profile aggregate — stitches onboarding, Evidence Ledger, ScoreRun snapshot
 * and Career Intelligence into one read-only centre for the five questions.
 * Never assigns or writes capability levels.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCareerIntelligenceSnapshot } from "@/lib/career-intelligence/context";
import {
  loadRecentSnapshotClaims,
  projectGrowthDelta,
  toPiProfileScoreRun,
  type SnapshotClaims,
  type SnapshotGrowthDelta,
} from "@/lib/capability-engine/snapshot-claims";
import {
  loadActiveExperiencePlan,
  planExperienceFromGaps,
  type ExperiencePlanRecord,
} from "@/lib/experience-planner";
import {
  PI_BASELINE_PATH,
  PI_EVIDENCE_PATH,
  PI_PROFILE_PATH,
} from "@/lib/pi-profile/paths";
import type {
  PiProfileAggregate,
  PiProfileIdentity,
  PiProfileNextAction,
  PiProfileScoreRun,
} from "@/lib/pi-profile/types";

const BASELINE_SOURCE_TYPES = new Set([
  "baseline_assessment",
  "adaptive_interview",
  "work_sample",
]);

export async function buildPiProfileAggregate(
  supabase: SupabaseClient,
  userId: string,
): Promise<PiProfileAggregate> {
  const [{ data: pi }, { data: evidenceRows }, snapshotPack, career, activePlan] =
    await Promise.all([
      supabase
        .from("pi_onboarding_sessions")
        .select("payload, status")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("pi_evidence_records")
        .select("id, title, source_type, captured_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      loadRecentSnapshotClaims(supabase, userId, 2),
      buildCareerIntelligenceSnapshot(supabase, userId).catch(() => null),
      loadActiveExperiencePlan(supabase, userId).catch(() => null),
    ]);

  const identity = projectIdentity(pi);
  const evidence = projectEvidence(evidenceRows ?? []);
  const scoreRun = snapshotPack.latest
    ? toPiProfileScoreRun(snapshotPack.latest)
    : null;
  const growthDelta = snapshotPack.growth;
  const holdingBack = {
    topGaps: scoreRun?.gaps.slice(0, 5) ?? [],
    emptyGuidance: !scoreRun
      ? "Run ScoreRun after you have practice evidence to see what is holding you back."
      : null,
  };

  const experiencePlan =
    activePlan ??
    (scoreRun
      ? synthesiseEphemeralPlan(identity, scoreRun)
      : null);

  const nextAction = projectNextAction({
    identity,
    evidenceCount: evidence.totalCount,
    baselineEvidenceCount: Object.entries(evidence.bySourceType)
      .filter(([k]) => BASELINE_SOURCE_TYPES.has(k) || k === "reflection")
      .reduce((sum, [, n]) => sum + n, 0),
    scoreRun,
    careerRoadmap: career?.roadmap ?? [],
    experiencePlan,
  });

  const opportunities = {
    items: (career?.opportunities ?? []).slice(0, 3),
    emptyGuidance:
      (career?.opportunities?.length ?? 0) > 0
        ? null
        : "Complete identity and a ScoreRun so opportunity matching can use your evidence.",
  };

  return {
    identity,
    evidence,
    scoreRun,
    growthDelta,
    holdingBack,
    nextAction,
    opportunities,
    capabilityAssigned: false,
    roadmapTeaser: (career?.roadmap ?? []).slice(0, 3),
    experiencePlan,
  };
}

function synthesiseEphemeralPlan(
  identity: PiProfileIdentity,
  scoreRun: PiProfileScoreRun,
): ExperiencePlanRecord {
  const recommendation = planExperienceFromGaps({
    gaps: scoreRun.gaps,
    levels: scoreRun.levels.map((l) => ({
      competencyId: l.competencyId,
      level: String(l.level),
      confidence: l.confidence,
    })),
    recommendations: scoreRun.recommendations,
    targetRole: identity.targetRole,
    targetSeniority: identity.targetSeniority,
    snapshotId: scoreRun.snapshotId,
    scoreRunId: scoreRun.scoreRunId,
    frameworkVersionId: scoreRun.frameworkVersionId,
  });
  return {
    ...recommendation,
    id: "ephemeral",
    status: "active",
    createdAt: scoreRun.capturedAt,
    enrolmentId: null,
  };
}

function projectIdentity(
  pi: { payload: unknown; status: string } | null,
): PiProfileIdentity {
  const payload = (pi?.payload as Record<string, unknown>) ?? {};
  const complete = pi?.status === "completed";
  return {
    firstName: String(payload.firstName ?? ""),
    lastName: String(payload.lastName ?? ""),
    professionalIdentity:
      payload.professionalIdentity === "Other"
        ? String(payload.professionalIdentityOther ?? "Other")
        : (payload.professionalIdentity as string) || null,
    targetRole: (payload.targetRole as string) || null,
    targetSeniority: (payload.targetSeniority as string) || null,
    objective: (payload.careerObjective as string) || null,
    situation: (payload.currentSituation as string) || null,
    industries: Array.isArray(payload.preferredIndustries)
      ? (payload.preferredIndustries as string[])
      : [],
    onboardingComplete: complete,
    baselineOptIn: payload.baselineOptIn !== false,
    source: complete || Object.keys(payload).length ? "pi_onboarding" : "none",
  };
}

function projectEvidence(
  rows: Array<{
    id: string;
    title: string;
    source_type: string;
    captured_at: string | null;
    created_at: string;
  }>,
) {
  const bySourceType: Record<string, number> = {};
  for (const row of rows) {
    bySourceType[row.source_type] = (bySourceType[row.source_type] ?? 0) + 1;
  }
  const latest = rows[0] ?? null;
  return {
    totalCount: rows.length,
    latestTitle: latest?.title ?? null,
    latestCapturedAt: latest?.captured_at || latest?.created_at || null,
    bySourceType,
    emptyGuidance:
      rows.length === 0
        ? "No evidence yet. Take the baseline assessment or complete Experience Day 1 — decisions and reflections land in your ledger automatically."
        : null,
  };
}

function projectNextAction(input: {
  identity: PiProfileIdentity;
  evidenceCount: number;
  baselineEvidenceCount: number;
  scoreRun: PiProfileScoreRun | null;
  careerRoadmap: Array<{
    title: string;
    rationale: string;
    href?: string;
    kind: string;
  }>;
  experiencePlan?: ExperiencePlanRecord | null;
}): PiProfileNextAction {
  if (!input.identity.onboardingComplete && !input.identity.firstName) {
    return {
      title: "Complete Professional Intelligence onboarding",
      rationale: "Identity anchors every later claim and recommendation.",
      href: "/onboarding/profile",
      kind: "onboarding",
    };
  }
  // Opt-in baseline before (or without) Experience — D5/D6: parallel, not blocking.
  if (
    input.identity.baselineOptIn &&
    input.baselineEvidenceCount === 0 &&
    !input.scoreRun
  ) {
    return {
      title: "Take the baseline assessment",
      rationale:
        "Establish a credible starting picture via interview, scenarios and a work sample — evidence only, not a personality quiz.",
      href: PI_BASELINE_PATH,
      kind: "baseline",
    };
  }
  if (input.evidenceCount === 0) {
    const planHref = input.experiencePlan?.href ?? "/experience/app";
    return {
      title: "Start Experience Day 1",
      rationale: "Practice decisions create durable evidence for your profile.",
      href: planHref,
      kind: "experience",
    };
  }
  if (!input.scoreRun) {
    return {
      title: "Run ScoreRun on your Evidence Ledger",
      rationale: "Project readiness, strengths and gaps from evidence you already have.",
      href: `${PI_EVIDENCE_PATH}?run=1`,
      kind: "evidence",
    };
  }
  if (input.experiencePlan) {
    return {
      title: input.experiencePlan.title,
      rationale: input.experiencePlan.rationale,
      href: input.experiencePlan.href,
      kind: "recommendation",
    };
  }
  const gap = input.scoreRun.gaps[0];
  const rec = input.scoreRun.recommendations[0];
  if (rec || gap) {
    return {
      title: rec?.title ?? "Practice the top gap in Experience",
      rationale:
        rec?.rationale ||
        (gap
          ? `Baseline/ScoreRun highlights “${gap}”. Experience (MediFlow) produces observed practice evidence against the same framework pin.`
          : "From your latest ScoreRun recommendation."),
      href: "/experience/app",
      kind: "recommendation",
    };
  }
  const roadmap = input.careerRoadmap[0];
  if (roadmap) {
    return {
      title: roadmap.title,
      rationale: roadmap.rationale,
      href: roadmap.href || "/launchpad/app",
      kind: "career",
    };
  }
  return {
    title: "Review your Evidence Ledger",
    rationale: "Keep accumulating practice evidence and re-run ScoreRun as you grow.",
    href: PI_EVIDENCE_PATH,
    kind: "evidence",
  };
}

/** Pure projection helper for tests — same shape, no I/O. */
export function projectPiProfileFromParts(parts: {
  identity: PiProfileIdentity;
  evidenceCount: number;
  baselineEvidenceCount?: number;
  scoreRun: PiProfileScoreRun | null;
  claims?: SnapshotClaims | null;
  previousClaims?: SnapshotClaims | null;
  experiencePlan?: ExperiencePlanRecord | null;
}): Pick<
  PiProfileAggregate,
  "identity" | "holdingBack" | "nextAction" | "capabilityAssigned" | "growthDelta"
> {
  const holdingBack = {
    topGaps: parts.scoreRun?.gaps.slice(0, 5) ?? [],
    emptyGuidance: !parts.scoreRun
      ? "Run ScoreRun after you have practice evidence to see what is holding you back."
      : null,
  };
  const growthDelta: SnapshotGrowthDelta = projectGrowthDelta(
    parts.previousClaims ?? null,
    parts.claims ?? null,
  );
  return {
    identity: parts.identity,
    holdingBack,
    nextAction: projectNextAction({
      identity: parts.identity,
      evidenceCount: parts.evidenceCount,
      baselineEvidenceCount: parts.baselineEvidenceCount ?? 0,
      scoreRun: parts.scoreRun,
      careerRoadmap: [],
      experiencePlan: parts.experiencePlan ?? null,
    }),
    capabilityAssigned: false,
    growthDelta,
  };
}

export { PI_PROFILE_PATH };
