/**
 * Intelligence loop façade — loads org telemetry and composes the closed loop.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTwinStateForOrg } from "./twin";
import {
  buildIntelligenceLoopSnapshot,
  type IntelligenceLoopInput,
  type IntelligenceLoopSnapshot,
} from "./intelligenceLoopEngine";

export type { IntelligenceLoopSnapshot };

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");
  return { supabase, orgId: profile.organisation_id as string };
}

async function countAgentRuns24h(
  supabase: SupabaseClient,
  orgId: string,
  since24h: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("agent_workflow_runs")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .gte("started_at", since24h);

  if (error) {
    if (error.code === "42P01") return 0;
    return 0;
  }
  return count ?? 0;
}

async function countAgentInsights24h(
  supabase: SupabaseClient,
  orgId: string,
  since24h: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("agent_activity_events")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .eq("event_type", "insight")
    .gte("created_at", since24h);

  if (error) {
    if (error.code === "42P01") return 0;
    return 0;
  }
  return count ?? 0;
}

async function countOpenTasks(
  supabase: SupabaseClient,
  projectIds: string[],
): Promise<number> {
  if (projectIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .in("project_id", projectIds)
    .neq("status", "done");

  if (error) {
    if (error.code === "42P01") return 0;
    return 0;
  }
  return count ?? 0;
}

async function countTraceLinks(
  supabase: SupabaseClient,
  projectIds: string[],
): Promise<number> {
  if (projectIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("requirement_trace_links")
    .select("id", { count: "exact", head: true })
    .in("project_id", projectIds);

  if (error) {
    if (error.code === "42P01") return 0;
    return 0;
  }
  return count ?? 0;
}

async function loadLatestForecastConfidence(
  supabase: SupabaseClient,
  orgId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("delivery_forecasts")
    .select("confidence")
    .eq("organisation_id", orgId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return null;
    return null;
  }

  return data?.confidence != null ? Number(data.confidence) : null;
}

async function loadLearningMetrics(
  supabase: SupabaseClient,
  orgId: string,
): Promise<{
  lessonsCaptured: number;
  proposalQualityAvg: number | null;
  estimateVarianceRows: number;
}> {
  const [lessonsRes, varianceRes, qualityRes] = await Promise.all([
    supabase
      .from("structured_lessons")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId),
    supabase
      .from("estimate_variance_records")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId),
    supabase
      .from("proposal_quality_scores")
      .select("quality_score")
      .eq("organisation_id", orgId)
      .limit(100),
  ]);

  const scores = (qualityRes.data ?? []).map((row) => Number(row.quality_score));
  const proposalQualityAvg =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;

  return {
    lessonsCaptured: lessonsRes.count ?? 0,
    estimateVarianceRows: varianceRes.count ?? 0,
    proposalQualityAvg,
  };
}

export async function loadIntelligenceLoopInput(
  orgId: string,
  supabase: SupabaseClient,
): Promise<IntelligenceLoopInput> {
  const since24h = new Date(Date.now() - 86_400_000).toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const { data: activeProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("status", "active");

  const projectIds = (activeProjects ?? []).map((p) => String(p.id));

  const [
    openTasks,
    standupsToday,
    meetingsWithNotes,
    traceLinkCount,
    agentRunsLast24h,
    agentInsightsLast24h,
    pendingProposals,
    pendingArtifacts,
    learning,
    forecastConfidence,
    twinState,
  ] = await Promise.all([
    countOpenTasks(supabase, projectIds),
    supabase
      .from("standups")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("standup_date", today)
      .then(({ count, error }) => (error?.code === "42P01" || error ? 0 : (count ?? 0))),
    supabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .not("notes", "is", null)
      .then(({ count, error }) => (error?.code === "42P01" || error ? 0 : (count ?? 0))),
    countTraceLinks(supabase, projectIds),
    countAgentRuns24h(supabase, orgId, since24h),
    countAgentInsights24h(supabase, orgId, since24h),
    supabase
      .from("proposed_actions")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("status", "pending")
      .then(({ count, error }) => (error?.code === "42P01" || error ? 0 : (count ?? 0))),
    supabase
      .from("artifact_reviews")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("status", "needs_review")
      .then(({ count, error }) => (error?.code === "42P01" || error ? 0 : (count ?? 0))),
    loadLearningMetrics(supabase, orgId),
    loadLatestForecastConfidence(supabase, orgId),
    getTwinStateForOrg(orgId, supabase).catch(() => null),
  ]);

  return {
    activeProjectCount: projectIds.length,
    standupsToday,
    meetingsWithNotes,
    openTasks,
    ragMemoryHits: learning.lessonsCaptured,
    traceLinkCount,
    twinPortfolioHealth: twinState?.portfolio.health ?? null,
    forecastConfidence,
    agentRunsLast24h,
    agentInsightsLast24h,
    pendingProposals,
    pendingApprovals: pendingProposals + pendingArtifacts,
    lessonsCaptured: learning.lessonsCaptured,
    proposalQualityAvg: learning.proposalQualityAvg,
    estimateVarianceRows: learning.estimateVarianceRows,
  };
}

export async function getIntelligenceLoopSnapshot(): Promise<IntelligenceLoopSnapshot> {
  const { supabase, orgId } = await getOrgContext();
  const input = await loadIntelligenceLoopInput(orgId, supabase);
  return buildIntelligenceLoopSnapshot(input);
}

export async function getIntelligenceLoopSnapshotForOrg(
  orgId: string,
): Promise<IntelligenceLoopSnapshot> {
  const admin = createAdminClient();
  const input = await loadIntelligenceLoopInput(orgId, admin);
  return buildIntelligenceLoopSnapshot(input);
}
