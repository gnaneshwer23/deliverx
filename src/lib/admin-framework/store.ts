/**
 * Admin competency framework persistence against pi_cf_* tables.
 * Writes use service-role client (no authenticated write RLS policies).
 * Published versions are immutable — clone + publish only.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { cloneFrameworkGraph } from "@/lib/admin-framework/clone-graph";
import {
  assertFrameworkStatusTransition,
} from "@/lib/admin-framework/lifecycle";
import { planPublish } from "@/lib/admin-framework/immutability";
import {
  graphToRubricAnchorsPayload,
  hashFrameworkGraphContent,
} from "@/lib/admin-framework/rubric-bridge";
import type {
  CreateFrameworkVersionRequest,
  FrameworkAuditEvent,
  FrameworkPublicationStatus,
  FrameworkSummary,
  FrameworkVersionGraph,
  FrameworkVersionSummary,
  ListFrameworkVersionsResponse,
  PublishFrameworkVersionRequest,
} from "@/lib/admin-framework/types";

export type StoreResult<T> = { data: T | null; error: string | null; code?: string };

function mapFramework(row: Record<string, unknown>): FrameworkSummary {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
  };
}

function mapVersion(
  row: Record<string, unknown>,
  frameworkSlug: string,
): FrameworkVersionSummary {
  return {
    id: row.id as string,
    frameworkId: row.framework_id as string,
    frameworkSlug,
    version: row.version as string,
    title: row.title as string,
    status: row.status as FrameworkPublicationStatus,
    changelog: (row.changelog as string) ?? "",
    contentHash: (row.content_hash as string | null) ?? null,
    rubricVersionId: (row.rubric_version_id as string | null) ?? null,
    publishedAt: (row.published_at as string | null) ?? null,
    supersededBy: (row.superseded_by as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function appendFrameworkAuditEvent(
  supabase: SupabaseClient,
  input: {
    frameworkVersionId: string | null;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    beforeState?: unknown;
    afterState?: unknown;
    metadata?: Record<string, unknown>;
  },
): Promise<StoreResult<FrameworkAuditEvent>> {
  const { data, error } = await supabase
    .from("pi_cf_audit_events")
    .insert({
      framework_version_id: input.frameworkVersionId,
      actor_id: input.actorId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      before_state: input.beforeState ?? null,
      after_state: input.afterState ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };
  const row = data as Record<string, unknown>;
  return {
    data: {
      id: row.id as string,
      frameworkVersionId: (row.framework_version_id as string | null) ?? null,
      actorId: (row.actor_id as string | null) ?? null,
      action: row.action as string,
      entityType: row.entity_type as string,
      entityId: (row.entity_id as string | null) ?? null,
      beforeState: row.before_state,
      afterState: row.after_state,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.created_at as string,
    },
    error: null,
  };
}

export async function listFrameworkVersions(
  supabase: SupabaseClient,
  opts?: { frameworkSlug?: string; status?: FrameworkPublicationStatus[] },
): Promise<StoreResult<ListFrameworkVersionsResponse>> {
  let frameworksQuery = supabase.from("pi_cf_frameworks").select("*").order("slug");
  if (opts?.frameworkSlug) {
    frameworksQuery = frameworksQuery.eq("slug", opts.frameworkSlug);
  }
  const { data: frameworks, error: fwErr } = await frameworksQuery;
  if (fwErr) return { data: null, error: fwErr.message };

  const frameworkRows = (frameworks ?? []) as Record<string, unknown>[];
  const frameworkIds = frameworkRows.map((f) => f.id as string);
  if (!frameworkIds.length) {
    return { data: { frameworks: [], versions: [] }, error: null };
  }

  const slugById = new Map(
    frameworkRows.map((f) => [f.id as string, f.slug as string]),
  );

  let versionsQuery = supabase
    .from("pi_cf_framework_versions")
    .select("*")
    .in("framework_id", frameworkIds)
    .order("created_at", { ascending: false });

  if (opts?.status?.length) {
    versionsQuery = versionsQuery.in("status", opts.status);
  }

  const { data: versions, error: vErr } = await versionsQuery;
  if (vErr) return { data: null, error: vErr.message };

  return {
    data: {
      frameworks: frameworkRows.map(mapFramework),
      versions: ((versions ?? []) as Record<string, unknown>[]).map((row) =>
        mapVersion(row, slugById.get(row.framework_id as string) ?? "unknown"),
      ),
    },
    error: null,
  };
}

async function loadVersionRow(
  supabase: SupabaseClient,
  versionId: string,
): Promise<
  StoreResult<{ row: Record<string, unknown>; frameworkSlug: string }>
> {
  const { data, error } = await supabase
    .from("pi_cf_framework_versions")
    .select("*, pi_cf_frameworks!inner(slug)")
    .eq("id", versionId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "Framework version not found", code: "not_found" };

  const row = data as Record<string, unknown>;
  const fw = row.pi_cf_frameworks as { slug: string } | { slug: string }[];
  const frameworkSlug = Array.isArray(fw) ? fw[0]!.slug : fw.slug;
  return { data: { row, frameworkSlug }, error: null };
}

export async function getFrameworkVersionGraph(
  supabase: SupabaseClient,
  versionId: string,
): Promise<StoreResult<FrameworkVersionGraph>> {
  const loaded = await loadVersionRow(supabase, versionId);
  if (!loaded.data) return { data: null, error: loaded.error, code: loaded.code };

  const { row, frameworkSlug } = loaded.data;
  const version = mapVersion(row, frameworkSlug);
  const vid = version.id;

  const [
    families,
    seniorities,
    roles,
    competencies,
    indicators,
    anchors,
    assessment,
    evidence,
    portfolio,
    readiness,
  ] = await Promise.all([
    supabase.from("pi_cf_role_families").select("*").eq("framework_version_id", vid),
    supabase.from("pi_cf_seniority_levels").select("*").eq("framework_version_id", vid),
    supabase.from("pi_cf_roles").select("*").eq("framework_version_id", vid),
    supabase.from("pi_cf_competencies").select("*").eq("framework_version_id", vid),
    supabase.from("pi_cf_indicators").select("*").eq("framework_version_id", vid),
    supabase.from("pi_cf_rubric_anchors").select("*").eq("framework_version_id", vid),
    supabase.from("pi_cf_assessment_content").select("*").eq("framework_version_id", vid),
    supabase.from("pi_cf_evidence_rules").select("*").eq("framework_version_id", vid),
    supabase
      .from("pi_cf_portfolio_expectations")
      .select("*")
      .eq("framework_version_id", vid),
    supabase
      .from("pi_cf_readiness_requirements")
      .select("*")
      .eq("framework_version_id", vid),
  ]);

  const firstError =
    families.error?.message ??
    seniorities.error?.message ??
    roles.error?.message ??
    competencies.error?.message ??
    indicators.error?.message ??
    anchors.error?.message ??
    assessment.error?.message ??
    evidence.error?.message ??
    portfolio.error?.message ??
    readiness.error?.message;

  if (firstError) return { data: null, error: firstError };

  return {
    data: {
      version,
      roleFamilies: (families.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        slug: r.slug as string,
        title: r.title as string,
        description: (r.description as string) ?? "",
        sortOrder: (r.sort_order as number) ?? 0,
      })),
      seniorityLevels: (seniorities.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        slug: r.slug as string,
        title: r.title as string,
        rank: (r.rank as number) ?? 0,
      })),
      roles: (roles.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        roleFamilyId: r.role_family_id as string,
        seniorityLevelId: r.seniority_level_id as string,
        slug: r.slug as string,
        title: r.title as string,
        industryFit: (r.industry_fit as string[]) ?? [],
        description: (r.description as string) ?? "",
      })),
      competencies: (competencies.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        code: r.code as string,
        title: r.title as string,
        description: (r.description as string) ?? "",
        sortOrder: (r.sort_order as number) ?? 0,
      })),
      indicators: (indicators.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        competencyId: r.competency_id as string,
        code: r.code as string,
        key: r.key as string,
        title: r.title as string,
        description: (r.description as string) ?? "",
        sortOrder: (r.sort_order as number) ?? 0,
      })),
      rubricAnchors: (anchors.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        indicatorId: r.indicator_id as string,
        level: r.level as FrameworkVersionGraph["rubricAnchors"][number]["level"],
        anchorText: r.anchor_text as string,
      })),
      assessmentContent: (assessment.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        kind: r.kind as FrameworkVersionGraph["assessmentContent"][number]["kind"],
        slug: r.slug as string,
        title: r.title as string,
        body: (r.body as string) ?? "",
        payload: (r.payload as Record<string, unknown>) ?? {},
        competencyIds: (r.competency_ids as string[]) ?? [],
        indicatorIds: (r.indicator_ids as string[]) ?? [],
        sortOrder: (r.sort_order as number) ?? 0,
      })),
      evidenceRules: (evidence.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        slug: r.slug as string,
        title: r.title as string,
        sourceTypeHints: (r.source_type_hints as string[]) ?? [],
        competencyId: (r.competency_id as string | null) ?? null,
        indicatorId: (r.indicator_id as string | null) ?? null,
        rule: (r.rule as Record<string, unknown>) ?? {},
        weight: Number(r.weight ?? 1),
      })),
      portfolioExpectations: (portfolio.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        roleId: (r.role_id as string | null) ?? null,
        slug: r.slug as string,
        title: r.title as string,
        expectation: r.expectation as string,
        required: Boolean(r.required),
      })),
      readinessRequirements: (readiness.data ?? []).map((r) => ({
        id: r.id as string,
        frameworkVersionId: r.framework_version_id as string,
        roleId: r.role_id as string,
        competencyId: r.competency_id as string,
        minLevel:
          r.min_level as FrameworkVersionGraph["readinessRequirements"][number]["minLevel"],
        weight: Number(r.weight ?? 1),
      })),
    },
    error: null,
  };
}

async function insertGraphContent(
  supabase: SupabaseClient,
  graph: FrameworkVersionGraph,
): Promise<StoreResult<true>> {
  const vid = graph.version.id;

  const insert = async (
    table: string,
    rows: Record<string, unknown>[],
  ): Promise<string | null> => {
    if (!rows.length) return null;
    const { error } = await supabase.from(table).insert(rows);
    return error?.message ?? null;
  };

  const err =
    (await insert(
      "pi_cf_role_families",
      graph.roleFamilies.map((f) => ({
        id: f.id,
        framework_version_id: vid,
        slug: f.slug,
        title: f.title,
        description: f.description,
        sort_order: f.sortOrder,
      })),
    )) ??
    (await insert(
      "pi_cf_seniority_levels",
      graph.seniorityLevels.map((s) => ({
        id: s.id,
        framework_version_id: vid,
        slug: s.slug,
        title: s.title,
        rank: s.rank,
      })),
    )) ??
    (await insert(
      "pi_cf_competencies",
      graph.competencies.map((c) => ({
        id: c.id,
        framework_version_id: vid,
        code: c.code,
        title: c.title,
        description: c.description,
        sort_order: c.sortOrder,
      })),
    )) ??
    (await insert(
      "pi_cf_indicators",
      graph.indicators.map((i) => ({
        id: i.id,
        framework_version_id: vid,
        competency_id: i.competencyId,
        code: i.code,
        key: i.key,
        title: i.title,
        description: i.description,
        sort_order: i.sortOrder,
      })),
    )) ??
    (await insert(
      "pi_cf_rubric_anchors",
      graph.rubricAnchors.map((a) => ({
        id: a.id,
        framework_version_id: vid,
        indicator_id: a.indicatorId,
        level: a.level,
        anchor_text: a.anchorText,
      })),
    )) ??
    (await insert(
      "pi_cf_roles",
      graph.roles.map((r) => ({
        id: r.id,
        framework_version_id: vid,
        role_family_id: r.roleFamilyId,
        seniority_level_id: r.seniorityLevelId,
        slug: r.slug,
        title: r.title,
        industry_fit: r.industryFit,
        description: r.description,
      })),
    )) ??
    (await insert(
      "pi_cf_assessment_content",
      graph.assessmentContent.map((c) => ({
        id: c.id,
        framework_version_id: vid,
        kind: c.kind,
        slug: c.slug,
        title: c.title,
        body: c.body,
        payload: c.payload,
        competency_ids: c.competencyIds,
        indicator_ids: c.indicatorIds,
        sort_order: c.sortOrder,
      })),
    )) ??
    (await insert(
      "pi_cf_evidence_rules",
      graph.evidenceRules.map((e) => ({
        id: e.id,
        framework_version_id: vid,
        slug: e.slug,
        title: e.title,
        source_type_hints: e.sourceTypeHints,
        competency_id: e.competencyId,
        indicator_id: e.indicatorId,
        rule: e.rule,
        weight: e.weight,
      })),
    )) ??
    (await insert(
      "pi_cf_portfolio_expectations",
      graph.portfolioExpectations.map((p) => ({
        id: p.id,
        framework_version_id: vid,
        role_id: p.roleId,
        slug: p.slug,
        title: p.title,
        expectation: p.expectation,
        required: p.required,
      })),
    )) ??
    (await insert(
      "pi_cf_readiness_requirements",
      graph.readinessRequirements.map((r) => ({
        id: r.id,
        framework_version_id: vid,
        role_id: r.roleId,
        competency_id: r.competencyId,
        min_level: r.minLevel,
        weight: r.weight,
      })),
    ));

  if (err) return { data: null, error: err };
  return { data: true, error: null };
}

/**
 * Create a new draft version. Optionally clones content from an existing version.
 * Never mutates published source rows.
 */
