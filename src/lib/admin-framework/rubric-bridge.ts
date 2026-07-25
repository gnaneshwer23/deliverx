/**
 * Bridge admin framework graph ↔ pi_rubric_versions.anchors (capability engine).
 * Publish sync keeps dual-source compatible until Phase 2 migrates getRubric to DB.
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
