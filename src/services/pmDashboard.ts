/**
 * Product Manager Mission Control aggregator.
 */

import { createClient } from "@/lib/supabase/server";
import { listProjectsForOrg } from "./portfolio";
import {
  buildProductCrossRoleImpact,
  buildProductGuidedTasks,
  buildStakeholderProductConnections,
  computeFeatureAdoptionFromUsage,
  computeProductHealth,
  type CrossRoleProductImpact,
  type ProductGuidedTask,
} from "./pmProductEngine";
import { getPmProductContext, getProductStats, listCustomerSegments } from "./pmProduct";
import { mergeProjectImpactIntoCrossRole } from "./deliveryImpact";

export type ProductMissionControl = {
  userName: string | null;
  primaryProject: { id: string; name: string } | null;
  projects: Array<{ id: string; name: string; status: string }>;
  kpis: {
    productHealth: number;
    featureAdoption: number;
    nps: number | null;
    retention: number | null;
    featuresNow: number;
    featuresTotal: number;
    insightsCount: number;
  };
  aiSummary: string;
  differentiationInsight: string | null;
  vision: {
    statement: string;
    northStarMetric: string;
    objectives: string[];
  } | null;
  opportunityTree: {
    goal: string;
    opportunities: Array<{ title: string; solutions: string[] }>;
  } | null;
  guidedTasks: ProductGuidedTask[];
  crossRoleImpact: CrossRoleProductImpact[];
  stakeholderConnections: ReturnType<typeof buildStakeholderProductConnections>;
  roadmap: { now: string[]; next: string[]; later: string[] };
  topFeatures: Array<{ title: string; score: number; horizon: string }>;
  customerSegments: Awaited<ReturnType<typeof listCustomerSegments>>;
  topPainPoints: string[];
  featureAdoption: Array<{ feature: string; adoption: number }>;
  voiceOfCustomer: { positive: number; neutral: number; negative: number; themes: string[] };
};

