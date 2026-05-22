/**
 * Workspace dashboard aggregator — pulls live data from delivery,
 * governance, portfolio, and traceability services into one PM view.
 */

import { createClient } from "@/lib/supabase/server";
import { getOrgDeliveryStats, listOrgTasks } from "./delivery";
import {
  getOrgGovernanceStats,
  getGovernanceRollup,
  listOpenRaidOrg,
  listOrgMeetingsRecent,
  listOrgDecisionsPending,
  listOrgReports,
} from "./governance";
import { listOrgStandupsRecent } from "./traceability";
import { getDefaultPortfolio, getPortfolioSnapshot, listProjectsForOrg } from "./portfolio";
import { loadProjectSignals } from "./projectSignals";
import {
  computeProjectHealth,
  computeDeliveryConfidence,
} from "./intelligenceEngine";

export type UserRole = "pm" | "team_member" | "executive";

export type ProjectHealthSummary = {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  healthTier: "healthy" | "watch" | "at-risk";
  confidenceScore: number;
  openRisks: number;
  blockers: number;
  overdueTasks: number;
};

export type WeeklyVelocity = {
  label: string;
  completed: number;
};

export type WorkspaceDashboardData = {
  userName: string | null;
  userRole: UserRole;
  orgName: string | null;
  delivery: {
    tasksInProgress: number;
    teamMembers: number;
    overdueTasks: number;
    blockedTasks: number;
    standupsThisWeek: number;
  };
  governance: Awaited<ReturnType<typeof getOrgGovernanceStats>>;
  portfolioHealth: number | null;
  activeProjectCount: number;
  projectHealth: ProjectHealthSummary[];
  weeklyVelocity: WeeklyVelocity[];
  recentTasks: Awaited<ReturnType<typeof listOrgTasks>>;
  openRisks: Awaited<ReturnType<typeof listOpenRaidOrg>>;
  pendingDecisions: Awaited<ReturnType<typeof listOrgDecisionsPending>>;
  recentMeetings: Awaited<ReturnType<typeof listOrgMeetingsRecent>>;
  recentStandups: Awaited<ReturnType<typeof listOrgStandupsRecent>>;
  recentReports: Awaited<ReturnType<typeof listOrgReports>>;
  governanceRollup: Awaited<ReturnType<typeof getGovernanceRollup>>;
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    delivery_type: string | null;
    created_at: string;
  }>;
};

function weekLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    labels.push(
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    );
  }
  return labels;
}

async function getTaskCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [overdue, blocked] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .neq("status", "done")
      .lt("due_date", new Date().toISOString().slice(0, 10)),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "blocked"),
  ]);

  return {
    overdueTasks: overdue.count ?? 0,
    blockedTasks: blocked.count ?? 0,
  };
}

async function getWeeklyVelocity(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<WeeklyVelocity[]> {
  const since = new Date();
  since.setDate(since.getDate() - 28);

  const { data, error } = await supabase
    .from("tasks")
    .select("completed_at")
    .eq("status", "done")
    .gte("completed_at", since.toISOString());

  if (error) throw error;

  const labels = weekLabels(4);
  const buckets = [0, 0, 0, 0];
  const now = Date.now();

  for (const row of data ?? []) {
    if (!row.completed_at) continue;
    const age = now - new Date(row.completed_at as string).getTime();
    const weekIndex = 3 - Math.min(3, Math.floor(age / (7 * 24 * 60 * 60 * 1000)));
    buckets[weekIndex]++;
  }

  return labels.map((label, i) => ({ label, completed: buckets[i] }));
}

async function buildProjectHealthSummaries(): Promise<ProjectHealthSummary[]> {
  const projects = await listProjectsForOrg();
  const active = projects.filter((p) => p.status === "active" || p.status === "draft").slice(0, 8);

  return Promise.all(
    active.map(async (p) => {
      const signals = await loadProjectSignals(p.id);
      const health = computeProjectHealth(signals);
      const confidence = computeDeliveryConfidence(signals);
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        healthScore: health.score,
        healthTier: health.tier,
        confidenceScore: confidence.score,
        openRisks: signals.risks,
        blockers: signals.blockers,
        overdueTasks: signals.overdueTasks,
      };
    }),
  );
}

export async function getWorkspaceDashboard(): Promise<WorkspaceDashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, organisation_id, organisations(name)")
    .eq("id", user.id)
    .single();

  const [
    { count: activeProjectCount },
    { data: recentProjects },
    deliveryStats,
    taskCounts,
    governance,
    recentTasks,
    openRisks,
    pendingDecisions,
    recentMeetings,
    recentStandups,
    recentReports,
    governanceRollup,
    weeklyVelocity,
    projectHealth,
    portfolio,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "active"]),
    supabase
      .from("projects")
      .select("id, name, status, delivery_type, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    getOrgDeliveryStats(),
    getTaskCounts(supabase),
    getOrgGovernanceStats(),
    listOrgTasks({ limit: 10 }),
    listOpenRaidOrg(8),
    listOrgDecisionsPending(6),
    listOrgMeetingsRecent(6),
    listOrgStandupsRecent(7, 8),
    listOrgReports(4),
    getGovernanceRollup(),
    getWeeklyVelocity(supabase),
    buildProjectHealthSummaries(),
    getDefaultPortfolio(),
  ]);

  let portfolioHealth: number | null = null;
  if (portfolio) {
    try {
      const { snapshot } = await getPortfolioSnapshot(portfolio.id);
      portfolioHealth = snapshot.health;
    } catch {
      portfolioHealth = null;
    }
  }

  const org = profile?.organisations as { name?: string } | null;

  return {
    userName: profile?.name ?? user.email?.split("@")[0] ?? null,
    userRole: (profile?.role as UserRole) ?? "pm",
    orgName: org?.name ?? null,
    delivery: {
      tasksInProgress: deliveryStats.tasksInProgress,
      teamMembers: deliveryStats.teamMembers,
      overdueTasks: taskCounts.overdueTasks,
      blockedTasks: taskCounts.blockedTasks,
      standupsThisWeek: recentStandups.length,
    },
    governance,
    portfolioHealth,
    activeProjectCount: activeProjectCount ?? 0,
    projectHealth,
    weeklyVelocity,
    recentTasks,
    openRisks,
    pendingDecisions,
    recentMeetings,
    recentStandups,
    recentReports,
    governanceRollup,
    recentProjects: recentProjects ?? [],
  };
}
