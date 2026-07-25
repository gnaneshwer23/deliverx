import type { SupabaseClient } from "@supabase/supabase-js";
import { CAREER_ROLE_CATALOGUE } from "@/lib/career-intelligence/role-catalogue";
import { scoreRoleReadiness, type MatchableEvidence } from "@/lib/career-intelligence/matching";
import {
  buildInterviewPlan,
  buildRoadmapFromReadiness,
  buildRoadmapFromScoreRunGaps,
  matchOpportunities,
} from "@/lib/career-intelligence/workflows";
import type {
  CareerIntelligenceSnapshot,
  ScoreRunCareerContext,
} from "@/lib/career-intelligence/types";
import { listPortfolioEntries } from "@/lib/verified-portfolio/store";
import { listUserEvidenceForPortfolio } from "@/lib/verified-portfolio/store";
import { deriveEvidenceStrength } from "@/lib/verified-portfolio/types";

/**
 * Load PI + VPP + ledger + latest ScoreRun context for Career Intelligence.
 * Read-only toward capability — never persists capability scores.
 */
export async function buildCareerIntelligenceSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<CareerIntelligenceSnapshot> {
  const [{ data: pi }, { data: lpProfile }, portfolio, ledger, { data: capSnap }] =
    await Promise.all([
      supabase
        .from("pi_onboarding_sessions")
        .select("payload, status, recommended_path")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("launchpad_profiles")
        .select("first_name, last_name, target_role, background, career_goal, experience_level")
        .eq("user_id", userId)
        .maybeSingle(),
      listPortfolioEntries(supabase, userId).catch(() => []),
      listUserEvidenceForPortfolio(supabase, userId).catch(() => []),
      supabase
        .from("pi_capability_snapshots")
        .select("id, captured_at, profile, score_run_id")
        .eq("user_id", userId)
        .order("captured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const payload = (pi?.payload as Record<string, unknown>) ?? {};
  const piComplete = pi?.status === "completed";

  const profile = {
    firstName: String(
      payload.firstName ?? lpProfile?.first_name ?? "",
    ),
    lastName: String(payload.lastName ?? lpProfile?.last_name ?? ""),
    targetRole: (payload.targetRole as string) || (lpProfile?.target_role as string) || null,
    targetSeniority: (payload.targetSeniority as string) || null,
    industries: Array.isArray(payload.preferredIndustries)
      ? (payload.preferredIndustries as string[])
      : [],
    objective: (payload.careerObjective as string) || (lpProfile?.career_goal as string) || null,
    situation: (payload.currentSituation as string) || null,
    source: piComplete
      ? ("pi_onboarding" as const)
      : lpProfile
        ? ("launchpad_profile" as const)
        : ("none" as const),
  };

  const evidence: MatchableEvidence[] = [
    ...ledger.map((e) => ({
      id: e.id,
      title: e.title,
      sourceType: e.sourceType,
      status: e.status,
      strength: deriveEvidenceStrength(e),
      competencies: [] as string[],
      kind: "ledger" as const,
      selfReportOnly: e.sourceType === "self_report" || e.sourceType === "reflection",
    })),
    ...portfolio.flatMap((entry) =>
      entry.evidenceLinks.map((link) => ({
        id: link.evidenceId,
        title: `${entry.title}: ${link.title}`,
        sourceType: link.sourceType,
        status: link.ledgerStatus,
        strength: link.strength,
        competencies: entry.competenciesDemonstrated,
        kind: "portfolio" as const,
        selfReportOnly: link.strength === "self_reported",
      })),
    ),
  ];

  const targetSeniority = profile.targetSeniority ?? "associate";
  const roles = CAREER_ROLE_CATALOGUE.filter((r) => {
    if (profile.targetRole) {
      const tr = profile.targetRole.toLowerCase();
      if (r.title.toLowerCase().includes("associate") && tr.includes("associate")) return true;
      if (!tr.includes("associate") && r.seniority === "mid") return true;
    }
    return r.seniority === targetSeniority || r.seniority === "associate";
  });

  const catalogue = roles.length ? roles : CAREER_ROLE_CATALOGUE;
  let roleReadiness = catalogue
    .map((role) => scoreRoleReadiness(role, evidence, profile.source !== "none"))
    .sort((a, b) => b.readinessPct - a.readinessPct);

  const scoreRun = parseScoreRunContext(capSnap);
  const readinessSource = scoreRun
    ? ("score_run" as const)
    : ("evidence_coverage_heuristic" as const);

  // Prefer ScoreRun readiness for the top role when a snapshot exists.
  if (scoreRun && roleReadiness[0]) {
    roleReadiness = [
      {
        ...roleReadiness[0],
        readinessPct: Math.round(scoreRun.readiness),
        summary: `${roleReadiness[0].summary} ScoreRun readiness ${Math.round(scoreRun.readiness)}% (from capability engine — Career does not assign capability).`,
      },
      ...roleReadiness.slice(1),
    ];
  }

  const topRole = roleReadiness[0] ?? null;
  const roadmap = scoreRun
    ? [
        ...buildRoadmapFromScoreRunGaps(scoreRun),
        ...buildRoadmapFromReadiness(roleReadiness).filter(
          (a) => a.kind !== "experience_project",
        ),
      ]
    : buildRoadmapFromReadiness(roleReadiness);
  const opportunities = matchOpportunities(roleReadiness, profile.industries);

  const interviewPlan = buildInterviewPlan(
    profile.targetRole || topRole?.roleTitle || "Product role",
    evidence,
    topRole,
  );

  return {
    profile,
    roleReadiness,
    topRole,
    roadmap,
    opportunities,
    interviewPlan,
    portfolioEntryCount: portfolio.length,
    evidenceCount: ledger.length,
    capabilityAssigned: false,
    readinessSource,
    scoreRun,
  };
}

function parseScoreRunContext(
  row: {
    id: string;
    captured_at: string;
    score_run_id: string | null;
    profile: unknown;
  } | null,
): ScoreRunCareerContext | null {
  if (!row) return null;
  const profile = row.profile as {
    readiness?: number;
    strengths?: string[];
    gaps?: string[];
    recommendations?: Array<{ id?: string; title: string; rationale?: string }>;
  } | null;
  if (!profile || typeof profile.readiness !== "number") return null;
  return {
    snapshotId: row.id,
    scoreRunId: row.score_run_id,
    capturedAt: row.captured_at,
    readiness: profile.readiness,
    strengths: Array.isArray(profile.strengths) ? profile.strengths : [],
    gaps: Array.isArray(profile.gaps) ? profile.gaps : [],
    recommendations: Array.isArray(profile.recommendations)
      ? profile.recommendations.map((r) => ({
          id: r.id,
          title: r.title,
          rationale: r.rationale,
        }))
      : [],
  };
}
