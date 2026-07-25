import { describe, expect, it } from "vitest";
import { buildScoreRunInsertRow } from "@/lib/capability-engine/persist";
import { projectSnapshotClaims } from "@/lib/capability-engine/snapshot-claims";
import { makeEvidence } from "@/lib/capability-engine/test-fixtures";
import { runCapabilityEngine } from "@/lib/capability-engine/orchestrator";
import { evidenceSourceForFinalItemKind } from "@/lib/pi-assessment/evidence";
import { buildGrowthReportBody } from "@/lib/pi-assessment/growth-report";
import {
  assertValidTransferIndustry,
  EXPERIENCE_INDUSTRIES,
  industriesCollide,
  PM_CORE_FINAL_CATALOG,
  selectFinalSessionItems,
  selectTransferPack,
} from "@/lib/pi-assessment/transfer-catalog";
import { projectPiProfileFromParts } from "@/lib/pi-profile/aggregate";
import type { PiProfileIdentity } from "@/lib/pi-profile/types";

const identity: PiProfileIdentity = {
  firstName: "Ada",
  lastName: "Lovelace",
  professionalIdentity: "Product Manager",
  targetRole: "APM",
  targetSeniority: "associate",
  objective: "Grow",
  situation: "early_career",
  industries: ["healthcare"],
  onboardingComplete: true,
  baselineOptIn: true,
  source: "pi_onboarding",
};

function makeClaims(
  id: string,
  overrides?: {
    readiness?: number;
    levels?: Array<{
      competencyId: string;
      level: string;
      confidence: number;
      evidenceReferences: string[];
    }>;
    strengths?: string[];
    gaps?: string[];
    frameworkVersionId?: string;
  },
) {
  return projectSnapshotClaims({
    id,
    captured_at: "2026-07-25T12:00:00.000Z",
    score_run_id: `run-${id}`,
    profile: {
      readiness: overrides?.readiness ?? 40,
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      frameworkVersionId: overrides?.frameworkVersionId ?? "fv-1",
      judgements: (overrides?.levels ?? []).map((l) => ({
        competencyId: l.competencyId,
        indicatorId: `${l.competencyId}.ind`,
        levelProposed: l.level,
        confidence: l.confidence,
        evidenceReferences: l.evidenceReferences,
        reasoningSummary: "cited",
        counterEvidence: "",
        limitations: "",
        modelVersion: "v1",
        promptVersion: "v1",
        rubricVersion: "2026.1",
        reviewStatus: "accepted",
        intelligenceKinds: ["competency"],
      })),
      strengths: overrides?.strengths ?? [],
      gaps: overrides?.gaps ?? [],
      recommendations: [],
    },
  });
}

describe("transfer industry validity", () => {
  it("selects a transfer industry outside Experience catalogue", () => {
    const { pack, transferIndustry, reason } = selectTransferPack({
      catalog: PM_CORE_FINAL_CATALOG,
      experienceIndustry: "healthcare",
    });
    expect(pack.kind).toBe("transfer");
    expect(EXPERIENCE_INDUSTRIES).not.toContain(transferIndustry);
    expect(industriesCollide("healthcare", transferIndustry)).toBe(false);
    expect(reason).toMatch(/auto_transfer_differs_from_experience/);
  });

  it("rejects transfer industry that collides with Experience", () => {
    const bad = assertValidTransferIndustry({
      experienceIndustry: "fintech",
      transferIndustry: "fintech",
    });
    expect(bad.ok).toBe(false);
  });

  it("final session items always include a transfer pack", () => {
    const selected = selectFinalSessionItems({
      catalog: PM_CORE_FINAL_CATALOG,
      experienceIndustry: "saas",
    });
    expect(selected.items.some((i) => i.kind === "transfer")).toBe(true);
    expect(selected.transferIndustry).not.toBe("saas");
    expect(EXPERIENCE_INDUSTRIES).not.toContain(selected.transferIndustry);
  });
});

