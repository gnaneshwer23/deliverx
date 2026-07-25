/**
 * Pure clone of a FrameworkVersionGraph into a new draft version.
 * Remaps all entity IDs; never mutates the source graph.
 */

import { randomUUID } from "node:crypto";
import type {
  FrameworkVersionGraph,
  FrameworkVersionSummary,
} from "@/lib/admin-framework/types";

function newId(): string {
  return randomUUID();
}

/**
 * Deep-clone graph content onto `targetVersion` with fresh UUIDs and remapped FKs.
 */
export function cloneFrameworkGraph(
  source: FrameworkVersionGraph,
  targetVersion: FrameworkVersionSummary,
): FrameworkVersionGraph {
  const vid = targetVersion.id;
  const idMap = new Map<string, string>();

  const mapId = (oldId: string): string => {
    const existing = idMap.get(oldId);
    if (existing) return existing;
    const next = newId();
    idMap.set(oldId, next);
    return next;
  };

  const roleFamilies = source.roleFamilies.map((f) => ({
    ...f,
    id: mapId(f.id),
    frameworkVersionId: vid,
  }));

  const seniorityLevels = source.seniorityLevels.map((s) => ({
    ...s,
    id: mapId(s.id),
    frameworkVersionId: vid,
  }));

  const competencies = source.competencies.map((c) => ({
    ...c,
    id: mapId(c.id),
    frameworkVersionId: vid,
  }));

  const indicators = source.indicators.map((i) => ({
    ...i,
    id: mapId(i.id),
    frameworkVersionId: vid,
    competencyId: mapId(i.competencyId),
  }));

  const roles = source.roles.map((r) => ({
    ...r,
    id: mapId(r.id),
    frameworkVersionId: vid,
    roleFamilyId: mapId(r.roleFamilyId),
    seniorityLevelId: mapId(r.seniorityLevelId),
  }));

  const rubricAnchors = source.rubricAnchors.map((a) => ({
    ...a,
    id: mapId(a.id),
    frameworkVersionId: vid,
    indicatorId: mapId(a.indicatorId),
  }));

  const assessmentContent = source.assessmentContent.map((c) => ({
    ...c,
    id: mapId(c.id),
    frameworkVersionId: vid,
    competencyIds: c.competencyIds.map(mapId),
    indicatorIds: c.indicatorIds.map(mapId),
    payload: { ...c.payload },
  }));

  const evidenceRules = source.evidenceRules.map((e) => ({
    ...e,
    id: mapId(e.id),
    frameworkVersionId: vid,
    competencyId: e.competencyId ? mapId(e.competencyId) : null,
    indicatorId: e.indicatorId ? mapId(e.indicatorId) : null,
    sourceTypeHints: [...e.sourceTypeHints],
    rule: { ...e.rule },
  }));

  const portfolioExpectations = source.portfolioExpectations.map((p) => ({
    ...p,
    id: mapId(p.id),
    frameworkVersionId: vid,
    roleId: p.roleId ? mapId(p.roleId) : null,
  }));

  const readinessRequirements = source.readinessRequirements.map((r) => ({
    ...r,
    id: mapId(r.id),
    frameworkVersionId: vid,
    roleId: mapId(r.roleId),
    competencyId: mapId(r.competencyId),
  }));

  return {
    version: targetVersion,
    roleFamilies,
    seniorityLevels,
    roles,
    competencies,
    indicators,
    rubricAnchors,
    assessmentContent,
    evidenceRules,
    portfolioExpectations,
    readinessRequirements,
  };
}
