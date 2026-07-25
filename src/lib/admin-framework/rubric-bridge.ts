/**
 * Bridge admin framework graph ↔ pi_rubric_versions.anchors (capability engine).
 * Phase 2: resolveRubricDefinition prefers DB graph; in-code getRubric remains the pin fallback.
 */

import { createHash } from "node:crypto";
import type { RubricDefinition } from "@/lib/capability-engine/rubric";
import type {
  FrameworkCapabilityLevel,
  FrameworkVersionGraph,
} from "@/lib/admin-framework/types";
import { CAPABILITY_LEVELS } from "@/lib/admin-framework/types";

export type RubricAnchorsPayload = {
  levels: FrameworkCapabilityLevel[];
  indicators: Record<
    string,
    {
      competency_id: string;
      indicator_id: string;
      anchors: Record<FrameworkCapabilityLevel, string>;
    }
  >;
};

/** Convert a framework version graph into pi_rubric_versions.anchors jsonb shape. */
export function graphToRubricAnchorsPayload(
  graph: FrameworkVersionGraph,
): RubricAnchorsPayload {
  const competencyById = new Map(graph.competencies.map((c) => [c.id, c]));
  const indicators: RubricAnchorsPayload["indicators"] = {};

  for (const indicator of graph.indicators) {
    const competency = competencyById.get(indicator.competencyId);
    if (!competency) continue;

    const anchors = {} as Record<FrameworkCapabilityLevel, string>;
    for (const level of CAPABILITY_LEVELS) {
      const row = graph.rubricAnchors.find(
        (a) => a.indicatorId === indicator.id && a.level === level,
      );
      anchors[level] = row?.anchorText ?? "";
    }

    indicators[indicator.key] = {
      competency_id: competency.code,
      indicator_id: indicator.code,
      anchors,
    };
  }

  return {
    levels: [...CAPABILITY_LEVELS],
    indicators,
  };
}

/** Convert graph → RubricDefinition DTO used by the capability engine. */
export function graphToRubricDefinition(
  graph: FrameworkVersionGraph,
): RubricDefinition {
  const payload = graphToRubricAnchorsPayload(graph);
  const indicators: RubricDefinition["indicators"] = {};

  for (const [key, ind] of Object.entries(payload.indicators)) {
    indicators[key] = {
      competencyId: ind.competency_id,
      indicatorId: ind.indicator_id,
      anchors: ind.anchors,
    };
  }

  return {
    slug: graph.version.frameworkSlug,
    version: graph.version.version,
    title: graph.version.title,
    indicators,
  };
}

/**
 * Resolve a published framework version pin for ScoreRun persistence.
 * Prefers pi_cf_* published rows; returns null when DB graph is missing
 * (caller still persists rubric_slug + rubric_version from in-code rubric).
 */
export type FrameworkVersionPin = {
  frameworkVersionId: string;
  frameworkSlug: string;
  version: string;
  contentHash: string | null;
  source: "pi_cf_published";
};

export async function resolvePublishedFrameworkPin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  opts: { frameworkSlug: string; version: string },
): Promise<FrameworkVersionPin | null> {
  const { data: framework, error: fwErr } = await supabase
    .from("pi_cf_frameworks")
    .select("id, slug")
    .eq("slug", opts.frameworkSlug)
    .maybeSingle();

  if (fwErr || !framework?.id) return null;

  const { data: exact, error: exactErr } = await supabase
    .from("pi_cf_framework_versions")
    .select("id, version, content_hash, status, framework_id")
    .eq("framework_id", framework.id as string)
    .eq("version", opts.version)
    .maybeSingle();

  if (
    !exactErr &&
    exact?.id &&
    (exact.status === "published" || exact.status === "deprecated")
  ) {
    return {
      frameworkVersionId: exact.id as string,
      frameworkSlug: opts.frameworkSlug,
      version: exact.version as string,
      contentHash: (exact.content_hash as string | null) ?? null,
      source: "pi_cf_published",
    };
  }

  const { data: latestPublished, error: pubErr } = await supabase
    .from("pi_cf_framework_versions")
    .select("id, version, content_hash, status, framework_id")
    .eq("framework_id", framework.id as string)
    .in("status", ["published"])
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pubErr || !latestPublished?.id) return null;

  return {
    frameworkVersionId: latestPublished.id as string,
    frameworkSlug: opts.frameworkSlug,
    version: latestPublished.version as string,
    contentHash: (latestPublished.content_hash as string | null) ?? null,
    source: "pi_cf_published",
  };
}

/** Stable content hash for publish freeze / audit. */
export function hashFrameworkGraphContent(graph: FrameworkVersionGraph): string {
  const payload = {
    roles: graph.roles.map((r) => ({
      slug: r.slug,
      title: r.title,
      family: r.roleFamilyId,
      seniority: r.seniorityLevelId,
      industryFit: r.industryFit,
    })),
    competencies: graph.competencies.map((c) => ({
      code: c.code,
      title: c.title,
    })),
    indicators: graph.indicators.map((i) => ({
      code: i.code,
      key: i.key,
      competencyId: i.competencyId,
    })),
    anchors: graph.rubricAnchors
      .map((a) => ({
        indicatorId: a.indicatorId,
        level: a.level,
        text: a.anchorText,
      }))
      .sort((a, b) =>
        `${a.indicatorId}:${a.level}`.localeCompare(`${b.indicatorId}:${b.level}`),
      ),
    readiness: graph.readinessRequirements.map((r) => ({
      roleId: r.roleId,
      competencyId: r.competencyId,
      minLevel: r.minLevel,
      weight: r.weight,
    })),
    evidenceRules: graph.evidenceRules.map((e) => ({
      slug: e.slug,
      rule: e.rule,
      sourceTypeHints: e.sourceTypeHints,
    })),
  };

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