describe("growth report citations", () => {
  it("builds citation-backed baseline → final comparison", () => {
    const baseline = makeClaims("snap-b", {
      readiness: 30,
      levels: [
        {
          competencyId: "comp.stakeholder_management",
          level: "emerging",
          confidence: 0.4,
          evidenceReferences: ["ev-b1"],
        },
      ],
      gaps: ["comp.stakeholder_management: emerging"],
    });
    const practice = makeClaims("snap-p", {
      readiness: 45,
      levels: [
        {
          competencyId: "comp.stakeholder_management",
          level: "developing",
          confidence: 0.55,
          evidenceReferences: ["ev-p1"],
        },
      ],
      strengths: ["comp.stakeholder_management: developing (55% confidence)"],
    });
    const finalClaims = makeClaims("snap-f", {
      readiness: 60,
      levels: [
        {
          competencyId: "comp.stakeholder_management",
          level: "proficient",
          confidence: 0.7,
          evidenceReferences: ["ev-f1", "ev-t1"],
        },
      ],
      strengths: ["comp.stakeholder_management: proficient (70% confidence)"],
      gaps: [],
    });

    const report = buildGrowthReportBody({
      baseline,
      practice,
      final: finalClaims,
      frameworkSlug: "pm-core",
      frameworkVersion: "2026.1",
      frameworkVersionId: "fv-1",
      experienceIndustry: "healthcare",
      transferIndustry: "civic_tech",
      transferSlug: "transfer-civic-budget-cut",
      finalEvidenceIds: ["ev-f1", "ev-t1"],
    });

    expect(report.status).toBe("ready");
    expect(report.transferDiffersFromExperience).toBe(true);
    expect(report.capabilityAssigned).toBe(false);
    expect(report.deliverxVerified).toBe(false);
    expect(report.levels[0]?.evidenceIds).toEqual(
      expect.arrayContaining(["ev-b1", "ev-p1", "ev-f1", "ev-t1"]),
    );
    expect(report.baselineToFinal.status).toBe("compared");
    expect(report.practicePerformance).toBeDefined();
    expect(report.transferPerformance.note).toMatch(/separately/i);
    expect(report.evidenceIds.length).toBeGreaterThan(0);
  });

  it("returns honest insufficient_history without inventing deltas", () => {
    const report = buildGrowthReportBody({
      baseline: null,
      practice: null,
      final: null,
      frameworkSlug: "pm-core",
      frameworkVersion: "2026.1",
      frameworkVersionId: null,
      experienceIndustry: null,
      transferIndustry: null,
      transferSlug: null,
    });
    expect(report.status).toBe("insufficient_history");
    expect(report.levels).toEqual([]);
    expect(report.baselineToFinal.status).toBe("insufficient_history");
    expect(report.nextAction.kind).toBe("evidence");
  });

  it("hard-blocks cross-framework-version comparison", () => {
    const baseline = makeClaims("snap-b", { frameworkVersionId: "fv-1" });
    const finalClaims = makeClaims("snap-f", { frameworkVersionId: "fv-2" });
    // Force different pins on claims
    if (baseline) baseline.frameworkVersionId = "fv-1";
    if (finalClaims) finalClaims.frameworkVersionId = "fv-2";

    const report = buildGrowthReportBody({
      baseline,
      practice: null,
      final: finalClaims,
      frameworkSlug: "pm-core",
      frameworkVersion: "2026.1",
      frameworkVersionId: "fv-1",
      experienceIndustry: "education",
      transferIndustry: "logistics",
      transferSlug: "transfer-logistics-route-pivot",
    });
    expect(report.status).toBe("blocked_cross_version");
    expect(report.message).toMatch(/blocked/i);
  });
});

describe("final ScoreRun kind + evidence sources", () => {
  it("persists run_kind=final under framework pin", () => {
    const run = runCapabilityEngine({
      userId: "u1",
      evidence: [
        makeEvidence({
          sourceType: "transfer_assessment",
          title: "Transfer civic budget decision",
          rawContent: { competency: "stakeholder" },
        }),
      ],
    });
    const row = buildScoreRunInsertRow({
      userId: "u1",
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      result: run,
      frameworkPin: {
        frameworkVersionId: "fv-1",
        frameworkSlug: "pm-core",
        version: "2026.1",
        contentHash: "hash",
        source: "pi_cf_published",
      },
      runKind: "final",
    });
    expect(row.run_kind).toBe("final");
    expect(row.framework_version_id).toBe("fv-1");
  });

  it("maps transfer items to transfer_assessment evidence source", () => {
    expect(evidenceSourceForFinalItemKind("transfer")).toBe("transfer_assessment");
    expect(evidenceSourceForFinalItemKind("interview")).toBe("adaptive_interview");
    expect(evidenceSourceForFinalItemKind("scenario")).toBe("final_assessment");
  });
});

describe("profile next action after Experience", () => {
  it("steers to final assessment after Experience evidence", () => {
    const claims = makeClaims("snap-1", {
      readiness: 50,
      gaps: ["comp.delivery_execution: developing"],
    });
    const view = projectPiProfileFromParts({
      identity,
      evidenceCount: 5,
      baselineEvidenceCount: 2,
      experienceEvidenceCount: 2,
      finalEvidenceCount: 0,
      scoreRun: claims
        ? {
            snapshotId: claims.snapshotId,
            scoreRunId: claims.scoreRunId,
            capturedAt: claims.capturedAt,
            rubricSlug: claims.rubricSlug,
            rubricVersion: claims.rubricVersion,
            frameworkVersionId: claims.frameworkVersionId,
            readinessSignal: claims.readiness,
            strengths: claims.strengths,
            gaps: claims.gaps,
            levels: [],
            recommendations: [],
            emptyGuidance: null,
          }
        : null,
      claims,
    });
    expect(view.nextAction?.kind).toBe("final");
    expect(view.nextAction?.href).toBe("/profile/final");
    expect(view.capabilityAssigned).toBe(false);
    expect(view.deliverxVerified).toBe(false);
  });
});
