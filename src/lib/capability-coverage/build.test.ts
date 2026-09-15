import { describe, expect, it } from "vitest";
import { buildCapabilityCoverage, frameworkCompetencies } from "@/lib/capability-coverage/build";
import { PM_CORE_RUBRIC_2026_1 } from "@/lib/capability-engine/rubric";
import { CONFIDENCE_BAND_ALGORITHM_VERSION } from "@/lib/capability-engine/confidence-bands";
import type {
  SnapshotClaimLevel,
  SnapshotClaims,
} from "@/lib/capability-engine/snapshot-claims";

function makeClaims(levels: SnapshotClaimLevel[]): SnapshotClaims {
  return {
    snapshotId: "snap-1",
    scoreRunId: "run-1",
    capturedAt: "2026-09-01T00:00:00.000Z",
    schemaVersion: "1",
    algorithmVersion: "capability-engine-v1",
    confidenceBandAlgorithmVersion: CONFIDENCE_BAND_ALGORITHM_VERSION,
    rubricSlug: "pm-core",
    rubricVersion: "2026.1",
    frameworkVersionId: "fv-1",
    frameworkContentHash: null,
    readiness: 40,
    dimensions: null,
    levels,
    strengths: [],
    gaps: [],
    recommendations: [],
    targetComparison: null,
    contradictions: [],
    capabilityAssigned: false,
    source: "pi_capability_snapshots.profile",
  };
}

function level(overrides: Partial<SnapshotClaimLevel> & { competencyId: string }): SnapshotClaimLevel {
  return {
    indicatorId: "ind.x",
    level: "proficient",
    confidence: 0.8,
    evidenceReferences: [],
    reasoningSummary: "",
    limitations: "",
    ...overrides,
  };
}

describe("frameworkCompetencies", () => {
  it("returns the unique pm-core competencies with titles", () => {
    const comps = frameworkCompetencies(PM_CORE_RUBRIC_2026_1);
    expect(comps).toHaveLength(3);
    expect(comps.map((c) => c.competencyId).sort()).toEqual([
      "comp.delivery_execution",
      "comp.product_discovery",
      "comp.stakeholder_management",
    ]);
    expect(comps.find((c) => c.competencyId === "comp.stakeholder_management")?.title).toBe(
      "Stakeholder management",
    );
  });
});

describe("buildCapabilityCoverage", () => {
  it("marks every capability not_assessed when there is no snapshot", () => {
    const coverage = buildCapabilityCoverage({
      rubric: PM_CORE_RUBRIC_2026_1,
      claims: null,
    });

    expect(coverage.rows).toHaveLength(3);
    expect(coverage.rows.every((r) => r.basis === "not_assessed")).toBe(true);
    expect(coverage.summary).toEqual({
      total: 3,
      assessed: 0,
      insufficient: 0,
      notAssessed: 3,
    });
    expect(coverage.emptyGuidance).not.toBeNull();
    expect(coverage.snapshotId).toBeNull();
    // Never invents band or level when not assessed.
    expect(coverage.rows.every((r) => r.level === null && r.capabilityBandLabel === null)).toBe(
      true,
    );
  });

  it("marks a judged competency assessed with band + confidence, others insufficient", () => {
    const coverage = buildCapabilityCoverage({
      rubric: PM_CORE_RUBRIC_2026_1,
      claims: makeClaims([
        level({
          competencyId: "comp.stakeholder_management",
          level: "proficient",
          confidence: 0.82,
          evidenceReferences: ["ev-1", "ev-2"],
          reasoningSummary: "Balanced two exec stakeholders with a documented trade-off.",
        }),
      ]),
    });

    const stakeholder = coverage.rows.find(
      (r) => r.competencyId === "comp.stakeholder_management",
    )!;
    expect(stakeholder.basis).toBe("assessed");
    expect(stakeholder.level).toBe("proficient");
    expect(stakeholder.capabilityBandLabel).toBe("Proficient");
    expect(stakeholder.whyThisBand).toBeTruthy();
    expect(stakeholder.confidenceBand).toBe("higher");
    expect(stakeholder.confidenceBandLabel).toBe("Higher confidence");
    expect(stakeholder.citedEvidenceCount).toBe(2);
    expect(stakeholder.reasoningSummary).toContain("trade-off");

    // Competencies not judged in a run that DID happen are insufficient, not "not assessed".
    const others = coverage.rows.filter((r) => r.competencyId !== "comp.stakeholder_management");
    expect(others.every((r) => r.basis === "insufficient_evidence")).toBe(true);
    expect(coverage.summary).toEqual({
      total: 3,
      assessed: 1,
      insufficient: 2,
      notAssessed: 0,
    });
    expect(coverage.emptyGuidance).toBeNull();
    expect(coverage.snapshotId).toBe("snap-1");
  });

  it("maps mid confidence to a moderate display band", () => {
    const coverage = buildCapabilityCoverage({
      rubric: PM_CORE_RUBRIC_2026_1,
      claims: makeClaims([
        level({ competencyId: "comp.delivery_execution", level: "developing", confidence: 0.5 }),
      ]),
    });
    const delivery = coverage.rows.find((r) => r.competencyId === "comp.delivery_execution")!;
    expect(delivery.confidenceBand).toBe("moderate");
    expect(delivery.capabilityBandLabel).toBe("Developing");
  });

  it("never lights Verified and never claims capability was assigned", () => {
    const coverage = buildCapabilityCoverage({
      rubric: PM_CORE_RUBRIC_2026_1,
      claims: makeClaims([
        level({ competencyId: "comp.product_discovery", level: "advanced", confidence: 0.9 }),
      ]),
    });
    expect(coverage.capabilityAssigned).toBe(false);
    expect(coverage.deliverxVerifiedInflated).toBe(false);
    expect(coverage.rows.every((r) => r.verified === false)).toBe(true);
    expect(coverage.confidenceBandAlgorithmVersion).toBe(CONFIDENCE_BAND_ALGORITHM_VERSION);
    expect(coverage.honestyNote).toMatch(/attestation/i);
  });

  it("surfaces self-reported strengths separately from evidence", () => {
    const coverage = buildCapabilityCoverage({
      rubric: PM_CORE_RUBRIC_2026_1,
      claims: null,
      selfReportedStrengths: [
        { key: "self_reported_strength", value: "Stakeholder communication" },
      ],
    });
    expect(coverage.selfReported).toHaveLength(1);
    expect(coverage.selfReported[0]?.value).toBe("Stakeholder communication");
    // Self-report must not appear as an assessed row basis.
    expect(coverage.rows.every((r) => r.basis !== "assessed")).toBe(true);
  });
});
