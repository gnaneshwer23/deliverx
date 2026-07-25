import { describe, expect, it } from "vitest";
import { cloneFrameworkGraph } from "@/lib/admin-framework/clone-graph";
import {
  graphToRubricAnchorsPayload,
  graphToRubricDefinition,
  hashFrameworkGraphContent,
} from "@/lib/admin-framework/rubric-bridge";
import { buildPmCoreSeedGraph } from "@/lib/admin-framework/seed-graph";
import { validateFrameworkVersionGraph } from "@/lib/admin-framework/validation";
import { planPublish } from "@/lib/admin-framework/immutability";
import {
  makeDraftVersionSummary,
  makePublishedVersionSummary,
} from "@/lib/admin-framework/test-fixtures";
import { PM_CORE_RUBRIC_2026_1 } from "@/lib/capability-engine/rubric";
import { CAREER_ROLE_CATALOGUE } from "@/lib/career-intelligence/role-catalogue";

describe("buildPmCoreSeedGraph", () => {
  const version = makePublishedVersionSummary();
  const graph = buildPmCoreSeedGraph(version);

  it("seeds competencies and indicators from PM_CORE_RUBRIC_2026_1", () => {
    expect(graph.competencies.map((c) => c.code).sort()).toEqual(
      [
        "comp.delivery_execution",
        "comp.product_discovery",
        "comp.stakeholder_management",
      ].sort(),
    );
    expect(graph.indicators.map((i) => i.key).sort()).toEqual(
      Object.keys(PM_CORE_RUBRIC_2026_1.indicators).sort(),
    );
    for (const indicator of graph.indicators) {
      const anchors = graph.rubricAnchors.filter(
        (a) => a.indicatorId === indicator.id,
      );
      expect(anchors).toHaveLength(4);
    }
  });

  it("seeds roles from CAREER_ROLE_CATALOGUE with readiness", () => {
    expect(graph.roles.map((r) => r.slug).sort()).toEqual(
      CAREER_ROLE_CATALOGUE.map((r) => r.id).sort(),
    );
    for (const role of graph.roles) {
      const reqs = graph.readinessRequirements.filter((r) => r.roleId === role.id);
      expect(reqs.length).toBeGreaterThan(0);
    }
  });

  it("never lets evidence rules assign capability", () => {
    for (const rule of graph.evidenceRules) {
      expect(rule.rule.assignsCapability).toBe(false);
    }
  });

  it("passes structural validation", () => {
    const result = validateFrameworkVersionGraph(graph);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe("rubric bridge", () => {
  const graph = buildPmCoreSeedGraph(makePublishedVersionSummary());

  it("emits pi_rubric_versions.anchors shape matching in-code rubric", () => {
    const payload = graphToRubricAnchorsPayload(graph);
    expect(payload.levels).toEqual([
      "emerging",
      "developing",
      "proficient",
      "advanced",
    ]);
    for (const [key, ind] of Object.entries(PM_CORE_RUBRIC_2026_1.indicators)) {
      expect(payload.indicators[key]?.competency_id).toBe(ind.competencyId);
      expect(payload.indicators[key]?.indicator_id).toBe(ind.indicatorId);
      expect(payload.indicators[key]?.anchors).toEqual(ind.anchors);
    }
  });

  it("converts to RubricDefinition DTO for engine parity", () => {
    const def = graphToRubricDefinition(graph);
    expect(def.slug).toBe("pm-core");
    expect(def.version).toBe("2026.1");
    expect(def.indicators.stakeholder_judgement?.anchors.proficient).toBe(
      PM_CORE_RUBRIC_2026_1.indicators.stakeholder_judgement.anchors.proficient,
    );
  });

  it("produces a stable content hash", () => {
    const a = hashFrameworkGraphContent(graph);
    const b = hashFrameworkGraphContent(graph);
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });
});

describe("cloneFrameworkGraph", () => {
  it("remaps ids and does not mutate the source", () => {
    const source = buildPmCoreSeedGraph(makePublishedVersionSummary());
    const sourceCompId = source.competencies[0]!.id;
    const draft = makeDraftVersionSummary({ id: "fv-draft-clone" });
    const cloned = cloneFrameworkGraph(source, draft);

    expect(cloned.version.id).toBe("fv-draft-clone");
    expect(cloned.version.status).toBe("draft");
    expect(cloned.competencies).toHaveLength(source.competencies.length);
    expect(cloned.competencies[0]!.id).not.toBe(sourceCompId);
    expect(cloned.competencies[0]!.frameworkVersionId).toBe("fv-draft-clone");
    expect(source.competencies[0]!.id).toBe(sourceCompId);

    // FK remapping: indicator still points at remapped competency
    const clonedInd = cloned.indicators[0]!;
    expect(cloned.competencies.some((c) => c.id === clonedInd.competencyId)).toBe(
      true,
    );

    const validation = validateFrameworkVersionGraph(cloned);
    expect(validation.ok).toBe(true);
  });

  it("cloned draft can be published after warning acknowledgement", () => {
    const source = buildPmCoreSeedGraph(makePublishedVersionSummary());
    const draftSummary = makeDraftVersionSummary({
      id: "fv-draft-publish",
      status: "calibration",
    });
    const cloned = cloneFrameworkGraph(source, draftSummary);
    const warnings = validateFrameworkVersionGraph(cloned).warnings;
    const planned = planPublish({
      graph: cloned,
      confirmImmutable: true,
      acknowledgedWarningIds: warnings.map((w) => w.id),
    });
    expect(planned.ok).toBe(true);
  });
});
