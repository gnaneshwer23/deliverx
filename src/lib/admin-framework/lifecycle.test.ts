import { describe, expect, it } from "vitest";
import {
  assertContentMutationAllowed,
  assertFrameworkStatusTransition,
  assertPublishConfirmation,
  canTransitionFrameworkStatus,
  FRAMEWORK_STATUS_TRANSITIONS,
  isImmutableFrameworkStatus,
  suggestNextFrameworkVersion,
} from "@/lib/admin-framework/lifecycle";
import {
  createAssessmentRun,
  planContentChange,
  planPublish,
  retainAssessmentPinAfterFrameworkPublish,
} from "@/lib/admin-framework/immutability";
import { validateFrameworkVersionGraph } from "@/lib/admin-framework/validation";
import {
  makeDraftVersionSummary,
  makeMinimalGraph,
  makePublishedVersionSummary,
} from "@/lib/admin-framework/test-fixtures";

describe("admin framework lifecycle state machine", () => {
  it("allows the canonical happy path", () => {
    const path = [
      "draft",
      "internal_review",
      "calibration",
      "published",
      "deprecated",
      "archived",
    ] as const;
    for (let i = 0; i < path.length - 1; i++) {
      expect(canTransitionFrameworkStatus(path[i], path[i + 1])).toBe(true);
    }
  });

  it("rejects skipping calibration into publish from draft", () => {
    const result = assertFrameworkStatusTransition("draft", "published");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_transition");
    }
  });

  it("rejects resurrecting archived versions", () => {
    expect(FRAMEWORK_STATUS_TRANSITIONS.archived).toEqual([]);
    expect(canTransitionFrameworkStatus("archived", "draft")).toBe(false);
  });

  it("requires confirmImmutable on publish", () => {
    expect(
      assertPublishConfirmation({ toStatus: "published" }).ok,
    ).toBe(false);
    expect(
      assertPublishConfirmation({
        toStatus: "published",
        confirmImmutable: true,
      }).ok,
    ).toBe(true);
  });

  it("suggests next year.minor version", () => {
    expect(suggestNextFrameworkVersion("2026.1")).toBe("2026.2");
  });
});

describe("published framework versions are immutable", () => {
  it("forbids content mutation when published", () => {
    const result = assertContentMutationAllowed("published");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("immutable_content_edit");
    }
  });

  it("forbids content mutation when deprecated or archived", () => {
    expect(assertContentMutationAllowed("deprecated").ok).toBe(false);
    expect(assertContentMutationAllowed("archived").ok).toBe(false);
    expect(isImmutableFrameworkStatus("deprecated")).toBe(true);
  });

  it("allows content mutation in draft / review / calibration", () => {
    expect(assertContentMutationAllowed("draft").ok).toBe(true);
    expect(assertContentMutationAllowed("internal_review").ok).toBe(true);
    expect(assertContentMutationAllowed("calibration").ok).toBe(true);
  });

  it("plans a new version instead of mutating published content", () => {
    const published = makePublishedVersionSummary();
    const plan = planContentChange({
      version: published,
      patchSummary: "tighten discovery anchors",
    });
    expect(plan.ok).toBe(true);
    if (plan.ok) {
      expect(plan.mode).toBe("clone_new_version");
      if (plan.mode === "clone_new_version") {
        expect(plan.suggestedVersion).toBe("2026.2");
      }
    }
  });

  it("mutates draft versions in place", () => {
    const draft = makeDraftVersionSummary();
    const plan = planContentChange({
      version: draft,
      patchSummary: "add scenario",
    });
    expect(plan).toEqual({
      ok: true,
      mode: "mutate",
      versionId: draft.id,
    });
  });
});

describe("assessments retain framework version pin", () => {
  it("pins framework_version_id at assessment creation", () => {
    const version = makePublishedVersionSummary();
    const run = createAssessmentRun({
      id: "run-1",
      userId: "user-1",
      version,
      judgements: [
        {
          competencyCode: "comp.stakeholder_management",
          level: "developing",
          rubricVersion: "2026.1",
        },
      ],
    });

    expect(run.frameworkPin.frameworkVersionId).toBe(version.id);
    expect(run.frameworkPin.frameworkVersion).toBe("2026.1");
  });

  it("does not rewrite historical judgements when a new version publishes", () => {
    const v1 = makePublishedVersionSummary();
    const run = createAssessmentRun({
      id: "run-1",
      userId: "user-1",
      version: v1,
      judgements: [
        {
          competencyCode: "comp.stakeholder_management",
          level: "developing",
          rubricVersion: "2026.1",
        },
      ],
    });

    const v2 = makePublishedVersionSummary({
      id: "fv-published-2",
      version: "2026.2",
      status: "published",
    });

    const retained = retainAssessmentPinAfterFrameworkPublish({
      run,
      newlyPublished: v2,
    });

    expect(retained.frameworkPin.frameworkVersionId).toBe(v1.id);
    expect(retained.frameworkPin.frameworkVersion).toBe("2026.1");
    expect(retained.judgements[0]?.rubricVersion).toBe("2026.1");
    expect(retained.judgements[0]?.level).toBe("developing");
  });
});

describe("publish validation", () => {
  it("publishes a valid calibration graph with confirmations", () => {
    const version = makeDraftVersionSummary({ status: "calibration" });
    const graph = makeMinimalGraph(version);
    const validation = validateFrameworkVersionGraph(graph);
    expect(validation.ok).toBe(true);

    const result = planPublish({
      graph,
      confirmImmutable: true,
      acknowledgedWarningIds: validation.warnings.map((w) => w.id),
    });
    expect(result).toEqual({ ok: true, nextStatus: "published" });
  });

  it("blocks publish when evidence rule assigns capability (PI rule)", () => {
    const version = makeDraftVersionSummary({ status: "calibration" });
    const graph = makeMinimalGraph(version);
    graph.evidenceRules[0] = {
      ...graph.evidenceRules[0]!,
      rule: { assignsCapability: true },
    };
    const result = planPublish({
      graph,
      confirmImmutable: true,
      acknowledgedWarningIds: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("validation_failed");
      expect(result.issues?.some((i) => i.code === "PI_CAPABILITY_ASSIGNMENT_FORBIDDEN")).toBe(
        true,
      );
    }
  });
});
