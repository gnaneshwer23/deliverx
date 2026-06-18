/**
 * Intelligence loop façade — loads org telemetry and composes the closed loop.
 */

import { createClient } from "@/lib/supabase/server";
import { getPendingApprovalCounts } from "./approvalCentre";
import { countPendingProposals } from "./proposedActions";
import { getContinuousLearningSnapshot } from "./continuousLearning";
import { runEnterpriseLoop } from "./twin";
import { listProjectForecasts } from "./deliveryForecast";
import {
  buildIntelligenceLoopSnapshot,
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
  supabase: Awaited<ReturnType<typeof createClient>>,
  since24h: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("agent_workflow_runs")
    .select("id", { count: "exact", head: true })
    .gte("started_at", since24h);

  if (error) {
    if (error.code === "42P01") return 0;
    return 0;
  }
  return count ?? 0;
}

async function countAgentInsights24h(
  supabase: Awaited<ReturnType<typeof createClient>>,
  since24h: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("agent_activity_events")
    .select("id", { count: "exact", head: true })
    .eq("event_type", "insight")
    .gte("created_at", since24h);

  if (error) {
    if (error.code === "42P01") return 0;
    return 0;
  }
  return count ?? 0;
}

export async function getIntelligenceLoopSnapshot(): Promise<IntelligenceLoopSnapshot> {
  const { supabase } = await getOrgContext();
  const since24h = new Date(Date.now() - 86_400_000).toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const [
    activeProjectsRes,
    openTasksRes,
    standupsRes,
    meetingsRes,
    traceRes,
    agentRunsRes,
    agentInsightsRes,
    approvals,
    pendingProposals,
    learning,
    twinBundle,
  ] = await Promise.all([
    supabase.from("projects").select("id, name, status").eq("status", "active"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .neq("status", "done"),
    supabase
      .from("standups")
      .select("id", { count: "exact", head: true })
      .eq("standup_date", today),
    supabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .not("notes", "is", null),
    supabase
      .from("requirement_trace_links")
      .select("id", { count: "exact", head: true }),
    countAgentRuns24h(supabase, since24h),
    countAgentInsights24h(supabase, since24h),
    getPendingApprovalCounts().catch(() => ({ proposals: 0, artifacts: 0, total: 0 })),
    countPendingProposals().catch(() => 0),
    getContinuousLearningSnapshot().catch(() => null),
    runEnterpriseLoop().catch(() => null),
  ]);

  const activeProjects = activeProjectsRes.data ?? [];
  const forecasts = await listProjectForecasts(
    activeProjects.map((p) => ({
      id: String(p.id),
      name: String(p.name),
      healthTier: "watch" as const,
    })),
    3,
  ).catch(() => []);

  const topForecast = forecasts[0]?.forecast;
  const forecastConfidence =
    topForecast?.confidence != null ? Number(topForecast.confidence) : null;

  return buildIntelligenceLoopSnapshot({
    activeProjectCount: activeProjects.length,
    standupsToday: standupsRes.count ?? 0,
    meetingsWithNotes: meetingsRes.count ?? 0,
    openTasks: openTasksRes.count ?? 0,
    ragMemoryHits: learning?.structuredLessons.length ?? 0,
    traceLinkCount: traceRes.count ?? 0,
    twinPortfolioHealth: twinBundle?.state.portfolio.health ?? null,
    forecastConfidence,
    agentRunsLast24h: agentRunsRes,
    agentInsightsLast24h: agentInsightsRes,
    pendingProposals,
    pendingApprovals: approvals.total,
    lessonsCaptured: learning?.structuredLessons.length ?? 0,
    proposalQualityAvg: learning?.proposalQuality.averageScore ?? null,
    estimateVarianceRows: learning?.estimateVariance.length ?? 0,
  });
}
