/**
 * Resolve a RubricDefinition from the published pi_cf_* graph, with in-code fallback.
 * Phase 2 bridge — DB is preferred when a published graph has anchors; otherwise pin to code.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  graphToRubricDefinition,
  resolvePublishedFrameworkPin,
} from "@/lib/admin-framework/rubric-bridge";
import type { FrameworkVersionGraph } from "@/lib/admin-framework/types";
import {
  getRubric,
  type RubricDefinition,
} from "@/lib/capability-engine/rubric";

export type ResolvedRubric = {
  rubric: RubricDefinition;
  source: "db" | "in_code";
  frameworkVersionId: string | null;
  contentHash: string | null;
};

/**
 * Prefer DB-backed rubric from a published framework version; fall back to in-code.
 * When DB graph has no indicators/anchors, keep the in-code pin (dual-source safety).
 */
export async function resolveRubricDefinition(
  supabase: SupabaseClient,
  opts: {
    frameworkSlug: string;
    version: string;
    frameworkVersionId?: string | null;
  },
): Promise<ResolvedRubric> {
  const inCode = getRubric(opts.frameworkSlug, opts.version);

  const pin =
    opts.frameworkVersionId != null
      ? {
          frameworkVersionId: opts.frameworkVersionId,
          frameworkSlug: opts.frameworkSlug,
          version: opts.version,
          contentHash: null as string | null,
          source: "pi_cf_published" as const,
        }
      : await resolvePublishedFrameworkPin(supabase, {
          frameworkSlug: opts.frameworkSlug,
          version: opts.version,
        });

  if (!pin?.frameworkVersionId) {
    if (!inCode) {
      throw new Error(`unknown_rubric:${opts.frameworkSlug}@${opts.version}`);
    }
    return {
      rubric: inCode,
      source: "in_code",
      frameworkVersionId: null,
      contentHash: null,
    };
  }

  try {
    // Candidate-facing path: read tables directly (RLS allows published reads).
    // Avoid admin store which requires org admin + service role.
    const dbRubric = await loadRubricFromPublishedVersion(
      supabase,
      pin.frameworkVersionId,
      pin.frameworkSlug,
      pin.version,
    );
    if (dbRubric && Object.keys(dbRubric.indicators).length > 0) {
      return {
        rubric: dbRubric,
        source: "db",
        frameworkVersionId: pin.frameworkVersionId,
        contentHash: pin.contentHash,
      };
    }
  } catch {
    // fall through to in-code
  }

  if (!inCode) {
    throw new Error(`unknown_rubric:${opts.frameworkSlug}@${opts.version}`);
  }
  return {
    rubric: inCode,
    source: "in_code",
    frameworkVersionId: pin.frameworkVersionId,
    contentHash: pin.contentHash,
  };
}

async function loadRubricFromPublishedVersion(
  supabase: SupabaseClient,
  frameworkVersionId: string,
  frameworkSlug: string,
  version: string,
): Promise<RubricDefinition | null> {
  const [{ data: versionRow }, { data: competencies }, { data: indicators }, { data: anchors }] =
    await Promise.all([
      supabase
        .from("pi_cf_framework_versions")
        .select("id, version, title, status, framework_id")
        .eq("id", frameworkVersionId)
        .maybeSingle(),
      supabase
        .from("pi_cf_competencies")
        .select("id, code, title")
        .eq("framework_version_id", frameworkVersionId),
      supabase
        .from("pi_cf_indicators")
        .select("id, competency_id, code, key, title")
        .eq("framework_version_id", frameworkVersionId),
      supabase
        .from("pi_cf_rubric_anchors")
        .select("indicator_id, level, anchor_text")
        .eq("framework_version_id", frameworkVersionId),
    ]);

  if (!versionRow?.id || !["published", "deprecated"].includes(versionRow.status as string)) {
    return null;
  }
  if (!indicators?.length || !anchors?.length) return null;

  // Minimal graph shape for graphToRubricDefinition
  const graph: FrameworkVersionGraph = {
    version: {
      id: versionRow.id as string,
      frameworkId: versionRow.framework_id as string,
      frameworkSlug,
      version: (versionRow.version as string) || version,
      title: (versionRow.title as string) || `${frameworkSlug} ${version}`,
      status: versionRow.status as FrameworkVersionGraph["version"]["status"],
      changelog: "",
      contentHash: null,
      rubricVersionId: null,
      publishedAt: null,
      supersededBy: null,
      createdAt: "",
      updatedAt: "",
    },
    roleFamilies: [],
    seniorityLevels: [],
    roles: [],
    competencies: (competencies ?? []).map((c) => ({
      id: c.id as string,
      frameworkVersionId,
      code: c.code as string,
      title: (c.title as string) || (c.code as string),
      description: "",
      sortOrder: 0,
    })),
    indicators: (indicators ?? []).map((i) => ({
      id: i.id as string,
      frameworkVersionId,
      competencyId: i.competency_id as string,
      code: i.code as string,
      key: i.key as string,
      title: (i.title as string) || (i.key as string),
      description: "",
      sortOrder: 0,
    })),
    rubricAnchors: (anchors ?? []).map((a) => ({
      id: `${a.indicator_id}:${a.level}`,
      frameworkVersionId,
      indicatorId: a.indicator_id as string,
      level: a.level as FrameworkVersionGraph["rubricAnchors"][number]["level"],
      anchorText: (a.anchor_text as string) || "",
    })),
    assessmentContent: [],
    evidenceRules: [],
    portfolioExpectations: [],
    readinessRequirements: [],
  };

  return graphToRubricDefinition(graph);
}

/** Test helper — sync only; does not hit DB. */
export function resolveRubricFromCode(
  frameworkSlug: string,
  version: string,
): RubricDefinition | null {
  return getRubric(frameworkSlug, version);
}
