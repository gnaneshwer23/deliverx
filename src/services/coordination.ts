/**
 * Coordination façade — Phase 9.
 *
 * Loads org-wide telemetry, builds the knowledge graph, runs the
 * agent orchestration engine, and persists coordination snapshots.
 * Also hosts ecosystem partner + marketplace persistence.
 */

import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "./projectSignals";
import { computeProjectHealth } from "./intelligenceEngine";
import {
  listDependencies,
  listProgrammes,
  listProjectsForOrg,
} from "./portfolio";
import { getTwinState } from "./twin";
import {
  buildKnowledgeGraph,
  processSignals,
  runCoordinationLoop,
  type CoordinationSnapshot,
  type EcosystemPartner,
  type KnowledgeGraph,
  type ProjectCoordinationSnapshot,
  type RawOperationalSignal,
  type SharedLink,
} from "./coordinationEngine";
import type { DependencyEdge } from "./dependencyEngine";

// ---------------------------------------------------------------------------
// DB row types
// ---------------------------------------------------------------------------

export type PartnerRow = {
  id: string;
  organisation_id: string;
  name: string;
  partner_type: "client" | "vendor" | "consulting_partner";
  status: string;
  created_at: string;
};

export type SharedLinkRow = {
  id: string;
  organisation_id: string;
  partner_id: string;
  project_id: string | null;
  label: string;
  link_type: "shared_project" | "shared_dependency";
  meta: Record<string, unknown>;
  created_at: string;
};

export type MarketplaceAssetRow = {
  id: string;
  organisation_id: string;
  asset_type:
    | "playbook"
    | "governance_template"
    | "risk_library"
    | "delivery_framework";
  title: string;
  description: string | null;
  content: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .single();
  if (!profile?.organisation_id) throw new Error("No organisation");
  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
  };
}

// ---------------------------------------------------------------------------
// Context loader
// ---------------------------------------------------------------------------

async function loadCoordinationContext(): Promise<Parameters<
  typeof runCoordinationLoop
>[0]> {
  await getContext();

  let programmes: Array<{ id: string; name: string; status: string }> = [];
  try {
    const rows = await listProgrammes();
    programmes = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
    }));
  } catch {
    programmes = [];
  }

  const projectRows = await listProjectsForOrg();
  const programmeNameById = new Map(programmes.map((p) => [p.id, p.name]));

  const projects: ProjectCoordinationSnapshot[] = [];
  const rawSignals: RawOperationalSignal[] = [];

  for (const row of projectRows) {
    const signals = await loadProjectSignals(row.id);
    const health = computeProjectHealth(signals);
    const velocityChange = signals.velocity - 0.85;
    const blockerSpike = signals.blockers > 5;
    const governanceDelay = signals.milestoneDelay
      ? 6
      : signals.overdueTasks > 6
        ? 4
        : 1;
    const executionFatigue = clamp01(
      signals.overdueTasks / Math.max(signals.totalTasks, 1) +
        (1 - signals.velocity) * 0.5,
    );

    projects.push({
      id: row.id,
      name: row.name,
      programmeId: row.programme_id,
      programmeName: row.programme_id
        ? (programmeNameById.get(row.programme_id) ?? null)
        : null,
      health: health.score,
      blockers: signals.blockers,
      milestoneDelay: signals.milestoneDelay,
      dependencyFailure: signals.dependencyDelay,
    });

    rawSignals.push({
      projectId: row.id,
      projectName: row.name,
      velocity: signals.velocity,
      velocityChange,
      blockers: signals.blockers,
      blockerSpike,
      governanceDelay,
      dependencyFailure: signals.dependencyDelay,
      executionFatigue,
      health: health.score,
      milestoneDelay: signals.milestoneDelay,
    });
  }

  let dependencies: DependencyEdge[] = [];
  try {
    const deps = await listDependencies();
    dependencies = deps.map((d) => ({
      id: d.id,
      sourceProjectId: d.source_project_id,
      targetProjectId: d.target_project_id,
      type: d.dependency_type,
      severity: d.severity,
    }));
  } catch {
    dependencies = [];
  }

  const partners = await listPartners();
  const sharedLinks = await listSharedLinks(partners);

  const twinState = await getTwinState().catch(() => null);
  const twinMetrics = {
    governanceLatency: twinState?.systemMetrics.governanceLatency ?? 0.4,
    executionPressure: twinState?.systemMetrics.executionPressure ?? 0.35,
    coordinationEfficiency:
      twinState?.behavioralPatterns.coordinationEfficiency ?? 0.65,
  };

  const signals = processSignals(rawSignals);
  const graph = buildKnowledgeGraph({
    projects,
    programmes,
    dependencies,
    partners,
    sharedLinks,
    rawSignals,
  });

  return {
    signals,
    rawSignals,
    graph,
    projects,
    programmes,
    dependencies,
    partners,
    sharedLinks,
    twinMetrics,
  };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