export async function createFrameworkVersion(
  supabase: SupabaseClient,
  input: CreateFrameworkVersionRequest & { actorId?: string | null },
): Promise<StoreResult<FrameworkVersionSummary>> {
  const { data: framework, error: fwErr } = await supabase
    .from("pi_cf_frameworks")
    .select("*")
    .eq("slug", input.frameworkSlug)
    .maybeSingle();

  if (fwErr) return { data: null, error: fwErr.message };
  if (!framework) {
    return {
      data: null,
      error: `Framework "${input.frameworkSlug}" not found`,
      code: "not_found",
    };
  }

  let sourceGraph: FrameworkVersionGraph | null = null;
  if (input.cloneFromVersionId) {
    const loaded = await getFrameworkVersionGraph(
      supabase,
      input.cloneFromVersionId,
    );
    if (!loaded.data) {
      return { data: null, error: loaded.error, code: loaded.code };
    }
    sourceGraph = loaded.data;
  }

  const now = new Date().toISOString();
  const { data: created, error: createErr } = await supabase
    .from("pi_cf_framework_versions")
    .insert({
      framework_id: framework.id,
      version: input.version,
      title: input.title,
      status: "draft",
      changelog: input.changelog ?? "",
      created_by: input.actorId ?? null,
    })
    .select("*")
    .single();

  if (createErr) return { data: null, error: createErr.message };

  const version = mapVersion(
    created as Record<string, unknown>,
    input.frameworkSlug,
  );

  if (sourceGraph) {
    const cloned = cloneFrameworkGraph(sourceGraph, version);
    const inserted = await insertGraphContent(supabase, cloned);
    if (inserted.error) {
      return { data: null, error: inserted.error };
    }
  }

  await appendFrameworkAuditEvent(supabase, {
    frameworkVersionId: version.id,
    actorId: input.actorId ?? null,
    action: sourceGraph ? "version.cloned" : "version.created",
    entityType: "framework_version",
    entityId: version.id,
    afterState: { version: version.version, status: "draft" },
    metadata: {
      cloneFromVersionId: input.cloneFromVersionId ?? null,
    },
  });

  return { data: { ...version, createdAt: version.createdAt || now }, error: null };
}

