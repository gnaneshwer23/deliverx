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
import { getPortfolioSnapshot, listProjectsForOrg, resolveDefaultPortfolio } from "./portfolio";
import { loadProjectSignals } from "./projectSignals";
import {
  computeProjectHealth,
  computeDeliveryConfidence,
} from "./intelligenceEngine";

export type UserRole = "pm" | "team_member" | "executive" | "ba" | "product_manager" | "engineer" | "scrum_master" | "qa";

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

async function safeDashboardLoad<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[dashboard] ${label}`, err);
    return fallback;
  }
}

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

const EMPTY_GOVERNANCE: WorkspaceDashboardData["governance"] = {
  openRisks: 0,
  openIssues: 0,
  pendingDecisions: 0,
  openChanges: 0,
};

export const EMPTY_WORKSPACE_DASHBOARD: WorkspaceDashboardData = {
  userName: null,
  userRole: "pm",
  orgName: null,
  delivery: {
    tasksInProgress: 0,
    teamMembers: 0,
    overdueTasks: 0,
    blockedTasks: 0,
    standupsThisWeek: 0,
  },
  governance: EMPTY_GOVERNANCE,
  portfolioHealth: null,
  activeProjectCount: 0,
  projectHealth: [],
  weeklyVelocity: [],
  recentTasks: [],
  openRisks: [],
  pendingDecisions: [],
  recentMeetings: [],
  recentStandups: [],
  recentReports: [],
  governanceRollup: [],
  recentProjects: [],
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

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("name, role, organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  const [
    activeProjectCount,
    recentProjects,
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
    safeDashboardLoad("activeProjectCount", async () => {
      const { count, error } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .in("status", ["draft", "active"]);
      if (error) throw error;
      return count ?? 0;
    }, 0),
    safeDashboardLoad("recentProjects", async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, delivery_type, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    }, []),
    safeDashboardLoad("deliveryStats", getOrgDeliveryStats, {
      tasksInProgress: 0,
      teamMembers: 0,
    }),
    safeDashboardLoad("taskCounts", () => getTaskCounts(supabase), {
      overdueTasks: 0,
      blockedTasks: 0,
    }),
    safeDashboardLoad("governance", getOrgGovernanceStats, EMPTY_GOVERNANCE),
    safeDashboardLoad("recentTasks", () => listOrgTasks({ limit: 10 }), []),
    safeDashboardLoad("openRisks", () => listOpenRaidOrg(8), []),
    safeDashboardLoad("pendingDecisions", () => listOrgDecisionsPending(6), []),
    safeDashboardLoad("recentMeetings", () => listOrgMeetingsRecent(6), []),
    safeDashboardLoad("recentStandups", () => listOrgStandupsRecent(7, 8), []),
    safeDashboardLoad("recentReports", () => listOrgReports(4), []),
    safeDashboardLoad("governanceRollup", getGovernanceRollup, []),
    safeDashboardLoad("weeklyVelocity", () => getWeeklyVelocity(supabase), []),
    safeDashboardLoad("projectHealth", buildProjectHealthSummaries, []),
    safeDashboardLoad("portfolio", resolveDefaultPortfolio, null),
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

  let orgName: string | null = null;
  if (profile?.organisation_id) {
    const { data: org } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", profile.organisation_id)
      .maybeSingle();
    orgName = org?.name ?? null;
  }

  return {
    userName: profile?.name ?? user.email?.split("@")[0] ?? null,
    userRole: (profile?.role as UserRole) ?? "pm",
    orgName,
    delivery: {
      tasksInProgress: deliveryStats.tasksInProgress,
      teamMembers: deliveryStats.teamMembers,
      overdueTasks: taskCounts.overdueTasks,
      blockedTasks: taskCounts.blockedTasks,
      standupsThisWeek: recentStandups.length,
    },
    governance,
    portfolioHealth,
    activeProjectCount,
    projectHealth,
    weeklyVelocity,
    recentTasks,
    openRisks,
    pendingDecisions,
    recentMeetings,
    recentStandups,
    recentReports,
    governanceRollup,
    recentProjects,
  };
}