export async function getProductMissionControl(
  projectId?: string,
): Promise<ProductMissionControl> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .maybeSingle();

  const projects = await listProjectsForOrg().catch(() => []);
  const active = projects.filter((p) => p.status === "active");
  const primary =
    active.find((p) => p.id === projectId) ?? active[0] ?? projects[0] ?? null;

  let stats = {
    features: [] as Awaited<ReturnType<typeof getProductStats>>["features"],
    insights: [] as Awaited<ReturnType<typeof getProductStats>>["insights"],
    segments: [] as Awaited<ReturnType<typeof getProductStats>>["segments"],
    context: null as Awaited<ReturnType<typeof getProductStats>>["context"],
    now: [] as Awaited<ReturnType<typeof getProductStats>>["now"],
    next: [] as Awaited<ReturnType<typeof getProductStats>>["next"],
    later: [] as Awaited<ReturnType<typeof getProductStats>>["later"],
    shipped: [] as Awaited<ReturnType<typeof getProductStats>>["shipped"],
  };

  if (primary) {
    const s = await getProductStats(primary.id).catch(() => null);
    if (s) stats = s;
  }

  const ctx = stats.context?.product_context ?? {};
  const analytics = (stats.context?.analytics ?? {}) as Record<string, unknown>;
  const voc = (analytics.voiceOfCustomer ?? {}) as {
    positive?: number;
    neutral?: number;
    negative?: number;
    themes?: string[];
  };

  const visionRaw = ctx.vision as ProductMissionControl["vision"];
  const opportunityRaw = ctx.opportunityTree as ProductMissionControl["opportunityTree"];
  const storedTasks = (ctx.guidedTasks ?? []) as ProductGuidedTask[];

  const aiSummary =
    (typeof ctx.aiSummary === "string" && ctx.aiSummary) ||
    "Run AI product analysis on your charter or PRD to populate vision, roadmap, and customer insights.";
  const differentiationInsight =
    typeof ctx.differentiationInsight === "string" ? ctx.differentiationInsight : null;

  const adoptionRows = await computeOrgFeatureAdoption(supabase, active.length || projects.length);
  const adoptionAvg =
    adoptionRows.length > 0
      ? Math.round(adoptionRows.reduce((s, r) => s + r.adoption, 0) / adoptionRows.length)
      : 0;

  const positivePct =
    voc.positive ??
    Math.round(
      (stats.insights.filter((i) => i.sentiment === "positive").length /
        Math.max(stats.insights.length, 1)) *
        100,
    );

  const productHealth =
    (analytics.productHealth as number | undefined) ??
    computeProductHealth({
      featureAdoptionAvg: adoptionAvg,
      roadmapNowProgress: stats.now.length > 0 ? 75 : 40,
      insightSentimentPositive: positivePct,
    });

  const featureAdoption =
    (analytics.featureAdoption as number | undefined) ?? adoptionAvg;

  let crossRoleImpact = buildProductCrossRoleImpact({
    roadmapNowCount: stats.now.length,
    featuresShipped: stats.shipped.length,
    highPriorityInsights: stats.insights.filter((i) => i.priority === "high").length,
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
    kpis: {
      productHealth,
      featureAdoption,
      nps: (analytics.nps as number | undefined) ?? null,
      retention: (analytics.retention as number | undefined) ?? null,
      featuresNow: stats.now.length,
      featuresTotal: stats.features.length,
      insightsCount: stats.insights.length,
    },
    aiSummary,
    differentiationInsight,
    vision: visionRaw?.statement ? visionRaw : null,
    opportunityTree: opportunityRaw?.goal ? opportunityRaw : null,
    guidedTasks: buildProductGuidedTasks(
      storedTasks.map((t, i) => ({ ...t, id: t.id ?? `task-${i}` })),
      stats.insights,
      stats.features,
    ),
    crossRoleImpact,
    stakeholderConnections: buildStakeholderProductConnections(),
    roadmap: {
      now: stats.now.map((f) => f.title),
      next: stats.next.map((f) => f.title),
      later: stats.later.map((f) => f.title),
    },
    topFeatures: [...stats.features]
      .sort((a, b) => b.rice.score - a.rice.score)
      .slice(0, 5)
      .map((f) => ({ title: f.title, score: f.rice.score, horizon: f.horizon })),
    customerSegments: stats.segments,
    topPainPoints: stats.insights
      .filter((i) => i.insight_type === "pain_point" || i.priority === "high")
      .slice(0, 4)
      .map((i) => i.theme || i.content),
    featureAdoption: adoptionRows,
    voiceOfCustomer: {
      positive: voc.positive ?? positivePct,
      neutral: voc.neutral ?? 18,
      negative: voc.negative ?? Math.max(0, 100 - positivePct - 18),
      themes: voc.themes ?? stats.insights.slice(0, 3).map((i) => i.theme).filter(Boolean),
    },
  };
}

async function computeOrgFeatureAdoption(
  supabase: Awaited<ReturnType<typeof createClient>>,
  totalProjects: number,
) {
  const [{ count: charterCount }, { count: meetingCount }, { count: reportCount }] =
    await Promise.all([
      supabase.from("charters").select("id", { count: "exact", head: true }),
      supabase.from("meetings").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id", { count: "exact", head: true }),
    ]);

  let benefitCount = 0;
  try {
    const { count } = await supabase
      .from("benefit_hypotheses")
      .select("id", { count: "exact", head: true });
    benefitCount = count ?? 0;
  } catch {
    benefitCount = 0;
  }

  return computeFeatureAdoptionFromUsage({
    projectsWithCharter: charterCount ?? 0,
    projectsWithMeetings: meetingCount ?? 0,
    projectsWithReports: reportCount ?? 0,
    projectsWithBenefits: benefitCount,
    totalProjects: Math.max(totalProjects, 1),
  });
}
