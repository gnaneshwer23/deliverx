/**
 * PM Mission Control dashboard aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import { getProjectAlignment } from "./alignment";
import { listBenefits } from "./benefits";
import { getDeliveryForecast } from "./deliveryForecast";
import { getPmDeliveryContext } from "./deliveryPmContext";
import {
  buildDeliveryCrossRoleImpact,
  buildDeliveryHealth,
  buildDeliveryStakeholders,
  buildPmGuidedTasks,
  buildStakeholderActionQueue,
  mapMilestonesToPhases,
  type CrossRoleDeliveryImpact,
  type DeliveryHealthDimension,
  type PmGuidedTask,
  type StakeholderActionRow,
  type StakeholderDeliveryRow,
} from "./deliveryPmEngine";
import { listOrgTasks } from "./delivery";
import { getOrgGovernanceStats, listDecisions, listRaidItems } from "./governance";
import { listRecentStatusReports, type WeeklyStatusReportSummary } from "./deliveryPmReports";
import { computeProjectHealth } from "./intelligenceEngine";
import { listMilestones } from "./milestones";
import { listProjectsForOrg } from "./portfolio";
import { loadProjectSignals } from "./projectSignals";
import { mergeProjectImpactIntoCrossRole } from "./deliveryImpact";
import { getProjectSuccessScore } from "./successScore";

export type PmMissionControl = {
  userName: string | null;
  primaryProject: { id: string; name: string } | null;
  projects: Array<{ id: string; name: string; status: string }>;
  overview: {
    healthTier: "healthy" | "watch" | "at-risk";
    healthScore: number;
    timelineComplete: number;
    budgetLabel: string;
    criticalRisks: number;
    openDecisions: number;
    blockedDependencies: number;
    benefitsDeliveredPct: number;
    goLiveProbability: number | null;
  };
  aiSummary: string;
  guidedTasks: PmGuidedTask[];
  healthDimensions: DeliveryHealthDimension[];
  healthInsight: string;
  stakeholders: StakeholderDeliveryRow[];
  crossRoleImpact: CrossRoleDeliveryImpact[];
  raid: {
    risks: Array<{ title: string; severity: string; owner: string }>;
    issues: Array<{ title: string; severity: string }>;
    dependencies: string[];
  };
  milestones: Array<{ phase: string; status: "done" | "active" | "pending" }>;
  budget: {
    approved: number;
    spent: number;
    forecast: number;
    burnRateMonthly: number;
    currency: string;
  };
  benefits: Array<{ title: string; target: number | null; current: number | null; unit: string | null; pct: number | null }>;
  decisions: Array<{ title: string; status: string; impact: string }>;
  pendingProposals: number;
  statusReports: WeeklyStatusReportSummary[];
  stakeholderActionQueue: StakeholderActionRow[];
};

export async function getPmMissionControl(projectId?: string): Promise<PmMissionControl> {
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

  let aiSummary =
    "Run AI delivery analysis or connect your project charter to populate PM Mission Control.";
  let ctx = null as Awaited<ReturnType<typeof getPmDeliveryContext>>;
  let milestones: Awaited<ReturnType<typeof listMilestones>> = [];
  let benefits: Awaited<ReturnType<typeof listBenefits>> = [];
  let risks: Awaited<ReturnType<typeof listRaidItems>> = [];
  let allIssues: Awaited<ReturnType<typeof listRaidItems>> = [];
  let raidItems: Awaited<ReturnType<typeof listRaidItems>> = [];
  let decisions: Awaited<ReturnType<typeof listDecisions>> = [];
  let healthScore = 70;
  let healthTier: "healthy" | "watch" | "at-risk" = "watch";
  let timelineComplete = 50;
  let alignmentScore = 70;
  let blockedTasks = 0;
  let goLiveProbability: number | null = null;
  let storedTasks: PmGuidedTask[] = [];
  let dependencies: string[] = [];
  let openClarifications = 0;
  let clarificationRows: Array<{ id: string; question: string; stakeholderRole: string | null }> =
    [];
  let statusReports: WeeklyStatusReportSummary[] = [];

  if (primary) {
    const [
      context,
      ms,
      bens,
      raid,
      decs,
      alignment,
      success,
      forecast,
      signals,
      tasks,
      reports,
    ] = await Promise.all([
      getPmDeliveryContext(primary.id).catch(() => null),
      listMilestones(primary.id).catch(() => []),
      listBenefits(primary.id).catch(() => []),
      listRaidItems(primary.id).catch(() => []),
      listDecisions(primary.id).catch(() => []),
      getProjectAlignment(primary.id).catch(() => null),
      getProjectSuccessScore(primary.id).catch(() => null),
      getDeliveryForecast(primary.id).catch(() => null),
      loadProjectSignals(primary.id).catch(() => null),
      listOrgTasks({ projectId: primary.id, limit: 200 }).catch(() => []),
      listRecentStatusReports(primary.id, 5).catch(() => []),
    ]);

    statusReports = reports;

    ctx = context;
    milestones = ms;
    benefits = bens;
    raidItems = raid;
    risks = raid.filter((r) => r.type === "risk");
    allIssues = raid.filter((r) => r.type === "issue");
    decisions = decs;

    if (context?.ai_summary) aiSummary = context.ai_summary;
    goLiveProbability = context?.go_live_probability ?? null;

    const plan = (context?.delivery_plan ?? {}) as Record<string, unknown>;
    dependencies = Array.isArray(plan.dependencies)
      ? (plan.dependencies as string[])
      : [];
    storedTasks = Array.isArray(plan.guidedTasks)
      ? (plan.guidedTasks as PmGuidedTask[]).map((t, i) => ({
          ...t,
          id: t.id ?? `stored-${i}`,
        }))
      : [];

    healthScore =
      success?.score ??
      (signals ? computeProjectHealth(signals).score : 70);
    healthTier = success?.tier ?? "watch";
    alignmentScore = alignment?.score ?? 70;

    const completedMs = milestones.filter((m) => m.status === "completed").length;
    timelineComplete =
      milestones.length > 0
        ? Math.round((completedMs / milestones.length) * 100)
        : Math.round((forecast?.confidence ?? 0.7) * 100);

    blockedTasks = tasks.filter((t) => t.status === "blocked").length;

    try {
      const { data: clarifications } = await supabase
        .from("requirement_clarifications")
        .select("id, question, stakeholder_role")
        .eq("project_id", primary.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);
      clarificationRows = (clarifications ?? []).map((c) => ({
        id: c.id as string,
        question: c.question as string,
        stakeholderRole: (c.stakeholder_role as string | null) ?? null,
      }));
      openClarifications = clarificationRows.length;
    } catch {
      openClarifications = 0;
      clarificationRows = [];
    }

    if (!context?.ai_summary && forecast) {
      aiSummary = `Project ${healthTier === "at-risk" ? "needs attention" : "on track"} — ${Math.round(forecast.confidence * 100)}% delivery confidence.${blockedTasks > 0 ? ` ${blockedTasks} blocked tasks.` : ""}`;
    }
  }

  const governance = await getOrgGovernanceStats().catch(() => ({
    openRisks: 0,
    pendingDecisions: 0,
  }));

  const criticalRisks = risks.filter(
    (r) => r.severity === "high" || r.severity === "critical",
  );

  const budget = {
    approved: ctx?.budget?.approved ?? 750_000,
    spent: ctx?.budget?.spent ?? Math.round((ctx?.budget?.approved ?? 750_000) * 0.64),
    forecast: ctx?.budget?.forecast ?? 720_000,
    burnRateMonthly: ctx?.budget?.burnRateMonthly ?? 48_000,
    currency: ctx?.budget?.currency ?? "GBP",
  };

  const benefitsRows = benefits.map((b) => {
    const pct =
      b.target_value && b.current_value != null && b.target_value > 0
        ? Math.round((b.current_value / b.target_value) * 100)
        : null;
    return {
      title: b.title,
      target: b.target_value,
      current: b.current_value,
      unit: b.unit,
      pct,
    };
  });

  const benefitsDeliveredPct =
    benefitsRows.length > 0
      ? Math.round(
          benefitsRows.reduce((s, b) => s + (b.pct ?? 0), 0) / benefitsRows.length,
        )
      : 42;

  const budgetUsedPct = Math.round((budget.spent / Math.max(budget.approved, 1)) * 100);

  const health = buildDeliveryHealth({
    healthScore,
    timelineComplete,
    budgetUsedPct,
    openHighRisks: criticalRisks.length,
    pendingDecisions: decisions.filter((d) => d.status === "proposed").length,
    benefitsPct: benefitsDeliveredPct,
    alignmentScore,
    insight: (ctx?.delivery_plan as Record<string, unknown>)?.healthInsights
      ? String(
          ((ctx?.delivery_plan as Record<string, unknown>).healthInsights as Record<string, string>)
            ?.insight ?? "",
        )
      : undefined,
  });

  let pendingProposals = 0;
  try {
    const { count } = await supabase
      .from("proposed_actions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pendingProposals = count ?? 0;
  } catch {
    pendingProposals = 0;
  }

  const issues = allIssues.length ? allIssues : raidItems.filter((r) => r.type === "issue");

  let crossRoleImpact = buildDeliveryCrossRoleImpact({
    criticalRisks: criticalRisks.length,
    milestoneProgress: timelineComplete,
    pendingDecisions: governance.pendingDecisions,
    blockedTasks,
  });

  if (primary) {
    crossRoleImpact = await mergeProjectImpactIntoCrossRole(crossRoleImpact, primary.id);
  }

  const stakeholderActionQueue = primary
    ? buildStakeholderActionQueue({
        pendingDecisions: decisions
          .filter((d) => d.status === "proposed")
          .map((d) => ({ id: d.id, title: d.title, projectId: primary.id })),
        openClarifications: clarificationRows,
        pendingProposals,
        blockedTasks,
        criticalRisks: criticalRisks.map((r) => ({ id: r.id, title: r.title })),
      })
    : [];

  return {
    userName: profile?.name ?? user?.email ?? null,
    primaryProject: primary ? { id: primary.id, name: primary.name } : null,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status ?? "active",
    })),
    overview: {
      healthTier,
      healthScore,
      timelineComplete,
      budgetLabel: `${formatMoney(budget.spent, budget.currency)} / ${formatMoney(budget.approved, budget.currency)}`,
      criticalRisks: criticalRisks.length,
      openDecisions: decisions.filter((d) => d.status === "proposed").length,
      blockedDependencies: dependencies.length + blockedTasks,
      benefitsDeliveredPct,
      goLiveProbability,
    },
    aiSummary,
    guidedTasks: buildPmGuidedTasks({
      stored: storedTasks,
      criticalRisks: criticalRisks.map((r) => ({
        id: r.id,
        title: r.title,
        severity: r.severity,
        owner: r.owner_id ?? undefined,
      })),
      pendingDecisions: decisions
        .filter((d) => d.status === "proposed")
        .map((d) => ({ id: d.id, title: d.title })),
      blockedTasks,
      overdueMilestones: milestones
        .filter((m) => m.status === "at_risk" || m.status === "slipped")
        .map((m) => ({ id: m.id, title: m.title })),
      pendingProposals,
    }),
    healthDimensions: health.dimensions,
    healthInsight: health.insight,
    stakeholders: buildDeliveryStakeholders({
      pendingDecisions: decisions.filter((d) => d.status === "proposed").length,
      blockedTasks,
      openClarifications,
    }),
    crossRoleImpact,
    raid: {
      risks: criticalRisks.slice(0, 5).map((r) => ({
        title: r.title,
        severity: r.severity,
        owner: r.owner_id ?? "Unassigned",
      })),
      issues: issues.slice(0, 4).map((r) => ({
        title: r.title,
        severity: r.severity,
      })),
      dependencies,
    },
    milestones: mapMilestonesToPhases(milestones),
    budget,
    benefits: benefitsRows,
    decisions: decisions.slice(0, 6).map((d) => ({
      title: d.title,
      status: d.status,
      impact: d.outcome?.trim() ? d.outcome.slice(0, 40) : "Medium",
    })),
    pendingProposals,
    statusReports,
    stakeholderActionQueue,
  };
}

function formatMoney(n: number, currency: string): string {
  const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : "";
  if (n >= 1000) return `${sym}${Math.round(n / 1000)}k`;
  return `${sym}${n}`;
}
