/**
 * Engineer Mission Control dashboard aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import {
  buildEngineerCrossRoleImpact,
  buildEngineerGuidedTasks,
  buildEngineerStakeholders,
  defaultArchitectureNodes,
  mapRaidToDependencies,
  mapTraceRows,
  type CrossRoleEngineerImpact,
  type EngineerArchitectureNode,
  type EngineerDependencyRow,
  type EngineerGuidedTask,
  type EngineerStakeholderRow,
  type EngineerTraceRow,
} from "./engineerEngine";
import { getEngineerContext } from "./engineerContext";
import { buildTraceabilityMatrix, listApprovedUserStories } from "./baRequirements";
import { listRaidItems } from "./governance";
import { listProjectsForCurrentUser } from "./portfolio";
import type { TaskRow } from "./delivery";
import {
  buildHealthFromCi,
  computePrDashboardStats,
  getGitHubProjectSnapshot,
  type ExternalTaskLinkRow,
  type GitHubProjectSnapshot,
} from "./githubIntegration";
import { summarizeCiFromWorkflows } from "./githubIntegrationEngine";
import { mergeProjectImpactIntoCrossRole } from "./deliveryImpact";

export type EngineerMissionControl = {
  userName: string | null;
  primaryProject: { id: string; name: string } | null;
  projects: Array<{ id: string; name: string; status: string }>;
  dataSources: { architecture: "live" | "fallback" };
  overview: {
    assignedStories: number;
    blockedStories: number;
    openPrs: number;
    buildHealth: "green" | "amber" | "red";
    sprintProgress: number;
    technicalDebt: string;
    deploymentRisk: string;
  };
  aiSummary: string;
  guidedTasks: EngineerGuidedTask[];
  traceability: EngineerTraceRow[];
  architecture: EngineerArchitectureNode[];
  dependencies: EngineerDependencyRow[];
  dependencyInsight: string;
  apiContracts: Array<{ endpoint: string; method: string; permissions: string[] }>;
  cicd: {
    buildStatus: string;
    deployment: string;
    testCoverage: number;
    failedTests: number;
    lastDeployment: string;
  };
  prDashboard: {
    openPrs: number;
    reviewsRequired: number;
    avgReviewHours: number;
  };
  technicalDebt: {
    openItems: number;
    outdatedLibraries: number;
    refactorCandidates: number;
    securityRisks: number;
    recommendation: string;
  };
  stakeholders: EngineerStakeholderRow[];
  crossRoleImpact: CrossRoleEngineerImpact[];
  specialisation: string | null;
  techStack: Record<string, string[]>;
  extractionStatus: string;
  github: {
    configured: boolean;
    lastSyncAt: string | null;
    openPullRequests: ExternalTaskLinkRow[];
  };
};

export async function getEngineerMissionControl(
  projectId?: string,
): Promise<EngineerMissionControl> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .maybeSingle();

  const projects = await listProjectsForCurrentUser().catch(() => []);
  const active = projects.filter((p) => p.status === "active");
  const primary =
    active.find((p) => p.id === projectId) ?? active[0] ?? projects[0] ?? null;

  const ctx = await getEngineerContext().catch(() => null);
  const plan = (ctx?.engineering_plan ?? {}) as Record<string, unknown>;

  const aiSummary =
    ctx?.ai_summary ??
    "Set your specialisation and stack, then run AI workspace generation to populate guided tasks and traceability.";
  let stories: Awaited<ReturnType<typeof listApprovedUserStories>> = [];
  let assignedTasks: TaskRow[] = [];
  let authApiBlockedTask: { id: string; title: string } | null = null;
  let traceability: EngineerTraceRow[] = [];
  let dependencies: EngineerDependencyRow[] = Array.isArray(plan.dependencies)
    ? (plan.dependencies as EngineerDependencyRow[])
    : [];

  if (primary && user) {
    const [storyRows, taskRes, projectBlockedRes, matrix, raid] = await Promise.all([
      listApprovedUserStories(primary.id).catch(() => []),
      supabase
        .from("tasks")
        .select("*")
        .eq("project_id", primary.id)
        .eq("assignee_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50),
      supabase
        .from("tasks")
        .select("id, title, status, blocked_reason")
        .eq("project_id", primary.id)
        .eq("status", "blocked")
        .or("blocked_reason.ilike.%Auth API%,title.ilike.%Auth API%")
        .limit(1)
        .maybeSingle(),
      buildTraceabilityMatrix(primary.id).catch(() => []),
      listRaidItems(primary.id).catch(() => []),
    ]);

    stories = storyRows;
    assignedTasks = (taskRes.data ?? []) as TaskRow[];
    if (projectBlockedRes.data) {
      authApiBlockedTask = {
        id: String(projectBlockedRes.data.id),
        title: String(projectBlockedRes.data.title),
      };
    }
    traceability = mapTraceRows(matrix);

    const raidDependencies = mapRaidToDependencies(raid);
    if (raidDependencies.length > 0) {
      dependencies = raidDependencies;
    }
  }

  const storedTasks = Array.isArray(plan.guidedTasks)
    ? (plan.guidedTasks as EngineerGuidedTask[]).map((t, i) => ({
        ...t,
        id: t.id ?? `stored-${i}`,
      }))
    : [];

  const blockedTasks = assignedTasks.filter((t) => t.status === "blocked");
  const doneTasks = assignedTasks.filter((t) => t.status === "done");
  const sprintProgress =
    assignedTasks.length > 0
      ? Math.round((doneTasks.length / assignedTasks.length) * 100)
      : 0;

  const storiesInProgress = stories.filter(
    (s) => s.status === "in_progress" || s.status === "ready",
  ).length;
  const blockedStories = stories.filter((s) => s.status === "blocked").length;

  const dependencyInsight =
    (plan.impactInsight as string) ??
    (dependencies.some((d) => d.status === "Delayed")
      ? `${dependencies.filter((d) => d.status === "Delayed").length} dependencies delayed — may impact downstream stories.`
      : blockedTasks.length > 0
        ? `${blockedTasks.length} blocked task${blockedTasks.length === 1 ? "" : "s"} in your queue.`
        : dependencies.length > 0
          ? `${dependencies.length} active dependencies tracked from RAID.`
          : "No blocking dependencies from delivery signals.");

  const architecture = Array.isArray(plan.architectureNotes)
    ? (plan.architectureNotes as EngineerArchitectureNode[])
    : defaultArchitectureNodes(ctx?.tech_stack);
  const architectureSource: "live" | "fallback" = Array.isArray(plan.architectureNotes) ? "live" : "fallback";

  const apiContracts = Array.isArray(plan.apiContracts)
    ? (plan.apiContracts as Array<{
        endpoint: string;
        method: string;
        permissions: string[];
      }>)
    : [];

  const debtRaw = (plan.technicalDebt ?? {}) as EngineerMissionControl["technicalDebt"];
  const hasDebtData =
    debtRaw.openItems != null ||
    debtRaw.outdatedLibraries != null ||
    debtRaw.refactorCandidates != null ||
    debtRaw.securityRisks != null;
  const technicalDebt = {
    openItems: debtRaw.openItems ?? 0,
    outdatedLibraries: debtRaw.outdatedLibraries ?? 0,
    refactorCandidates: debtRaw.refactorCandidates ?? 0,
    securityRisks: debtRaw.securityRisks ?? 0,
    recommendation:
      (debtRaw.recommendation as string | undefined) ??
      (hasDebtData ? "Review technical debt backlog." : "Run engineering analysis for debt signals."),
  };

  const cicdRaw = (plan.cicd ?? {}) as Record<string, unknown>;
  const buildFailed = cicdRaw.buildStatus === "failed";

  let githubSnapshot: GitHubProjectSnapshot = {
    configured: false,
    openPullRequests: [],
    ci: summarizeCiFromWorkflows([]),
    openPrCount: 0,
    lastSyncAt: null,
  };

  if (primary) {
    githubSnapshot = await getGitHubProjectSnapshot(primary.id).catch(() => githubSnapshot);
  }

  const useGitHub = githubSnapshot.configured;
  const hasPlanCicd =
    cicdRaw.buildStatus != null ||
    cicdRaw.deployment != null ||
    cicdRaw.testCoverage != null ||
    cicdRaw.failedTests != null ||
    cicdRaw.lastDeployment != null;
  const cicd = useGitHub
    ? {
        buildStatus: githubSnapshot.ci.buildStatus,
        deployment: githubSnapshot.ci.deployment,
        testCoverage: githubSnapshot.ci.testCoverage ?? 0,
        failedTests: githubSnapshot.ci.failedTests,
        lastDeployment: githubSnapshot.ci.lastDeployment,
      }
    : hasPlanCicd
      ? {
          buildStatus: buildFailed ? "Failed" : String(cicdRaw.buildStatus ?? "Unknown"),
          deployment: String(cicdRaw.deployment ?? "—"),
          testCoverage: (cicdRaw.testCoverage as number) ?? 0,
          failedTests: (cicdRaw.failedTests as number) ?? 0,
          lastDeployment: String(cicdRaw.lastDeployment ?? "—"),
        }
      : {
          buildStatus: "—",
          deployment: "—",
          testCoverage: 0,
          failedTests: 0,
          lastDeployment: "—",
        };

  const prStats = useGitHub
    ? computePrDashboardStats(githubSnapshot.openPullRequests)
    : { openPrs: 0, reviewsRequired: 0, avgReviewHours: 0 };

  const openPrs = prStats.openPrs;
  const buildHealth: "green" | "amber" | "red" = useGitHub
    ? buildHealthFromCi(githubSnapshot.ci, openPrs, blockedTasks.length)
    : buildFailed
      ? "red"
      : blockedTasks.length > 0
        ? "amber"
        : hasPlanCicd
          ? "green"
          : "amber";

  let crossRoleImpact = buildEngineerCrossRoleImpact({
    blockedTasks: blockedTasks.length,
    storiesInProgress,
    openPrs,
  });

  if (primary) {
    crossRoleImpact = await mergeProjectImpactIntoCrossRole(crossRoleImpact, primary.id);
  }

  return {
    userName: profile?.name ?? user?.email ?? null,
    primaryProject: primary ? { id: primary.id, name: primary.name } : null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status ?? "active",
    })),
    dataSources: { architecture: architectureSource },
    overview: {
      assignedStories: assignedTasks.length,
      blockedStories: blockedStories || blockedTasks.length,
      openPrs,
      buildHealth,
      sprintProgress,
      technicalDebt:
        technicalDebt.openItems === 0
          ? "—"
          : technicalDebt.openItems > 10
            ? "Medium"
            : "Low",
      deploymentRisk:
        !useGitHub && !hasPlanCicd
          ? "—"
          : buildHealth === "green"
            ? "Low"
            : "Medium",
    },
    aiSummary,
    guidedTasks: buildEngineerGuidedTasks({
      stored: storedTasks,
      assignedTasks: assignedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        blocked_reason: t.blocked_reason,
        due_date: t.due_date,
      })),
      blockedCount: blockedTasks.length,
      authApiBlockedTask,
    }),
    traceability,
    architecture,
    dependencies,
    dependencyInsight,
    apiContracts,
    cicd,
    prDashboard: {
      openPrs,
      reviewsRequired: prStats.reviewsRequired,
      avgReviewHours: prStats.avgReviewHours,
    },
    technicalDebt,
    stakeholders: buildEngineerStakeholders(),
    crossRoleImpact,
    specialisation: ctx?.specialisation ?? null,
    techStack: ctx?.tech_stack ?? {},
    extractionStatus: ctx?.extraction_status ?? "pending",
    github: {
      configured: githubSnapshot.configured,
      lastSyncAt: githubSnapshot.lastSyncAt,
      openPullRequests: githubSnapshot.openPullRequests,
    },
  };
}
