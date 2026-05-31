/**
 * Global Intelligence façade — Phase 10.
 *
 * Local signal extraction → privacy filter → network contribution →
 * admin-side aggregation → localized recommendations.
 *
 * Cross-org data NEVER returned to clients — only aggregated patterns.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadProjectSignals } from "./projectSignals";
import { getTwinStateForOrg } from "./twin";
import { computeProjectHealth } from "./intelligenceEngine";
import {
  anonymize,
  aggregatePatterns,
  extractBenchmarkContributions,
  extractGlobalPatterns,
  runGlobalIntelligenceLoop,
  strategicCopilot,
  type AnonymizedMetrics,
  type BenchmarkMetric,
  type CopilotResult,
  type CopilotScenarioId,
  type GlobalIntelligenceSnapshot,
  type GlobalKnowledgeGraph,
  type GlobalPattern,
  type LocalOrgMetrics,
  type TransformationEvolution,
  COPILOT_SCENARIOS,
} from "./globalEngine";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, organisations(industry, delivery_type)")
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");
  const org = profile.organisations as {
    industry?: string | null;
    delivery_type?: string | null;
  } | null;
  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
    industry: org?.industry ?? null,
    deliveryType: org?.delivery_type ?? null,
  };
}

// ---------------------------------------------------------------------------
// Local metrics loader
// ---------------------------------------------------------------------------

async function loadLocalOrgMetrics(
  orgId: string,
  supabase: SupabaseClient,
  industry: string | null,
  deliveryType: string | null,
): Promise<LocalOrgMetrics> {
  const { data: projectRows } = await supabase
    .from("projects")
    .select("id")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false });

  const projects = projectRows ?? [];

  let programmeCount = 0;
  try {
    const { count } = await supabase
      .from("programmes")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId);
    programmeCount = count ?? 0;
  } catch {
    programmeCount = 0;
  }

  let depCount = 0;
  try {
    const { count } = await supabase
      .from("cross_project_dependencies")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId);
    depCount = count ?? 0;
  } catch {
    depCount = 0;
  }

  let healthSum = 0;
  let blockerSum = 0;
  for (const p of projects) {
    const signals = await loadProjectSignals(p.id as string, supabase);
    healthSum += computeProjectHealth(signals).score;
    blockerSum += signals.blockers;
  }

  const n = Math.max(projects.length, 1);
  const twin = await getTwinStateForOrg(orgId, supabase).catch(() => null);

  const maxDeps = Math.max(projects.length * (projects.length - 1), 1);
  const coordinationEfficiency = twin?.behavioralPatterns.coordinationEfficiency;
  const coordinationStability =
    twin?.portfolio.stability ??
    (coordinationEfficiency != null ? Math.round(coordinationEfficiency * 100) : 70);

  return {
    industry,
    deliveryType,
    governanceLatency: twin?.systemMetrics.governanceLatency ?? 0.45,
    executionPressure: twin?.systemMetrics.executionPressure ?? 0.35,
    coordinationStability,
    dependencyDensity: depCount / maxDeps,
    avgBlockers: blockerSum / n,
    avgHealth: healthSum / n,
    projectCount: projects.length,
    programmeCount,
  };
}

// ---------------------------------------------------------------------------
// Network contribution (org-scoped insert, anonymized payload)
// ---------------------------------------------------------------------------

async function contributeToNetwork(
  orgId: string,
  metrics: AnonymizedMetrics,
  supabase: SupabaseClient,
) {
  const patterns = extractGlobalPatterns(metrics);
  const benchmarks = extractBenchmarkContributions(metrics);

  const patternRows = patterns.map((p) => ({
    organisation_id: orgId,
    pattern_key: p.patternKey,
    pattern_text: p.patternText,
    industry_bucket: p.industryBucket,
    project_type_bucket: p.projectTypeBucket,
    impact: p.impact,
    confidence: p.confidence,
  }));

  const benchmarkRows = benchmarks.map((b) => ({
    organisation_id: orgId,
    metric_key: b.metricKey,
    value: b.value,
    industry_bucket: b.industryBucket,
  }));

  await supabase.from("global_pattern_contributions").insert(patternRows);
  await supabase.from("global_benchmark_contributions").insert(benchmarkRows);
}

async function loadNetworkAggregates(): Promise<{
  aggregated: ReturnType<typeof aggregatePatterns>;
  contributorOrgCount: number;
  benchmarkNetwork: Array<{
    metricKey: string;
    value: number;
    organisationId: string;
  }>;
  networkUnavailable: boolean;
}> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      aggregated: [],
      contributorOrgCount: 0,
      benchmarkNetwork: [],
      networkUnavailable: true,
    };
  }

  const { data: patternRows } = await admin
    .from("global_pattern_contributions")
    .select(
      "pattern_key, pattern_text, industry_bucket, project_type_bucket, impact, confidence, organisation_id",
    )
    .order("contributed_at", { ascending: false })
    .limit(500);

  const { data: benchmarkRows } = await admin
    .from("global_benchmark_contributions")
    .select("metric_key, value, organisation_id")
    .order("contributed_at", { ascending: false })
    .limit(1000);

  const contributions = (patternRows ?? []).map((r) => ({
    patternKey: r.pattern_key as string,
    patternText: r.pattern_text as string,
    industryBucket: r.industry_bucket as string,
    projectTypeBucket: r.project_type_bucket as string,
    impact: Number(r.impact),
    confidence: Number(r.confidence),
    organisationId: r.organisation_id as string,
  }));

  const aggregated = aggregatePatterns(contributions);
  const contributorOrgCount = new Set(
    (patternRows ?? []).map((r) => r.organisation_id),
  ).size;

  const benchmarkNetwork = (benchmarkRows ?? []).map((r) => ({
    metricKey: r.metric_key as string,
    value: Number(r.value),
    organisationId: r.organisation_id as string,
  }));

  return {
    aggregated,
    contributorOrgCount,
    benchmarkNetwork,
    networkUnavailable: false,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function runGlobalLoop(): Promise<GlobalIntelligenceSnapshot> {
  const { supabase, orgId, industry, deliveryType } = await getContext();
  const localRaw = await loadLocalOrgMetrics(orgId, supabase, industry, deliveryType);
  const localMetrics = anonymize(localRaw);

  try {
    await contributeToNetwork(orgId, localMetrics, supabase);
  } catch {
    /* contribution tables may be missing in dev */
  }

  const { aggregated, contributorOrgCount, benchmarkNetwork, networkUnavailable } =
    await loadNetworkAggregates();

  const snapshot = runGlobalIntelligenceLoop({
    localMetrics,
    aggregatedPatterns: aggregated,
    contributorOrgCount,
    benchmarkNetwork,
  });

  return { ...snapshot, networkUnavailable };
}

