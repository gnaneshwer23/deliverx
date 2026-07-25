import {
  CAPABILITY_LEVELS,
  type FrameworkValidationIssue,
  type FrameworkVersionGraph,
  type ValidateFrameworkVersionResponse,
} from "@/lib/admin-framework/types";
import { isMutableFrameworkStatus } from "@/lib/admin-framework/lifecycle";

/**
 * Structural validation before Internal Review / Calibration / Publish.
 * Errors block transitions; warnings require acknowledgement on publish.
 */
export function validateFrameworkVersionGraph(
  graph: FrameworkVersionGraph,
): ValidateFrameworkVersionResponse {
  const errors: FrameworkValidationIssue[] = [];
  const warnings: FrameworkValidationIssue[] = [];

  const competencyById = new Map(graph.competencies.map((c) => [c.id, c]));
  const indicatorById = new Map(graph.indicators.map((i) => [i.id, i]));
  const roleById = new Map(graph.roles.map((r) => [r.id, r]));
  const familyIds = new Set(graph.roleFamilies.map((f) => f.id));
  const seniorityIds = new Set(graph.seniorityLevels.map((s) => s.id));

  if (graph.competencies.length === 0) {
    errors.push({
      id: "err.no_competencies",
      code: "NO_COMPETENCIES",
      severity: "error",
      path: "competencies",
      message: "At least one competency is required before publish.",
    });
  }

  if (graph.roles.length === 0) {
    errors.push({
      id: "err.no_roles",
      code: "NO_ROLES",
      severity: "error",
      path: "roles",
      message: "At least one role is required (replaces hard-coded CAREER_ROLE_CATALOGUE).",
    });
  }

  for (const role of graph.roles) {
    if (!familyIds.has(role.roleFamilyId)) {
      errors.push({
        id: `err.role_family.${role.slug}`,
        code: "ROLE_MISSING_FAMILY",
        severity: "error",
        path: `roles.${role.slug}.roleFamilyId`,
        message: `Role "${role.title}" references a missing role family.`,
        dependency: {
          entityType: "role_family",
          entityId: role.roleFamilyId,
          label: role.roleFamilyId,
        },
      });
    }
    if (!seniorityIds.has(role.seniorityLevelId)) {
      errors.push({
        id: `err.role_seniority.${role.slug}`,
        code: "ROLE_MISSING_SENIORITY",
        severity: "error",
        path: `roles.${role.slug}.seniorityLevelId`,
        message: `Role "${role.title}" references a missing seniority level.`,
      });
    }
  }

  for (const indicator of graph.indicators) {
    if (!competencyById.has(indicator.competencyId)) {
      errors.push({
        id: `err.indicator_competency.${indicator.key}`,
        code: "INDICATOR_MISSING_COMPETENCY",
        severity: "error",
        path: `indicators.${indicator.key}.competencyId`,
        message: `Indicator "${indicator.title}" references a missing competency.`,
      });
    }

    const anchors = graph.rubricAnchors.filter(
      (a) => a.indicatorId === indicator.id,
    );
    for (const level of CAPABILITY_LEVELS) {
      if (!anchors.some((a) => a.level === level)) {
        errors.push({
          id: `err.anchor.${indicator.key}.${level}`,
          code: "MISSING_RUBRIC_ANCHOR",
          severity: "error",
          path: `indicators.${indicator.key}.anchors.${level}`,
          message: `Indicator "${indicator.key}" is missing a ${level} rubric anchor.`,
        });
      }
    }
  }

  for (const req of graph.readinessRequirements) {
    if (!roleById.has(req.roleId)) {
      errors.push({
        id: `err.readiness_role.${req.id}`,
        code: "READINESS_MISSING_ROLE",
        severity: "error",
        path: `readinessRequirements.${req.id}.roleId`,
        message: "Readiness requirement references a missing role.",
      });
    }
    if (!competencyById.has(req.competencyId)) {
      errors.push({
        id: `err.readiness_comp.${req.id}`,
        code: "READINESS_MISSING_COMPETENCY",
        severity: "error",
        path: `readinessRequirements.${req.id}.competencyId`,
        message: "Readiness requirement references a missing competency.",
      });
    }
  }

  for (const role of graph.roles) {
    const reqs = graph.readinessRequirements.filter((r) => r.roleId === role.id);
    if (reqs.length === 0) {
      warnings.push({
        id: `warn.readiness.${role.slug}`,
        code: "ROLE_WITHOUT_READINESS",
        severity: "warning",
        path: `roles.${role.slug}`,
        message: `Role "${role.title}" has no readiness requirements.`,
        dependency: {
          entityType: "role",
          entityId: role.id,
          label: role.title,
        },
      });
    }
  }

  for (const content of graph.assessmentContent) {
    for (const competencyId of content.competencyIds) {
      if (!competencyById.has(competencyId)) {
        errors.push({
          id: `err.assessment_comp.${content.kind}.${content.slug}`,
          code: "ASSESSMENT_MISSING_COMPETENCY",
          severity: "error",
          path: `assessmentContent.${content.slug}.competencyIds`,
          message: `${content.kind} "${content.title}" references a missing competency.`,
        });
      }
    }
    for (const indicatorId of content.indicatorIds) {
      if (!indicatorById.has(indicatorId)) {
        errors.push({
          id: `err.assessment_ind.${content.kind}.${content.slug}`,
          code: "ASSESSMENT_MISSING_INDICATOR",
          severity: "error",
          path: `assessmentContent.${content.slug}.indicatorIds`,
          message: `${content.kind} "${content.title}" references a missing indicator.`,
        });
      }
    }
  }

  if (
    graph.assessmentContent.filter((c) => c.kind === "scenario").length === 0
  ) {
    warnings.push({
      id: "warn.no_scenarios",
      code: "NO_SCENARIOS",
      severity: "warning",
      path: "assessmentContent",
      message: "No scenarios defined — Experience calibration may be thin.",
    });
  }

  if (graph.evidenceRules.length === 0) {
    warnings.push({
      id: "warn.no_evidence_rules",
      code: "NO_EVIDENCE_RULES",
      severity: "warning",
      path: "evidenceRules",
      message:
        "No evidence rules — capability mapping will fall back to heuristic keyword matching.",
    });
  }

  // PI alignment: never imply Experience/Launchpad assigns capability levels
  for (const rule of graph.evidenceRules) {
    const assignsCapability = Boolean(
      (rule.rule as { assignsCapability?: unknown }).assignsCapability,
    );
    if (assignsCapability) {
      errors.push({
        id: `err.pi_assigns.${rule.slug}`,
        code: "PI_CAPABILITY_ASSIGNMENT_FORBIDDEN",
        severity: "error",
        path: `evidenceRules.${rule.slug}.rule.assignsCapability`,
        message:
          "Evidence rules must not assign capability. Experience/Launchpad contribute evidence only; the capability engine judges.",
      });
    }
  }

  if (!isMutableFrameworkStatus(graph.version.status) && errors.length > 0) {
    // Immutable versions should already be valid; surface as warnings for compare tooling.
    warnings.push({
      id: "warn.immutable_invalid",
      code: "IMMUTABLE_VERSION_HAS_ERRORS",
      severity: "warning",
      path: "version",
      message:
        "This immutable version fails current validation rules — do not silently rewrite; clone a fix forward.",
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function requireAcknowledgedWarnings(
  warnings: FrameworkValidationIssue[],
  acknowledgedWarningIds: string[] | undefined,
): FrameworkValidationIssue[] {
  const ack = new Set(acknowledgedWarningIds ?? []);
  return warnings.filter((w) => !ack.has(w.id));
}
