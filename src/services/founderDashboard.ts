/**
 * Founder Mission Control dashboard aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import { getOrgCapacitySnapshot } from "./capacity";
import {
  buildFounderCrossRoleImpact,
  computeStartupHealthTier,
  defaultStrategicObjectives,
  formatInvestorBullets,
  toneFromScore,
  type CrossRoleFounderImpact,
  type FounderDecisionRow,
  type FounderPortfolioRow,
  type FounderStrategicObjective,
} from "./founderEngine";
import { getFounderContext } from "./founderContext";
import { listPendingApprovals } from "./approvals";
import { getOrgGovernanceStats, listOrgDecisionsPending } from "./governance";
import { getDeliveryForecast } from "./deliveryForecast";
import { getPmDeliveryContext } from "./deliveryPmContext";
import { getPmProductContext } from "./pmProduct";
import { getPmoSnapshot, listProjectsForOrg } from "./portfolio";
import { getProjectSuccessScore } from "./successScore";

export type FounderMissionControl = {
  userName: string | null;
  orgName: string | null;
  companyHealth: { tier: "green" | "amber" | "red"; label: string };
  kpis: {
    runwayMonths: number;
    monthlyBurn: number;
    mrr: number;
    arr: number;
    growthPct: number;
    teamVelocity: string;
  };
  aiSummary: string;
  portfolio: FounderPortfolioRow[];
  strategicObjectives: FounderStrategicObjective[];
  strategicInsight: string;
  funding: {
    cashInBank: number;
    monthlyBurn: number;
    runwayMonths: number;
    nextRaise: string;
    runwayEndPrediction: string;
    currency: string;
  };
  investorUpdate: string[];
  decisionsNeeded: FounderDecisionRow[];
  deliveryHealth: {
    projectsOnTrack: string;
    criticalRisks: number;
    blockedDependencies: number;
    avgDeliveryConfidence: number;
  };
  productHealth: {
    nps: number | null;
    retention: number | null;
    featureAdoption: number;
    satisfaction: number | null;
  };
  teamHealth: {
    engineeringCapacityPct: number;
    burnoutRisk: "Low" | "Medium" | "High";
    hiringNeed: string;
    recommendation: string;
  };
  crossRoleImpact: CrossRoleFounderImpact[];
  extractionStatus: string;
};

export async function getFounderMissionControl(): Promise<FounderMissionControl> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("name, organisation_id, organisations(name)")
    .maybeSingle();

  const orgName =
    (profile?.organisations as { name?: string } | null)?.name ?? null;

  const [ctx, pmo, governance, pendingDecisions, pendingApprovals, capacity, projects] =
    await Promise.all([
      getFounderContext().catch(() => null),
      getPmoSnapshot().catch(() => null),
      getOrgGovernanceStats().catch(() => ({
        openRisks: 0,
        pendingDecisions: 0,
      })),
      listOrgDecisionsPending(8).catch(() => []),
      listPendingApprovals(8).catch(() => []),
      getOrgCapacitySnapshot().catch(() => null),
      listProjectsForOrg().catch(() => []),
    ]);

  const financials = ctx?.financials ?? {};
  const runwayMonths = financials.runwayMonths ?? 14;
  const monthlyBurn = financials.monthlyBurn ?? 45_000;
  const cashInBank = financials.cashInBank ?? 620_000;
  const mrr = financials.mrr ?? 25_000;
  const arr = financials.arr ?? 300_000;
  const growthPct = financials.growthPct ?? 12;
  const currency = financials.currency ?? "GBP";

  const portfolioHealth = pmo?.portfolioHealth ?? 70;
  const companyHealth = computeStartupHealthTier({
    portfolioHealth,
    runwayMonths,
    growthPct,
  });

  let aiSummary =
    ctx?.ai_summary ??
    "Upload your pitch deck or business case to generate company summary, runway, and strategic objectives.";

  if (!ctx?.ai_summary && pmo?.executiveSummary) {
    aiSummary = pmo.executiveSummary;
  }

  const activeProjects = projects.filter((p) => p.status === "active");
  const projectScores = await Promise.all(
    activeProjects.slice(0, 8).map(async (p) => {
      const [score, forecast, deliveryCtx] = await Promise.all([
        getProjectSuccessScore(p.id).catch(() => null),
        getDeliveryForecast(p.id).catch(() => null),
        getPmDeliveryContext(p.id).catch(() => null),
      ]);
      const healthScore = score?.score ?? 70;
      const deliveryPct = Math.round((forecast?.confidence ?? 0.7) * 100);
      const budget = deliveryCtx?.budget;
      const spent = budget?.spent ?? 0;
      const approved = budget?.approved ?? 1;
      const budgetPct = Math.round((spent / Math.max(approved, 1)) * 100);
      const budgetLabel =
        budgetPct > 90 ? "Over budget" : budgetPct > 75 ? "At risk" : "On track";

      return {
        id: p.id,
        name: p.name,
        healthTone: toneFromScore(healthScore),
        budgetLabel,
        deliveryPct,
        onTrack: healthScore >= 60,
        confidence: forecast?.confidence ?? 0.7,
      };
    }),
  );

  const portfolio: FounderPortfolioRow[] = projectScores.map((p) => ({
    id: p.id,
    name: p.name,
    healthTone: p.healthTone,
    budgetLabel: p.budgetLabel,
    deliveryPct: p.deliveryPct,
  }));

  const onTrackCount = projectScores.filter((p) => p.onTrack).length;
  const avgConfidence =
    projectScores.length > 0
      ? Math.round(
          (projectScores.reduce((s, p) => s + p.confidence, 0) / projectScores.length) *
            100,
        )
      : 84;

  const storedObjectives = ctx?.strategic_objectives ?? [];
  const strategicObjectives =
    storedObjectives.length > 0 ? storedObjectives : defaultStrategicObjectives();

  const adoptionObjective = strategicObjectives.find((o) =>
    o.title.toLowerCase().includes("adoption"),
  );
  const strategicInsight =
    adoptionObjective && adoptionObjective.progress < 75
      ? "Customer adoption is below target and may affect PMF."
      : strategicObjectives.find((o) => o.insight)?.insight ??
        "Strategic objectives tracking within expected range.";

  const investorUpdate = formatInvestorBullets(
    (ctx?.investor_snapshot ?? {}) as { headline?: string; bullets?: string[] },
  );
  if (investorUpdate.length === 0) {
    investorUpdate.push(
      "AI Workspace launched",
      `Customer growth +${growthPct}%`,
      "Burn stable",
      `${onTrackCount} project${onTrackCount === 1 ? "" : "s"} on track`,
    );
  }

  const decisionRows: FounderDecisionRow[] = pendingDecisions.map((d) => ({
    id: d.id,
    title: d.title,
    impact: "Medium",
    status: d.status,
    projectName: d.project_name,
    projectId: d.project_id,
    kind: "decision" as const,
  }));

  const approvalRows: FounderDecisionRow[] = pendingApprovals.map((a) => ({
    id: a.id,
    title: `${a.entity_type} approval (${a.approval_level})`,
    impact: a.approval_level === "steering" ? "High" : "Medium",
    status: a.status,
    projectName: a.project_name,
    projectId: a.project_id,
    kind: "approval" as const,
  }));

  const seen = new Set<string>();
  const decisionsNeeded: FounderDecisionRow[] = [...decisionRows, ...approvalRows].filter(
    (row) => {
      const key = `${row.kind}:${row.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    },
  ).slice(0, 10);

  let productNps: number | null = null;
  let productRetention: number | null = null;
  let featureAdoption = 74;
  if (activeProjects[0]) {
    const productCtx = await getPmProductContext(activeProjects[0].id).catch(() => null);
    const analytics = (productCtx?.analytics ?? {}) as Record<string, unknown>;
    productNps = typeof analytics.nps === "number" ? analytics.nps : 52;
    productRetention =
      typeof analytics.retention === "number" ? analytics.retention : 87;
    featureAdoption =
      typeof analytics.featureAdoption === "number" ? analytics.featureAdoption : 74;
  }

  const capacityPct =
    capacity && capacity.members.length > 0
      ? Math.round(
          100 -
            (capacity.overloadedCount / Math.max(capacity.members.length, 1)) * 30,
        )
      : 92;

  const burnoutRisk: "Low" | "Medium" | "High" =
    capacity?.deliveryStrain === "high"
      ? "High"
      : capacity?.deliveryStrain === "medium"
        ? "Medium"
        : "Low";

  const teamRecommendation =
    (ctx?.company_summary?.teamRecommendation as string) ??
    (capacity?.overloadedCount
      ? "Hiring one senior engineer may accelerate roadmap delivery by 18%."
      : "Team capacity is stable — monitor delivery strain as portfolio grows.");

  return {
    userName: profile?.name ?? user?.email ?? null,
    orgName,
    companyHealth,
    kpis: {
      runwayMonths,
      monthlyBurn,
      mrr,
      arr,
      growthPct,
      teamVelocity: capacity?.deliveryStrain === "high" ? "Strained" : "Stable",
    },
    aiSummary,
    portfolio,
    strategicObjectives,
    strategicInsight,
    funding: {
      cashInBank,
      monthlyBurn,
      runwayMonths,
      nextRaise: financials.nextRaise ?? "Q2 2027",
      runwayEndPrediction:
        financials.runwayEndPrediction ??
        `At current burn, runway ends in ~${runwayMonths} months.`,
      currency,
    },
    investorUpdate,
    decisionsNeeded,
    deliveryHealth: {
      projectsOnTrack: `${onTrackCount}/${Math.max(activeProjects.length, 1)}`,
      criticalRisks: governance.openRisks,
      blockedDependencies: pmo?.blastRadius?.length ?? 0,
      avgDeliveryConfidence: avgConfidence,
    },
    productHealth: {
      nps: productNps,
      retention: productRetention,
      featureAdoption,
      satisfaction: 4.6,
    },
    teamHealth: {
      engineeringCapacityPct: capacityPct,
      burnoutRisk,
      hiringNeed: capacity?.overloadedCount ? "Backend Engineer" : "None urgent",
      recommendation: teamRecommendation,
    },
    crossRoleImpact: buildFounderCrossRoleImpact({
      pendingDecisions: governance.pendingDecisions,
      criticalRisks: governance.openRisks,
      productHealth: featureAdoption,
      deliveryConfidence: avgConfidence,
      capacityStrain: capacity?.deliveryStrain ?? "low",
    }),
    extractionStatus: ctx?.extraction_status ?? "pending",
  };
}
