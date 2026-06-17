/**
 * Scrum Mission Control dashboard aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import { getOrgCapacitySnapshot } from "./capacity";
import { getDeliveryForecast } from "./deliveryForecast";
import { listOrgTasks } from "./delivery";
import { listRaidItems } from "./governance";
import { listProjectsForOrg } from "./portfolio";
import { getScrumContext } from "./scrumContext";
import {
  buildScrumCrossRoleImpact,
  buildScrumGuidedTasks,
  buildScrumStakeholders,
  computeAgileMaturityOverall,
  defaultVelocityHistory,
  type AgileMaturityScores,
  type CrossRoleScrumImpact,
  type ScrumGuidedTask,
  type ScrumImpediment,
  type ScrumStakeholderRow,
} from "./scrumEngine";
import { listUserStories } from "./baRequirements";

export type ScrumMissionControl = {
  userName: string | null;
  primaryProject: { id: string; name: string } | null;
  projects: Array<{ id: string; name: string; status: string }>;
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

  const projects = await listProjectsForOrg().catch(() => []);
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

  if (primary) {
    const [tasks, stories, raid, forecast] = await Promise.all([
      listOrgTasks({ projectId: primary.id, limit: 200 }).catch(() => []),
      listUserStories(primary.id).catch(() => []),
      listRaidItems(primary.id).catch(() => []),
      getDeliveryForecast(primary.id).catch(() => null),
    ]);

    blockedCount = tasks.filter((t) => t.status === "blocked").length;
    storiesCount = stories.length;
    deliveryConfidence = Math.round((forecast?.confidence ?? 0.84) * 100);

    if (!ctx?.ai_summary && blockedCount > 0) {
      aiSummary = `Sprint needs attention — ${blockedCount} blocked task${blockedCount === 1 ? "" : "s"} and ${raid.filter((r) => r.type === "issue" || r.type === "risk").length} open RAID items.`;
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

  const impediments: ScrumImpediment[] = Array.isArray(plan.impediments)
    ? (plan.impediments as ScrumImpediment[])
    : blockedCount > 0
      ? [
          {
            title: "Authentication API",
            owner: "Platform",
            ageDays: 5,
            severity: "high",
          },
          {
            title: "Test Environment",
            owner: "DevOps",
            ageDays: 2,
            severity: "medium",
          },
        ].slice(0, blockedCount + 1)
      : [];

  const teamHealthRaw = (plan.teamHealth ?? {}) as Record<string, unknown>;
  const burnoutRaw = (plan.burnout ?? {}) as Record<string, unknown>;
  const capacityRaw = (plan.capacity ?? {}) as Record<string, unknown>;
  const maturityRaw = (plan.agileMaturity ?? {}) as AgileMaturityScores;

  const completionPct =
    storiesCount > 0
      ? Math.round(
          ((storiesCount - blockedCount) / Math.max(storiesCount, 1)) * 100 * 0.72,
        )
      : 72;

  const sprintSuccessProbability =
    typeof plan.sprintSuccessProbability === "number"
      ? plan.sprintSuccessProbability
      : Math.min(0.95, 0.7 + deliveryConfidence / 500);

  const velocity = Array.isArray(plan.velocityHistory)
    ? (plan.velocityHistory as Array<{ sprint: string; points: number }>)
    : defaultVelocityHistory();

  const retroThemes = Array.isArray(plan.retroThemes)
    ? (plan.retroThemes as string[])
    : ["Environment issues", "Testing delays", "Requirement ambiguity"];

  const standupRaw = (plan.standupSummary ?? {}) as {
    yesterday?: string[];
    today?: string[];
    blockers?: string[];
  };

  const plannedPoints = 80;
  const completedPoints = Math.round((completionPct / 100) * plannedPoints);

  return {
    userName: profile?.name ?? user?.email ?? null,
    primaryProject: primary ? { id: primary.id, name: primary.name } : null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status ?? "active",
    })),
    overview: {
      sprintLabel: "Sprint 24",
      completionPct,
      daysRemaining: 4,
      blockedStories: blockedCount || impediments.length,
      velocityTrend: "Stable",
      teamHealth: strain === "high" ? "Amber" : "Green",
      burnoutRisk: (burnoutRaw.risk as string) ?? (strain === "high" ? "Medium" : "Low"),
      sprintSuccessProbability: Math.round(sprintSuccessProbability * 100),
    },
    aiSummary,
    guidedTasks: buildScrumGuidedTasks({
      stored: storedTasks,
      impediments,
      blockedTaskCount: blockedCount,
      overdueRetroActions: 2,
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
      "Cross-team dependencies contribute to 38% of delays.",
    ceremonies: [
      "Sprint Planning",
      "Daily Standup",
      "Refinement",
      "Review",
      "Retrospective",
    ],
    standupSummary: {
      yesterday: standupRaw.yesterday ?? ["6 stories progressed", "2 completed"],
      today: standupRaw.today ?? ["API integration continues", "Regression testing begins"],
      blockers: standupRaw.blockers ?? (blockedCount ? ["Authentication API"] : []),
    },
    velocity,
    velocityInsight: "Velocity has stabilised over five sprints.",
    capacity: {
      availableHours: (capacityRaw.availableHours as number) ?? 320,
      allocatedHours: (capacityRaw.allocatedHours as number) ?? 295,
      leaveImpactPct: (capacityRaw.leaveImpactPct as number) ?? 8,
      bufferHours: (capacityRaw.bufferHours as number) ?? 25,
      recommendation:
        (capacityRaw.recommendation as string) ??
        "QA capacity may constrain the next sprint.",
    },
    crossTeamDeps: Array.isArray(plan.crossTeamDeps)
      ? (plan.crossTeamDeps as Array<{ team: string; dependency: string; status: string }>)
      : [
          { team: "Platform", dependency: "Auth API", status: blockedCount ? "Delayed" : "Ready" },
          { team: "Security", dependency: "Review", status: "Pending" },
          { team: "DevOps", dependency: "Environment", status: "Ready" },
        ],
    retroThemes,
    retroRecommendation:
      "Requirement clarity has been raised in three consecutive retrospectives.",
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
    crossRoleImpact: buildScrumCrossRoleImpact({
      blockedCount,
      sprintCompletion: completionPct,
      retroThemes: retroThemes.length,
    }),
    extractionStatus: ctx?.extraction_status ?? "pending",
  };
}