// ---------------------------------------------------------------------------
// Public orchestration
// ---------------------------------------------------------------------------

export async function runEnterpriseCoordinationLoop(): Promise<CoordinationSnapshot> {
  const ctx = await loadCoordinationContext();
  return runCoordinationLoop(ctx);
}

export async function getKnowledgeGraph(): Promise<KnowledgeGraph> {
  const ctx = await loadCoordinationContext();
  return ctx.graph;
}

export async function saveCoordinationRun(): Promise<{ id: string } | null> {
  const { supabase, userId, orgId } = await getContext();
  const snapshot = await runEnterpriseCoordinationLoop();

  const { data, error } = await supabase
    .from("coordination_runs")
    .insert({
      organisation_id: orgId,
      snapshot,
      captured_by: userId,
    })
    .select("id")
    .single();

  if (error) return null;
  return data as { id: string };
}

export async function listCoordinationRuns(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coordination_runs")
    .select("id, captured_at, snapshot")
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    captured_at: string;
    snapshot: CoordinationSnapshot;
  }>;
}

// ---------------------------------------------------------------------------
// Ecosystem partners
// ---------------------------------------------------------------------------

export async function listPartners(): Promise<EcosystemPartner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ecosystem_partners")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return [];
  return ((data ?? []) as PartnerRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    partnerType: p.partner_type,
    status: p.status,
  }));
}

async function listSharedLinks(
  partners: EcosystemPartner[],
): Promise<SharedLink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ecosystem_shared_links")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];

  const partnerNameById = new Map(partners.map((p) => [p.id, p.name]));

  return ((data ?? []) as SharedLinkRow[]).map((l) => ({
    id: l.id,
    partnerId: l.partner_id,
    partnerName: partnerNameById.get(l.partner_id) ?? "Partner",
    projectId: l.project_id,
    label: l.label,
    linkType: l.link_type,
    delayed: Boolean((l.meta as { delayed?: boolean })?.delayed),
  }));
}

export async function createPartner(input: {
  name: string;
  partnerType: PartnerRow["partner_type"];
}) {
  const { supabase, userId, orgId } = await getContext();
  const { data, error } = await supabase
    .from("ecosystem_partners")
    .insert({
      organisation_id: orgId,
      name: input.name,
      partner_type: input.partnerType,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as PartnerRow;
}

export async function createSharedLink(input: {
  partnerId: string;
  label: string;
  linkType: SharedLinkRow["link_type"];
  projectId?: string | null;
  delayed?: boolean;
}) {
  const { supabase, orgId } = await getContext();
  const { data, error } = await supabase
    .from("ecosystem_shared_links")
    .insert({
      organisation_id: orgId,
      partner_id: input.partnerId,
      project_id: input.projectId ?? null,
      label: input.label,
      link_type: input.linkType,
      meta: { delayed: input.delayed ?? false },
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as SharedLinkRow;
}

// ---------------------------------------------------------------------------
// Marketplace
// ---------------------------------------------------------------------------

export async function listMarketplaceAssets(opts: {
  includePublic?: boolean;
  assetType?: MarketplaceAssetRow["asset_type"];
} = {}) {
  const supabase = await createClient();
  let q = supabase
    .from("marketplace_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts.assetType) q = q.eq("asset_type", opts.assetType);

  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as MarketplaceAssetRow[];
}

export async function shareMarketplaceAsset(input: {
  assetType: MarketplaceAssetRow["asset_type"];
  title: string;
  description?: string;
  content?: Record<string, unknown>;
  isPublic?: boolean;
}) {
  const { supabase, userId, orgId } = await getContext();
  const { data, error } = await supabase
    .from("marketplace_assets")
    .insert({
      organisation_id: orgId,
      asset_type: input.assetType,
      title: input.title,
      description: input.description ?? null,
      content: input.content ?? {},
      is_public: input.isPublic ?? false,
      created_by: userId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as MarketplaceAssetRow;
}

export type { CoordinationSnapshot, KnowledgeGraph };
