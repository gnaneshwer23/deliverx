import { describe, expect, it } from "vitest";
import {
  projectGrowthDelta,
  projectRoleReadinessFromClaims,
  projectSnapshotClaims,
  toPiProfileScoreRun,
  toPortfolioCapabilityClaims,
  toScoreRunCareerContext,
  type SnapshotClaims,
} from "@/lib/capability-engine/snapshot-claims";
import { CAREER_ROLE_CATALOGUE } from "@/lib/career-intelligence/role-catalogue";
import { externalViewModel } from "@/lib/verified-portfolio/compile";
import type { PortfolioEntry } from "@/lib/verified-portfolio/types";
import { emptyContributionBreakdown } from "@/lib/verified-portfolio/types";
import { deliverxVerifiedClaim } from "@/lib/verified-portfolio/types";

function fixtureClaims(overrides?: Partial<SnapshotClaims>): SnapshotClaims {
  const base = projectSnapshotClaims({
    id: "snap-current",
    captured_at: "2026-07-25T12:00:00.000Z",
    score_run_id: "run-current",
    profile: {
      schemaVersion: "1",
      readiness: 64,
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      frameworkVersionId: "fv-1",
      strengths: ["Stakeholder judgement: proficient"],
      gaps: ["Delivery under constraint"],
      recommendations: [
        {
          id: "rec-1",
          title: "Practice a constrained delivery call",
          rationale: "Close the gap",
          evidenceReferences: ["ev-shareable"],
        },
      ],
      judgements: [
        {
          competencyId: "comp.stakeholder_management",
          indicatorId: "ind.stakeholder_judgement",
          levelProposed: "proficient",
          confidence: 0.8,
          evidenceReferences: ["ev-shareable", "ev-private"],
          reasoningSummary: "Trade-off rationale observed.",
          counterEvidence: "",
          limitations: "Single scenario",
          modelVersion: "deterministic-v1",
          promptVersion: "none",
          rubricVersion: "2026.1",
          reviewStatus: "accepted",
          intelligenceKinds: ["competency"],
        },
        {
          competencyId: "comp.delivery",
          indicatorId: "ind.delivery_practice",
          levelProposed: "developing",
          confidence: 0.55,
          evidenceReferences: ["ev-private"],
          reasoningSummary: "Partial delivery signal.",
          counterEvidence: "",
          limitations: "Private evidence only",
          modelVersion: "deterministic-v1",
          promptVersion: "none",
          rubricVersion: "2026.1",
          reviewStatus: "accepted",
          intelligenceKinds: ["competency"],
        },
        {
          competencyId: "comp.thin",
          indicatorId: "ind.thin",
          levelProposed: "insufficient_evidence",
          confidence: 0.1,
          evidenceReferences: [],
          reasoningSummary: "Not enough",
          counterEvidence: "",
          limitations: "No evidence",
          modelVersion: "deterministic-v1",
          promptVersion: "none",
          rubricVersion: "2026.1",
          reviewStatus: "accepted",
          intelligenceKinds: ["knowledge"],
        },
      ],
      targetComparison: {
        role: "APM",
        seniority: "associate",
        met: ["comp.stakeholder_management"],
        unmet: ["comp.delivery"],
      },
      contradictions: [],
      dimensions: {
        knowledge: 40,
        appliedSkill: 50,
        behaviour: 55,
        competency: 60,
        outcome: 30,
        potential: 45,
        readiness: 64,
      },
    },
  });
  return { ...base!, ...overrides };
}

describe("SnapshotClaims shared contract", () => {
  it("projects identical readiness and levels for Profile, Career and Portfolio adapters", () => {
    const claims = fixtureClaims();
    const profile = toPiProfileScoreRun(claims);
    const career = toScoreRunCareerContext(claims);
    const portfolio = toPortfolioCapabilityClaims(claims, { requireCitations: false });

    expect(profile.snapshotId).toBe(claims.snapshotId);
    expect(career?.snapshotId).toBe(claims.snapshotId);
    expect(profile.readinessSignal).toBe(64);
    expect(career?.readiness).toBe(64);
    expect(profile.levels.map((l) => l.competencyId)).toEqual(
      career?.levels.map((l) => l.competencyId),
    );
    expect(portfolio.map((c) => c.competencyId)).toEqual(
      profile.levels.map((l) => l.competencyId),
    );
    expect(claims.capabilityAssigned).toBe(false);
    expect(portfolio.every((c) => c.deliverxVerified === false)).toBe(true);
    expect(portfolio.every((c) => c.snapshotId === claims.snapshotId)).toBe(true);
  });

  it("filters insufficient_evidence from claim levels", () => {
    const claims = fixtureClaims();
    expect(claims.levels.some((l) => l.level === "insufficient_evidence")).toBe(false);
    expect(claims.levels).toHaveLength(2);
  });
});

