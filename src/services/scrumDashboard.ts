/**
 * Scrum Mission Control dashboard aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import { getOrgCapacitySnapshot } from "./capacity";
import { getDeliveryForecast } from "./deliveryForecast";
import { listOrgTasks } from "./delivery";
import { mergeProjectImpactIntoCrossRole } from "./deliveryImpact";
import { listRaidItems } from "./governance";
import { listProjectsForCurrentUser } from "./portfolio";
import { getScrumContext } from "./scrumContext";
import {
  buildScrumCrossRoleImpact,
  buildScrumGuidedTasks,
  buildScrumStakeholders,
  buildImpedimentsFromSignals,
  aggregateStandupBlockers,
  computeAgileMaturityOverall,
  mapRaidToCrossTeamDeps,
  type AgileMaturityScores,
  type CrossRoleScrumImpact,
  type ScrumGuidedTask,
  type ScrumImpediment,
  type ScrumStakeholderRow,
} from "./scrumEngine";
import { listUserStories } from "./baRequirements";
import { loadProjectSprintMetrics } from "./sprintData";
import { listStandups } from "./traceability";
import type { ScrumBurndownPoint } from "@/lib/scrum-health-kpis";

export type ScrumMissionControl = {
  userName: string | null;
  primaryProject: { id: string; name: string } | null;
  projects: Array<{ id: string; name: string; status: string }>;
  dataSources: { velocity: "live" | "fallback"; burndown: "live" | "fallback" };
  burndownPoints: ScrumBurndownPoint[];
  overview: {
    sprintLabel: string;
    completionPct: number;
    daysRemaining: number;
    blockedStories: number;
    velocityTrend: string;
    teamHealth: string;
    burnoutRisk: string;
    sprintSuccessProbability: number;
  };
  aiSummary: string;
  guidedTasks: ScrumGuidedTask[];
  sprintHealth: {
    plannedPoints: number;
    completedPoints: number;
    completionRate: number;
    spilloverRisk: string;
    deliveryConfidence: number;
    prediction: string;
  };
  teamHealth: {
    happinessScore: number;
    meetingLoad: string;
    collaboration: string;
    burnoutRisk: string;
    workloadBalance: string;
    insight: string;
  };
  burnout: { risk: string; affectedTeam: string; recommendation: string };
  impediments: ScrumImpediment[];
  impedimentInsight: string;
  ceremonies: string[];
  standupSummary: { yesterday: string[]; today: string[]; blockers: string[] };
  velocity: Array<{ sprint: string; points: number }>;
  velocityInsight: string;
  capacity: {
    availableHours: number;
    allocatedHours: number;
    leaveImpactPct: number;
    bufferHours: number;
    recommendation: string;
  };
  crossTeamDeps: Array<{ team: string; dependency: string; status: string }>;
  retroThemes: string[];
  retroRecommendation: string;
  agileMaturity: AgileMaturityScores & { overall: number };
  stakeholders: ScrumStakeholderRow[];
  crossRoleImpact: CrossRoleScrumImpact[];
  extractionStatus: string;
};

export async function getScrumMissionControl(
  projectId?: string,
): Promise<ScrumMissionControl> {
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

  const ctx = await getScrumContext().catch(() => null);
  const plan = (ctx?.sprint_plan ?? {}) as Record<string, unknown>;

  let aiSummary =
    ctx?.ai_summary ??
    "Configure your agile framework and team, then run AI workspace generation.";
  let blockedCount = 0;
  let storiesCount = 0;
  let deliveryConfidence = 84;
  let projectTasks: Awaited<ReturnType<typeof listOrgTasks>> = [];
  let projectRaid: Awaited<ReturnType<typeof listRaidItems>> = [];
  let standups: Awaited<ReturnType<typeof listStandups>> = [];
  let sprintMetrics: Awaited<ReturnType<typeof loadProjectSprintMetrics>> | null = null;

  if (primary) {
    const [tasks, stories, raid, forecast, recentStandups, sprint] = await Promise.all([
      listOrgTasks({ projectId: primary.id, limit: 200 }).catch(() => []),
      listUserStories(primary.id).catch(() => []),
      listRaidItems(primary.id).catch(() => []),
      getDeliveryForecast(primary.id).catch(() => null),
      listStandups(primary.id, { days: 7, limit: 20 }).catch(() => []),
      loadProjectSprintMetrics(primary.id).catch(() => null),
    ]);

    projectTasks = tasks;
    projectRaid = raid;
    standups = recentStandups;
    sprintMetrics = sprint;
    blockedCount = tasks.filter((t) => t.status === "blocked").length;
    storiesCount = stories.length;
    deliveryConfidence = Math.round((forecast?.confidence ?? 0.84) * 100);

    const openRaid = raid.filter(
      (r) => (r.type === "issue" || r.type === "risk") && r.status !== "closed",
    ).length;

    if (!ctx?.ai_summary && (blockedCount > 0 || openRaid > 0)) {
      aiSummary = `Sprint needs attention — ${blockedCount} blocked task${blockedCount === 1 ? "" : "s"} and ${openRaid} open RAID item${openRaid === 1 ? "" : "s"}.`;
    }
  }

  const capacity = await getOrgCapacitySnapshot().catch(() => null);
  const strain = capacity?.deliveryStrain ?? "low";

  const storedTasks = Array.isArray(plan.guidedTasks)
    ? (plan.guidedTasks as ScrumGuidedTask[]).map((t, i) => ({
        ...t,
        id: t.id ?? `stored-${i}`,
      }))
    : [];

  const storedImpediments = Array.isArray(plan.impediments)
    ? (plan.impediments as ScrumImpediment[])
    : [];

  const blockedTasks = projectTasks.filter((t) => t.status === "blocked");
  const impediments = buildImpedimentsFromSignals({
    stored: storedImpediments,
    blockedTasks: blockedTasks.map((t) => ({
      title: t.title,
      blocked_reason: t.blocked_reason,
      updated_at: t.updated_at,
    })),
    raidItems: projectRaid.map((r) => ({
      type: r.type,
      title: r.title,
      severity: r.severity,
      status: r.status,
      created_at: r.created_at,
    })),
  });

  const teamHealthRaw = (plan.teamHealth ?? {}) as Record<string, unknown>;
  const burnoutRaw = (plan.burnout ?? {}) as Record<string, unknown>;
  const capacityRaw = (plan.capacity ?? {}) as Record<string, unknown>;
  const maturityRaw = (plan.agileMaturity ?? {}) as AgileMaturityScores;

  const completionPct =
    sprintMetrics && sprintMetrics.plannedPoints > 0
      ? sprintMetrics.completionPct
      : projectTasks.length > 0
        ? Math.round(
            (projectTasks.filter((t) => t.status === "done").length /
              projectTasks.length) *
              100,
          )
        : 0;

  const sprintSuccessProbability =
    typeof plan.sprintSuccessProbability === "number"
      ? plan.sprintSuccessProbability
      : Math.min(0.95, 0.7 + deliveryConfidence / 500);

  const velocity =
    sprintMetrics && sprintMetrics.velocity.length > 0
      ? sprintMetrics.velocity
      : Array.isArray(plan.velocityHistory)
        ? (plan.velocityHistory as Array<{ sprint: string; points: number }>)
        : [];
  const velocitySource: "live" | "fallback" =
    sprintMetrics?.dataSources.velocity === "live"
      ? "live"
      : velocity.length > 0
        ? "live"
        : "fallback";
  const burndownSource: "live" | "fallback" =
    sprintMetrics?.dataSources.burndown === "live" ? "live" : "fallback";

  const retroThemes = Array.isArray(plan.retroThemes)
    ? (plan.retroThemes as string[])
    : projectRaid
        .filter((r) => r.type === "issue" && r.status !== "closed")
        .map((r) => r.title)
        .slice(0, 4);

  const standupSummary = aggregateStandupBlockers(standups);
  const crossTeamFromRaid = mapRaidToCrossTeamDeps(
    projectRaid.map((r) => ({
      type: r.type,
      title: r.title,
      severity: r.severity,
      status: r.status,
      created_at: r.created_at,
    })),
  );

  const plannedPoints =
    sprintMetrics?.plannedPoints ?? (projectTasks.length || storiesCount || 0);
  const completedPoints =
    sprintMetrics?.completedPoints ??
    projectTasks.filter((t) => t.status === "done").length;
  const burndownPoints = sprintMetrics?.burndownPoints ?? [];
  const sprintLabel =
    sprintMetrics?.sprintLabel ??
    (plan.sprintLabel as string) ??
    (velocity.length ? velocity[velocity.length - 1].sprint : "No active sprint");
  const daysRemaining = sprintMetrics?.daysRemaining ?? 0;
  const ceremonies =
    sprintMetrics && sprintMetrics.ceremonies.length > 0
      ? sprintMetrics.ceremonies
      : ["Sprint Planning", "Daily Standup", "Refinement", "Sprint Review", "Retrospective"];
  const velocityTrend =
    velocity.length >= 2
      ? velocity[velocity.length - 1].points >= velocity[velocity.length - 2].points
        ? "Up"
        : "Down"
      : velocity.length === 1
        ? "Baseline"
        : "—";

  return {
    userName: profile?.name ?? user?.email ?? null,
    primaryProject: primary ? { id: primary.id, name: primary.name } : null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status ?? "active",
    })),
    dataSources: { velocity: velocitySource, burndown: burndownSource },
    burndownPoints,
    overview: {
      sprintLabel,
      completionPct,
      daysRemaining,
      blockedStories: blockedCount || impediments.length,
      velocityTrend,
      teamHealth: strain === "high" ? "Amber" : "Green",
      burnoutRisk: (burnoutRaw.risk as string) ?? (strain === "high" ? "Medium" : "Low"),
      sprintSuccessProbability: Math.round(sprintSuccessProbability * 100),
    },
    aiSummary,
    guidedTasks: buildScrumGuidedTasks({
      stored: storedTasks,
      impediments,
      blockedTaskCount: blockedCount,
      overdueRetroActions: retroThemes.length,
    }),
    sprintHealth: {
      plannedPoints,
      completedPoints,
      completionRate: completionPct,
      spilloverRisk: completionPct < 75 ? "Medium" : "Low",
      deliveryConfidence,
      prediction: `Current velocity indicates an ${Math.round(sprintSuccessProbability * 100)}% chance of sprint success.`,
    },
    teamHealth: {
      happinessScore: (teamHealthRaw.happinessScore as number) ?? 8.1,
      meetingLoad: (teamHealthRaw.meetingLoad as string) ?? "Moderate",
      collaboration: (teamHealthRaw.collaboration as string) ?? "High",
      burnoutRisk: (teamHealthRaw.burnoutRisk as string) ?? (strain === "high" ? "Medium" : "Low"),
      workloadBalance: (teamHealthRaw.workloadBalance as string) ?? "Healthy",
      insight:
        (teamHealthRaw.insight as string) ??
        "Meeting load increased by 25% this sprint.",
    },
    burnout: {
      risk: (burnoutRaw.risk as string) ?? (strain === "high" ? "Medium" : "Low"),
      affectedTeam: (burnoutRaw.affectedTeam as string) ?? "Backend",
      recommendation:
        (burnoutRaw.recommendation as string) ??
        "Reduce WIP and defer non-critical work.",
    },
    impediments,
    impedimentInsight:
      impediments.length > 0
        ? `${impediments.length} active impediment${impediments.length === 1 ? "" : "s"} from blocked tasks and RAID.`
        : "No active impediments from delivery signals.",
    ceremonies,
    standupSummary,
    velocity,
    velocityInsight:
      velocity.length >= 2
        ? `Latest velocity ${velocity[velocity.length - 1].points} pts vs ${velocity[velocity.length - 2].points} pts prior.`
        : velocity.length === 1
          ? `${velocity[0].points} pts completed in the latest sprint window.`
          : "Complete a sprint workstream to populate velocity history.",
    capacity: {
      availableHours: (capacityRaw.availableHours as number) ?? 320,
      allocatedHours: (capacityRaw.allocatedHours as number) ?? 295,
      leaveImpactPct: (capacityRaw.leaveImpactPct as number) ?? 8,
      bufferHours: (capacityRaw.bufferHours as number) ?? 25,
      recommendation:
        (capacityRaw.recommendation as string) ??
        "QA capacity may constrain the next sprint.",
    },
    crossTeamDeps:
      crossTeamFromRaid.length > 0
        ? crossTeamFromRaid
        : Array.isArray(plan.crossTeamDeps)
          ? (plan.crossTeamDeps as Array<{ team: string; dependency: string; status: string }>)
          : [],
    retroThemes,
    retroRecommendation:
      retroThemes.length > 0
        ? `Address recurring themes: ${retroThemes.slice(0, 2).join(", ")}.`
        : "No open issue themes flagged from RAID.",
    agileMaturity: {
      collaboration: maturityRaw.collaboration ?? 85,
      delivery: maturityRaw.delivery ?? 80,
      quality: maturityRaw.quality ?? 88,
      planning: maturityRaw.planning ?? 76,
      improvement: maturityRaw.improvement ?? 91,
      overall: computeAgileMaturityOverall({
        collaboration: maturityRaw.collaboration ?? 85,
        delivery: maturityRaw.delivery ?? 80,
        quality: maturityRaw.quality ?? 88,
        planning: maturityRaw.planning ?? 76,
        improvement: maturityRaw.improvement ?? 91,
      }),
    },
    stakeholders: buildScrumStakeholders(),
    crossRoleImpact: await mergeProjectImpactIntoCrossRole(
      buildScrumCrossRoleImpact({
        blockedCount,
        sprintCompletion: completionPct,
        retroThemes: retroThemes.length,
      }),
      primary?.id,
    ),
    extractionStatus: ctx?.extraction_status ?? "pending",
  };
}
