import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadRecentSnapshotClaims,
  projectRoleReadinessFromClaims,
  toScoreRunCareerContext,
} from "@/lib/capability-engine/snapshot-claims";
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
  RoleReadinessResult,
} from "@/lib/career-intelligence/types";
import { listPortfolioEntries } from "@/lib/verified-portfolio/store";
import { listUserEvidenceForPortfolio } from "@/lib/verified-portfolio/store";
import { deriveEvidenceStrength } from "@/lib/verified-portfolio/types";
import { loadOutcomeContext } from "@/lib/real-world-outcomes/persist";
import {
  outcomeNarrativeFragment,
  reprioritiseRoadmapFromOutcomes,
  summariseOutcomes,
} from "@/lib/real-world-outcomes";

/**
 * Load PI + VPP + ledger + latest ScoreRun context for Career Intelligence.
 * Read-only toward capability — never persists capability scores.
 * Prefer SnapshotClaims for every catalogue role; heuristic is labelled coverage only.
 */
export async function buildCareerIntelligenceSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<CareerIntelligenceSnapshot> {
  const [{ data: pi }, { data: lpProfile }, portfolio, ledger, snapshotPack, outcomeCtx] =
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
      loadRecentSnapshotClaims(supabase, userId, 1),
      loadOutcomeContext(supabase, userId).catch(() => ({ events: [], findings: [] })),
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
  const claims = snapshotPack.latest;
  const scoreRun = claims ? toScoreRunCareerContext(claims) : null;
  const readinessSource = scoreRun
    ? ("score_run" as const)
    : ("evidence_coverage_heuristic" as const);

  const heuristicRoles = catalogue
    .map((role) => scoreRoleReadiness(role, evidence, profile.source !== "none"))
    .sort((a, b) => b.readinessPct - a.readinessPct);

  let roleReadiness: RoleReadinessResult[];

  if (claims && scoreRun) {
    const projected: RoleReadinessResult[] = [];
    const fallback: RoleReadinessResult[] = [];
    for (const role of catalogue) {
      const fromClaims = projectRoleReadinessFromClaims(role, claims);
      if (fromClaims) {
        projected.push(fromClaims);
      } else {
        const heuristic = scoreRoleReadiness(role, evidence, profile.source !== "none");
        fallback.push({
          ...heuristic,
          summary: `${heuristic.summary} Suppressed thin ScoreRun projection — showing evidence coverage only.`,
          readinessKind: "evidence_coverage",
        });
      }
    }
    roleReadiness = [...projected, ...fallback].sort(
      (a, b) => b.readinessPct - a.readinessPct,
    );
  } else {
    roleReadiness = heuristicRoles;
  }

  const topRole = roleReadiness[0] ?? null;
  const baseRoadmap = scoreRun
    ? [
        ...buildRoadmapFromScoreRunGaps(scoreRun),
        ...buildRoadmapFromReadiness(roleReadiness).filter(
          (a) => a.kind !== "experience_project",
        ),
      ]
    : buildRoadmapFromReadiness(roleReadiness);
  // Phase 7: prioritise evidence gaps implicated by real-world outcomes (e.g. rejections).
  // This reorders recommendations only — capability levels are never changed here.
  const openFindings = outcomeCtx.findings.filter((f) => f.status !== "dismissed");
  const roadmap = reprioritiseRoadmapFromOutcomes(baseRoadmap, openFindings);
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
    outcomes: buildCareerOutcomeContext(outcomeCtx),
  };
}

function buildCareerOutcomeContext(outcomeCtx: {
  events: Awaited<ReturnType<typeof loadOutcomeContext>>["events"];
  findings: Awaited<ReturnType<typeof loadOutcomeContext>>["findings"];
}): CareerIntelligenceSnapshot["outcomes"] {
  const summary = summariseOutcomes(outcomeCtx.events);
  return {
    total: summary.total,
    applications: summary.applications,
    interviews: summary.interviews,
    offers: summary.offers,
    rejections: summary.rejections,
    calibration: outcomeCtx.findings
      .filter((f) => f.status !== "dismissed")
      .map((f) => ({
        findingType: f.findingType,
        severity: f.severity,
        title: f.title,
        detail: f.detail,
        implicatedGaps: f.implicatedGaps,
        metrics: f.metrics,
        diagnosticOnly: true as const,
        capabilityAssigned: false as const,
      })),
    narrative: outcomeNarrativeFragment(outcomeCtx.events),
    capabilityAssigned: false,
  };
}