export async function getGlobalPatterns(): Promise<GlobalPattern[]> {
  const snapshot = await runGlobalLoop();
  return snapshot.patterns;
}

export async function getGlobalBenchmarks(): Promise<BenchmarkMetric[]> {
  const snapshot = await runGlobalLoop();
  return snapshot.benchmarks;
}

export async function getGlobalGraph(): Promise<GlobalKnowledgeGraph> {
  const snapshot = await runGlobalLoop();
  return snapshot.graph;
}

/** Cron — anonymized pattern/benchmark contribution for every organisation. */
export async function captureAllGlobalContributions(): Promise<{
  contributed: number;
  orgs: number;
}> {
  const admin = createAdminClient();
  const { data: orgs, error } = await admin
    .from("organisations")
    .select("id, industry, delivery_type");
  if (error) throw error;

  let contributed = 0;
  for (const org of orgs ?? []) {
    try {
      const localRaw = await loadLocalOrgMetrics(
        org.id,
        admin,
        (org.industry as string | null) ?? null,
        (org.delivery_type as string | null) ?? null,
      );
      await contributeToNetwork(org.id, anonymize(localRaw), admin);
      contributed += 1;
    } catch {
      /* skip org on missing tables */
    }
  }

  return { contributed, orgs: orgs?.length ?? 0 };
}

export async function simulateCopilot(
  scenarioId: CopilotScenarioId,
): Promise<CopilotResult> {
  const { supabase, userId, orgId, industry, deliveryType } =
    await getContext();
  const localRaw = await loadLocalOrgMetrics(orgId, supabase, industry, deliveryType);
  const localMetrics = anonymize(localRaw);
  const { aggregated } = await loadNetworkAggregates();

  const result = strategicCopilot(scenarioId, localMetrics, aggregated);

  await supabase.from("global_copilot_runs").insert({
    organisation_id: orgId,
    scenario_id: scenarioId,
    input: { scenario: scenarioId },
    output: result,
    created_by: userId,
  });

  return result;
}

export { COPILOT_SCENARIOS };
export type {
  GlobalIntelligenceSnapshot,
  GlobalPattern,
  BenchmarkMetric,
  CopilotResult,
  CopilotScenarioId,
  TransformationEvolution,
};