export async function transitionFrameworkVersionStatus(
  supabase: SupabaseClient,
  input: {
    versionId: string;
    toStatus: FrameworkPublicationStatus;
    actorId?: string | null;
    note?: string;
  },
): Promise<
  StoreResult<{ version: FrameworkVersionSummary; auditEventId: string }>
> {
  const loaded = await loadVersionRow(supabase, input.versionId);
  if (!loaded.data) return { data: null, error: loaded.error, code: loaded.code };

  const { row, frameworkSlug } = loaded.data;
  const current = mapVersion(row, frameworkSlug);

  if (input.toStatus === "published") {
    return {
      data: null,
      error: "Use publishFrameworkVersion for publish transitions",
      code: "validation_failed",
    };
  }

  const transition = assertFrameworkStatusTransition(current.status, input.toStatus);
  if (!transition.ok) {
    return { data: null, error: transition.message, code: "invalid_transition" };
  }

  const patch: Record<string, unknown> = {
    status: input.toStatus,
    updated_at: new Date().toISOString(),
  };
  if (input.toStatus === "deprecated") {
    patch.deprecated_at = new Date().toISOString();
  }
  if (input.toStatus === "archived") {
    patch.archived_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from("pi_cf_framework_versions")
    .update(patch)
    .eq("id", input.versionId)
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };

  const version = mapVersion(updated as Record<string, unknown>, frameworkSlug);
  const audit = await appendFrameworkAuditEvent(supabase, {
    frameworkVersionId: version.id,
    actorId: input.actorId ?? null,
    action: "version.status_transition",
    entityType: "framework_version",
    entityId: version.id,
    beforeState: { status: current.status },
    afterState: { status: version.status },
    metadata: { note: input.note ?? null },
  });

  return {
    data: { version, auditEventId: audit.data?.id ?? "" },
    error: null,
  };
}

