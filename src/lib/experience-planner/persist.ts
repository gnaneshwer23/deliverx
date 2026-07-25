/**
 * Persist / load Experience plans. Planner never writes capability levels.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { scenarioBySlug } from "@/lib/experience-planner/catalog";
import { planExperienceFromGaps } from "@/lib/experience-planner/plan";
import type {
  ExperienceIndustry,
  ExperiencePlanRecommendation,
  ExperiencePlanRecord,
  PlanFromGapsInput,
  RankedGap,
} from "@/lib/experience-planner/types";
import { loadRecentSnapshotClaims } from "@/lib/capability-engine/snapshot-claims";

type PlanRow = {
  id: string;
  status: string;
  scenario_slug: string;
  emphasis: string;
  target_role: string | null;
  target_seniority: string | null;
  snapshot_id: string | null;
  score_run_id: string | null;
  framework_version_id: string | null;
  ranked_gaps: unknown;
  targeted_competencies: string[] | null;
  rationale: string;
  evidence_links: unknown;
  enrolment_id: string | null;
  planner_version: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

function rowToRecord(row: PlanRow): ExperiencePlanRecord {
  const scenario = scenarioBySlug(row.scenario_slug);
  const rankedGaps = (Array.isArray(row.ranked_gaps)
    ? row.ranked_gaps
    : []) as RankedGap[];
  const evidenceLinks = (Array.isArray(row.evidence_links)
    ? row.evidence_links
    : []) as ExperiencePlanRecommendation["evidenceLinks"];
  const emphasis = row.emphasis as ExperiencePlanRecommendation["emphasis"];
  const meta = row.metadata ?? {};
  const preferredIndustries = Array.isArray(meta.preferredIndustries)
    ? (meta.preferredIndustries as string[])
    : [];
  return {
    id: row.id,
    status: row.status as ExperiencePlanRecord["status"],
    createdAt: row.created_at,
    enrolmentId: row.enrolment_id,
    scenarioSlug: row.scenario_slug,
    emphasis,
    title: scenario?.title ?? row.scenario_slug,
    summary: scenario?.summary ?? "",
    coachingFocus: scenario?.coachingFocus ?? "",
    companyName: scenario?.companyName ?? "Experience",
    companyKey: scenario?.companyKey ?? "unknown",
    industry: (scenario?.industry ?? "saas") as ExperienceIndustry,
    projectName: scenario?.projectName ?? "",
    candidateRole: scenario?.candidateRole ?? "",
    problem: scenario?.problem ?? "",
    decisionEmphasis: scenario?.decisionEmphasis ?? [],
    targetedCompetencies: row.targeted_competencies ?? [],
    rankedGaps,
    rationale: row.rationale,
    evidenceLinks,
    href: `/experience/app?planId=${row.id}&scenario=${row.scenario_slug}&planEmphasis=${emphasis}`,
    targetRole: row.target_role,
    targetSeniority: row.target_seniority,
    preferredIndustries,
    snapshotId: row.snapshot_id,
    scoreRunId: row.score_run_id,
    frameworkVersionId: row.framework_version_id,
    plannerVersion: row.planner_version,
    capabilityAssigned: false,
  };
}

export async function loadActiveExperiencePlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<ExperiencePlanRecord | null> {
  const { data, error } = await supabase
    .from("experience_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Table may not exist yet in local envs mid-migration.
    console.warn("[experience-planner] loadActiveExperiencePlan", error.message);
    return null;
  }
  if (!data) return null;
  return rowToRecord(data as PlanRow);
}

export async function getExperiencePlanForUser(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
): Promise<ExperiencePlanRecord | null> {
  const { data, error } = await supabase
    .from("experience_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("id", planId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToRecord(data as PlanRow);
}

export async function buildPlanInputFromProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<PlanFromGapsInput> {
  const [{ data: pi }, pack] = await Promise.all([
    supabase
      .from("pi_onboarding_sessions")
      .select("payload")
      .eq("user_id", userId)
      .maybeSingle(),
    loadRecentSnapshotClaims(supabase, userId, 1),
  ]);

  const payload = (pi?.payload as Record<string, unknown>) ?? {};
  const claims = pack.latest;
  const evidenceRefs = (claims?.levels ?? [])
    .flatMap((l) => l.evidenceReferences)
    .slice(0, 12);

  const industriesRaw = payload.industries;
  const preferredIndustries: string[] = [];
  if (Array.isArray(industriesRaw)) {
    for (const item of industriesRaw) {
      if (typeof item === "string" && item.trim()) preferredIndustries.push(item.trim());
    }
  }
  if (typeof payload.industry === "string" && payload.industry.trim()) {
    preferredIndustries.push(payload.industry.trim());
  }
  if (typeof payload.targetIndustry === "string" && payload.targetIndustry.trim()) {
    preferredIndustries.push(payload.targetIndustry.trim());
  }

  return {
    gaps: claims?.gaps ?? [],
    levels: (claims?.levels ?? []).map((l) => ({
      competencyId: l.competencyId,
      level: String(l.level),
      confidence: l.confidence,
    })),
    recommendations: claims?.recommendations ?? [],
    targetRole: (payload.targetRole as string) || null,
    targetSeniority: (payload.targetSeniority as string) || null,
    preferredIndustries: [...new Set(preferredIndustries)],
    snapshotId: claims?.snapshotId ?? null,
    scoreRunId: claims?.scoreRunId ?? null,
    frameworkVersionId: claims?.frameworkVersionId ?? null,
    evidenceRefs,
  };
}

export async function createOrRefreshExperiencePlan(
  supabase: SupabaseClient,
  userId: string,
  options?: { force?: boolean },
): Promise<{
  plan: ExperiencePlanRecord;
  recommendation: ExperiencePlanRecommendation;
  created: boolean;
  capabilityAssigned: false;
}> {
  if (!options?.force) {
    const existing = await loadActiveExperiencePlan(supabase, userId);
    if (existing) {
      return {
        plan: existing,
        recommendation: existing,
        created: false,
        capabilityAssigned: false,
      };
    }
  } else {
    await supabase
      .from("experience_plans")
      .update({ status: "superseded" })
      .eq("user_id", userId)
      .eq("status", "active");
  }

  const input = await buildPlanInputFromProfile(supabase, userId);
  const recommendation = planExperienceFromGaps(input);

  const { data: scenarioRow } = await supabase
    .from("experience_scenarios")
    .select("id")
    .eq("slug", recommendation.scenarioSlug)
    .maybeSingle();

  const { data, error } = await supabase
    .from("experience_plans")
    .insert({
      user_id: userId,
      status: "active",
      scenario_id: scenarioRow?.id ?? null,
      scenario_slug: recommendation.scenarioSlug,
      emphasis: recommendation.emphasis,
      target_role: recommendation.targetRole,
      target_seniority: recommendation.targetSeniority,
      snapshot_id: recommendation.snapshotId,
      score_run_id: recommendation.scoreRunId,
      framework_version_id: recommendation.frameworkVersionId,
      ranked_gaps: recommendation.rankedGaps,
      targeted_competencies: recommendation.targetedCompetencies,
      rationale: recommendation.rationale,
      evidence_links: recommendation.evidenceLinks,
      planner_version: recommendation.plannerVersion,
      metadata: {
        decisionEmphasis: recommendation.decisionEmphasis,
        coachingFocus: recommendation.coachingFocus,
        capabilityAssigned: false,
        companyName: recommendation.companyName,
        companyKey: recommendation.companyKey,
        industry: recommendation.industry,
        projectName: recommendation.projectName,
        problem: recommendation.problem,
        preferredIndustries: recommendation.preferredIndustries,
      },
    })
    .select("*")
    .single();

  if (error) throw error;

  const plan = rowToRecord(data as PlanRow);
  return {
    plan,
    recommendation,
    created: true,
    capabilityAssigned: false,
  };
}

export async function acceptExperiencePlan(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
  enrolmentId?: string | null,
): Promise<ExperiencePlanRecord | null> {
  const patch: Record<string, unknown> = {
    status: "accepted",
    accepted_at: new Date().toISOString(),
  };
  if (enrolmentId) patch.enrolment_id = enrolmentId;

  const { data, error } = await supabase
    .from("experience_plans")
    .update(patch)
    .eq("user_id", userId)
    .eq("id", planId)
    .select("*")
    .maybeSingle();

  if (error || !data) return null;
  return rowToRecord(data as PlanRow);
}
