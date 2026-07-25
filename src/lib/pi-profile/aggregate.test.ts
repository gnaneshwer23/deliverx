import { describe, expect, it } from "vitest";
import { projectPiProfileFromParts } from "@/lib/pi-profile/aggregate";
import { projectSnapshotClaims } from "@/lib/capability-engine/snapshot-claims";
import type { PiProfileIdentity, PiProfileScoreRun } from "@/lib/pi-profile/types";

const identity: PiProfileIdentity = {
  firstName: "Ada",
  lastName: "Lovelace",
  professionalIdentity: "Aspiring product manager",
  targetRole: "Associate Product Manager",
  targetSeniority: "associate",
  objective: "Break into product",
  situation: "student",
  industries: ["Healthtech"],
  onboardingComplete: true,
  baselineOptIn: true,
  source: "pi_onboarding",
};

describe("projectPiProfileFromParts", () => {
  it("never assigns capability", () => {
    const view = projectPiProfileFromParts({
      identity,
      evidenceCount: 2,
      baselineEvidenceCount: 2,
      scoreRun: null,
    });
    expect(view.capabilityAssigned).toBe(false);
  });

  it("guides opted-in users with no baseline evidence toward /profile/baseline", () => {
    const view = projectPiProfileFromParts({
      identity,
      evidenceCount: 0,
      baselineEvidenceCount: 0,
      scoreRun: null,
    });
    expect(view.nextAction?.kind).toBe("baseline");
    expect(view.nextAction?.href).toBe("/profile/baseline");
  });

  it("guides users who opted out of baseline toward Experience when empty", () => {
    const view = projectPiProfileFromParts({
      identity: { ...identity, baselineOptIn: false },
      evidenceCount: 0,
      baselineEvidenceCount: 0,
      scoreRun: null,
    });
    expect(view.nextAction?.kind).toBe("experience");
    expect(view.nextAction?.href).toBe("/experience/app");
  });

  it("guides users with evidence but no ScoreRun toward the ledger", () => {
    const view = projectPiProfileFromParts({
      identity,
      evidenceCount: 3,
      baselineEvidenceCount: 3,
      scoreRun: null,
    });
    expect(view.nextAction?.kind).toBe("evidence");
    expect(view.nextAction?.href).toContain("/profile/evidence");
    expect(view.holdingBack.emptyGuidance).toMatch(/ScoreRun/i);
  });

  it("surfaces top gaps and ScoreRun recommendation as Experience next action", () => {
    const scoreRun: PiProfileScoreRun = {
      snapshotId: "snap-1",
      scoreRunId: "run-1",
      capturedAt: new Date().toISOString(),
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      frameworkVersionId: "fv-1",
      readinessSignal: 62,
      strengths: ["Stakeholder judgement"],
      gaps: ["Delivery under constraint"],
      levels: [
        {
          competencyId: "comp.stakeholder_management",
          indicatorId: "ind.stakeholder_judgement",
          level: "developing",
          confidence: 0.7,
          evidenceReferences: ["ev-1"],
          reasoningSummary: "Trade-off rationale observed in practice.",
        },
      ],
      recommendations: [
        {
          id: "rec-1",
          title: "Practice a constrained delivery call",
          rationale: "Closes the top gap with cited evidence.",
        },
      ],
      emptyGuidance: null,
    };

    const view = projectPiProfileFromParts({
      identity,
      evidenceCount: 4,
      baselineEvidenceCount: 4,
      scoreRun,
    });

    expect(view.holdingBack.topGaps).toEqual(["Delivery under constraint"]);
    expect(view.nextAction?.kind).toBe("recommendation");
    expect(view.nextAction?.href).toBe("/experience/app");
    expect(view.nextAction?.title).toMatch(/constrained delivery/i);
    expect(view.capabilityAssigned).toBe(false);
  });

  it("prefers gap-ranked Experience plan href when present", () => {
    const scoreRun: PiProfileScoreRun = {
      snapshotId: "snap-1",
      scoreRunId: "run-1",
      capturedAt: new Date().toISOString(),
      rubricSlug: "pm-core",
      rubricVersion: "2026.1",
      frameworkVersionId: "fv-1",
      readinessSignal: 62,
      strengths: [],
      gaps: ["comp.delivery_execution: emerging — scope"],
      levels: [],
      recommendations: [],
      emptyGuidance: null,
    };
    const view = projectPiProfileFromParts({
      identity,
      evidenceCount: 4,
      baselineEvidenceCount: 4,
      scoreRun,
      experiencePlan: {
        id: "plan-1",
        status: "active",
        createdAt: new Date().toISOString(),
        enrolmentId: null,
        scenarioSlug: "mediflow-trustcare",
        emphasis: "delivery",
        title: "MediFlow — TrustCare pilot commitment",
        summary: "Delivery emphasis",
        coachingFocus: "Start with Maya",
        companyName: "MediFlow",
        companyKey: "mediflow",
        industry: "healthcare",
        projectName: "TrustCare Pilot — Metro Clinic",
        candidateRole: "Associate Product Manager",
        problem: "Sales floated a pilot date early",
        decisionEmphasis: ["review_context"],
        targetedCompetencies: ["comp.delivery_execution"],
        rankedGaps: [],
        rationale: "From ScoreRun gaps",
        evidenceLinks: [],
        href: "/experience/app?planId=plan-1&scenario=mediflow-trustcare&planEmphasis=delivery",
        targetRole: "APM",
        targetSeniority: "associate",
        preferredIndustries: ["healthcare"],
        snapshotId: "snap-1",
        scoreRunId: "run-1",
        frameworkVersionId: "fv-1",
        plannerVersion: "experience-plan-v2",
        capabilityAssigned: false,
      },
    });
    expect(view.nextAction?.href).toContain("planEmphasis=delivery");
    expect(view.nextAction?.title).toMatch(/MediFlow|TrustCare/i);
  });

  it("exposes insufficient-history growth when only one snapshot exists", () => {
    const claims = projectSnapshotClaims({
      id: "snap-1",
      captured_at: "2026-07-25T00:00:00.000Z",
      score_run_id: "run-1",
      profile: {
        readiness: 50,
        judgements: [],
        strengths: [],
        gaps: [],
        recommendations: [],
      },
    });
    const view = projectPiProfileFromParts({
      identity,
      evidenceCount: 2,
      baselineEvidenceCount: 2,
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
      previousClaims: null,
    });
    expect(view.growthDelta.status).toBe("insufficient_history");
    expect(view.growthDelta.message).toMatch(/First ScoreRun|second run/i);
  });
});