/**
 * Publish a mutable version: validate → freeze → sync pi_rubric_versions anchors.
 */
export async function publishFrameworkVersion(
  supabase: SupabaseClient,
  input: PublishFrameworkVersionRequest & {
    versionId: string;
    actorId?: string | null;
  },
): Promise<
  StoreResult<{
    version: FrameworkVersionSummary;
    rubricVersionId: string;
    auditEventId: string;
  }>
> {
  const graphResult = await getFrameworkVersionGraph(supabase, input.versionId);
  if (!graphResult.data) {
    return { data: null, error: graphResult.error, code: graphResult.code };
  }

  const graph = graphResult.data;
  const planned = planPublish({
    graph,
    confirmImmutable: input.confirmImmutable,
    acknowledgedWarningIds: input.acknowledgedWarningIds,
  });

  if (!planned.ok) {
    return {
      data: null,
      error: planned.message,
      code: planned.code,
    };
  }

  const anchorsPayload = graphToRubricAnchorsPayload(graph);
  const contentHash = hashFrameworkGraphContent(graph);
  const changelog = input.changelog ?? graph.version.changelog;

  // Upsert bridge rubric row (engine dual-source during migration).
  const { data: existingRubric } = await supabase
    .from("pi_rubric_versions")
    .select("id")
    .eq("slug", graph.version.frameworkSlug)
    .eq("version", graph.version.version)
    .maybeSingle();

  let rubricVersionId: string;
  if (existingRubric?.id) {
    const { data: updated, error } = await supabase
      .from("pi_rubric_versions")
      .update({
        title: graph.version.title,
        anchors: anchorsPayload,
        status: "published",
      })
      .eq("id", existingRubric.id)
      .select("id")
      .single();
    if (error) return { data: null, error: error.message };
    rubricVersionId = updated.id as string;
  } else {
    const { data: inserted, error } = await supabase
      .from("pi_rubric_versions")
      .insert({
        slug: graph.version.frameworkSlug,
        version: graph.version.version,
        title: graph.version.title,
        anchors: anchorsPayload,
        status: "published",
      })
      .select("id")
      .single();
    if (error) return { data: null, error: error.message };
    rubricVersionId = inserted.id as string;
  }

  const publishedAt = new Date().toISOString();
  const { data: updatedVersion, error: versionErr } = await supabase
    .from("pi_cf_framework_versions")
    .update({
      status: "published",
      changelog,
      content_hash: contentHash,
      rubric_version_id: rubricVersionId,
      published_at: publishedAt,
      published_by: input.actorId ?? null,
      updated_at: publishedAt,
    })
    .eq("id", input.versionId)
    .select("*")
    .single();

  if (versionErr) return { data: null, error: versionErr.message };

  const version = mapVersion(
    updatedVersion as Record<string, unknown>,
    graph.version.frameworkSlug,
  );

  const audit = await appendFrameworkAuditEvent(supabase, {
    frameworkVersionId: version.id,
    actorId: input.actorId ?? null,
    action: "version.published",
    entityType: "framework_version",
    entityId: version.id,
    beforeState: { status: graph.version.status },
    afterState: {
      status: "published",
      contentHash,
      rubricVersionId,
    },
  });

  return {
    data: {
      version,
      rubricVersionId,
      auditEventId: audit.data?.id ?? "",
    },
    error: null,
  };
}