describe("growth delta", () => {
  it("states insufficient history for a single snapshot", () => {
    const current = fixtureClaims();
    const delta = projectGrowthDelta(null, current);
    expect(delta.status).toBe("insufficient_history");
    expect(delta.message).toMatch(/First ScoreRun|second run/i);
    expect(delta.levelDeltas).toEqual([]);
    expect(delta.readinessDelta).toBeNull();
  });

  it("states insufficient history when no ScoreRun exists", () => {
    const delta = projectGrowthDelta(null, null);
    expect(delta.status).toBe("insufficient_history");
    expect(delta.message).toMatch(/No ScoreRun/i);
  });

  it("compares two snapshots for readiness and level movement", () => {
    const previous = fixtureClaims({
      snapshotId: "snap-prev",
      capturedAt: "2026-07-01T12:00:00.000Z",
      readiness: 50,
      levels: [
        {
          competencyId: "comp.stakeholder_management",
          indicatorId: "ind.stakeholder_judgement",
          level: "developing",
          confidence: 0.5,
          evidenceReferences: ["ev-shareable"],
          reasoningSummary: "Earlier",
          limitations: "",
        },
      ],
      gaps: ["Delivery under constraint", "Discovery depth"],
    });
    const current = fixtureClaims({
      readiness: 64,
      gaps: ["Delivery under constraint"],
    });
    const delta = projectGrowthDelta(previous, current);
    expect(delta.status).toBe("compared");
    expect(delta.readinessDelta).toBe(14);
    expect(delta.levelDeltas.some((d) => d.competencyId === "comp.stakeholder_management")).toBe(
      true,
    );
    expect(delta.gapsClosed).toContain("Discovery depth");
  });
});

describe("Career ScoreRun projection semantics", () => {
  it("projects readinessKind score_run_projection for catalogue roles with citations", () => {
    const claims = fixtureClaims();
    const role = CAREER_ROLE_CATALOGUE[0]!;
    const result = projectRoleReadinessFromClaims(role, claims);
    expect(result).not.toBeNull();
    expect(result!.readinessKind).toBe("score_run_projection");
    expect(result!.capabilityAssigned).toBe(false);
    expect(result!.summary).toMatch(/ScoreRun projection/i);
    expect(result!.summary).not.toMatch(/assigns capability/i);
  });

  it("suppresses thin ScoreRun projections below the evidence floor", () => {
    const thin = fixtureClaims({
      levels: [
        {
          competencyId: "comp.unrelated",
          indicatorId: "ind.x",
          level: "emerging",
          confidence: 0.2,
          evidenceReferences: [],
          reasoningSummary: "No cites",
          limitations: "",
        },
      ],
    });
    const role = CAREER_ROLE_CATALOGUE[0]!;
    expect(projectRoleReadinessFromClaims(role, thin)).toBeNull();
  });
});

describe("Portfolio privacy and trust regressions", () => {
  const baseEntry: PortfolioEntry = {
    id: "p1",
    userId: "u1",
    title: "Case",
    targetRole: "APM",
    lifecycle: "ready",
    visibility: "link",
    projectContext: "MediFlow",
    userResponsibility: "APM",
    challenge: "secret challenge",
    actions: "acted",
    decisions: "decided",
    artefacts: "doc",
    outcomes: "shipped",
    competenciesDemonstrated: ["Judgement"],
    evidenceStrength: "observed",
    contributionBreakdown: emptyContributionBreakdown(),
    reflection: "private reflection",
    verifierStatus: "none",
    aiAssistanceDisclosure: "disclosed",
    aiSummary: "draft",
    narrative: "full narrative",
    hiddenFields: ["challenge", "reflection"],
    evidenceLinks: [
      {
        evidenceId: "ev-private",
        claimField: "actions",
        title: "Private decision",
        sourceType: "decision",
        ledgerStatus: "observed",
        strength: "observed",
        confidentiality: "private",
        deliverxClaimsVerification: false,
      },
      {
        evidenceId: "ev-shareable",
        claimField: "outcomes",
        title: "Public note",
        sourceType: "artefact",
        ledgerStatus: "supported",
        strength: "document_supported",
        confidentiality: "shareable",
        deliverxClaimsVerification: false,
      },
    ],
    deliverxVerified: false,
    createdAt: "",
    updatedAt: "",
  };

  it("excludes private evidence citations from public capability claims", () => {
    const claims = fixtureClaims();
    const allClaims = toPortfolioCapabilityClaims(claims, { requireCitations: false });
    const view = externalViewModel(baseEntry, baseEntry.hiddenFields, allClaims);

    expect(view.evidenceLinks).toHaveLength(1);
    expect(view.evidenceLinks[0]?.title).toBe("Public note");

    const publicClaims = view.capabilityClaims;
    expect(publicClaims.length).toBeGreaterThan(0);
    for (const c of publicClaims) {
      expect(c.evidenceCitations.every((e) => e.evidenceId === "ev-shareable")).toBe(true);
      expect(c.evidenceCitations.some((e) => e.evidenceId === "ev-private")).toBe(false);
      expect(c.deliverxVerified).toBe(false);
    }
    // Delivery claim only cited private evidence — must not appear publicly
    expect(publicClaims.some((c) => c.competencyId === "comp.delivery")).toBe(false);
  });

  it("never lights deliverxVerified from ScoreRun claims alone", () => {
    const claims = fixtureClaims();
    const packed = toPortfolioCapabilityClaims(claims);
    expect(packed.every((c) => c.deliverxVerified === false)).toBe(true);
    expect(
      deliverxVerifiedClaim({
        verifierStatus: "none",
        evidenceStrength: "observed",
      }),
    ).toBe(false);
    const view = externalViewModel(baseEntry, [], packed);
    expect(view.deliverxVerified).toBe(false);
  });
});
