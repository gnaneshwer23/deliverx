import { describe, expect, it } from "vitest";
import { buildDailyBriefing } from "@/lib/contextual-home/build-daily-briefing";
import { isContextualHomeEnabled } from "@/lib/contextual-home/flag";
import { resolveHomeState } from "@/lib/contextual-home/resolve-home-state";
import { isActiveExperienceWork } from "@/lib/contextual-home/project-signals";
import type { HomeStateSignals } from "@/lib/contextual-home/types";

function baseSignals(
  overrides: Partial<HomeStateSignals> = {},
): HomeStateSignals {
  return {
    onboardingComplete: true,
    hasActiveExperienceWork: false,
    experienceEnrolmentId: null,
    experienceCompanyName: null,
    experienceDay: null,
    experienceLifecycle: null,
    hasExperienceEvidence: false,
    experienceEvidenceCount: 0,
    evidenceTotalCount: 0,
    hasActiveExperiencePlan: true,
    experiencePlanId: "plan-1",
    experiencePlanTitle: "Start MediFlow Day 1",
    experiencePlanCompany: "MediFlow",
    experiencePlanHref: "/experience/app?planId=plan-1",
    experiencePlanRationale: "Targets stakeholder communication gaps.",
    targetRole: "Associate PM",
    objective: "Land a PM role",
    productIntent: "bundle",
    interviewCount: 0,
    applicationCount: 0,
    offerCount: 0,
    hasInterviewPrepRoadmap: false,
    interviewPrepHref: "/launchpad/app/interview",
    confidenceBandLabel: null,
    scoreRunId: null,
    topGap: null,
    verifiedClaimCount: 0,
    showWorkspaceSummary: false,
    nextAction: {
      title: "Start Experience Day 1",
      rationale: "Practice decisions create durable evidence.",
      href: "/experience/app",
      kind: "experience",
    },
    firstName: "Sam",
    ...overrides,
  };
}

describe("isContextualHomeEnabled", () => {
  it("defaults on and honours off kill-switch", () => {
    expect(isContextualHomeEnabled({})).toBe(true);
    expect(isContextualHomeEnabled({ DELIVERX_CONTEXTUAL_HOME: "off" })).toBe(
      false,
    );
  });
});

describe("resolveHomeState", () => {
  it("A — not onboarded wins over everything", () => {
    const resolved = resolveHomeState(
      baseSignals({
        onboardingComplete: false,
        hasActiveExperienceWork: true,
        productIntent: "launchpad",
      }),
    );
    expect(resolved.state).toBe("not_onboarded");
    expect(resolved.stateLetter).toBe("A");
  });

  it("C — active Experience before Launchpad", () => {
    const resolved = resolveHomeState(
      baseSignals({
        hasActiveExperienceWork: true,
        productIntent: "launchpad",
        interviewCount: 2,
      }),
    );
    expect(resolved.state).toBe("active_experience");
    expect(resolved.stateLetter).toBe("C");
  });

  it("B — onboarded with no Experience evidence", () => {
    const resolved = resolveHomeState(baseSignals());
    expect(resolved.state).toBe("recommend_experience");
    expect(resolved.stateLetter).toBe("B");
  });

  it("D — Launchpad product intent after Experience evidence", () => {
    const resolved = resolveHomeState(
      baseSignals({
        hasExperienceEvidence: true,
        experienceEvidenceCount: 3,
        evidenceTotalCount: 5,
        productIntent: "launchpad",
      }),
    );
    expect(resolved.state).toBe("launchpad_primary");
    expect(resolved.stateLetter).toBe("D");
  });

  it("D — outcomes / interview prep without active Experience", () => {
    const resolved = resolveHomeState(
      baseSignals({
        hasExperienceEvidence: true,
        experienceEvidenceCount: 2,
        interviewCount: 1,
      }),
    );
    expect(resolved.state).toBe("launchpad_primary");
  });

  it("prefers B over interview_prep when no Experience and not Launchpad SKU", () => {
    const resolved = resolveHomeState(
      baseSignals({
        hasInterviewPrepRoadmap: true,
        hasExperienceEvidence: false,
        productIntent: "bundle",
      }),
    );
    expect(resolved.state).toBe("recommend_experience");
  });

  it("progress — Experience evidence without Launchpad signals", () => {
    const resolved = resolveHomeState(
      baseSignals({
        hasExperienceEvidence: true,
        experienceEvidenceCount: 4,
        evidenceTotalCount: 6,
        productIntent: "xperience",
      }),
    );
    expect(resolved.state).toBe("progress");
  });
});

describe("isActiveExperienceWork", () => {
  it("rejects completed lifecycle", () => {
    expect(
      isActiveExperienceWork({
        id: "e1",
        company_name: "MediFlow",
        day: 5,
        status: "ACTIVE",
        lifecycle_phase: "completed",
      }),
    ).toBe(false);
  });

  it("accepts active unfinished enrolment", () => {
    expect(
      isActiveExperienceWork({
        id: "e1",
        company_name: "MediFlow",
        day: 2,
        status: "ACTIVE",
        state: { lifecycle: "active" },
      }),
    ).toBe(true);
  });
});

describe("buildDailyBriefing", () => {
  it("A — single onboarding CTA; no invented %", () => {
    const briefing = buildDailyBriefing(
      baseSignals({ onboardingComplete: false }),
    );
    expect(briefing.stateLetter).toBe("A");
    expect(briefing.primaryAction.kind).toBe("onboarding");
    expect(briefing.capabilityAssigned).toBe(false);
    expect(JSON.stringify(briefing)).not.toMatch(/\d+%/);
    expect(briefing.deliverxVerifiedInflated).toBe(false);
  });

  it("B — cites Experience plan and goal", () => {
    const briefing = buildDailyBriefing(baseSignals());
    expect(briefing.stateLetter).toBe("B");
    expect(briefing.whatToday).toMatch(/MediFlow|Start Experience/);
    expect(briefing.citations.some((c) => c.kind === "experience_plan")).toBe(
      true,
    );
    expect(briefing.cards.some((c) => c.id === "goal")).toBe(true);
    expect(JSON.stringify(briefing)).not.toMatch(/\d+%/);
  });

  it("C — cites enrolment and evidence counts", () => {
    const briefing = buildDailyBriefing(
      baseSignals({
        hasActiveExperienceWork: true,
        experienceEnrolmentId: "enrol-abc",
        experienceCompanyName: "MediFlow",
        experienceDay: 3,
        experienceEvidenceCount: 4,
        evidenceTotalCount: 4,
        hasExperienceEvidence: true,
      }),
    );
    expect(briefing.stateLetter).toBe("C");
    expect(briefing.whereAmI).toContain("Day 3");
    expect(briefing.whereAmI).toContain("MediFlow");
    expect(
      briefing.citations.some((c) => c.kind === "experience_enrolment"),
    ).toBe(true);
    expect(JSON.stringify(briefing)).not.toMatch(/\d+%/);
  });

  it("D — qualitative readiness; outcome counts; no Excellent", () => {
    const briefing = buildDailyBriefing(
      baseSignals({
        hasExperienceEvidence: true,
        experienceEvidenceCount: 2,
        interviewCount: 2,
        applicationCount: 3,
        confidenceBandLabel: "Moderate confidence",
        productIntent: "launchpad",
      }),
    );
    expect(briefing.stateLetter).toBe("D");
    expect(briefing.howProgressing).toMatch(/interview|application/i);
    expect(JSON.stringify(briefing)).not.toMatch(/Excellent/i);
    expect(JSON.stringify(briefing)).not.toMatch(/\d+%/);
    expect(briefing.cards.some((c) => c.id === "career-readiness")).toBe(true);
  });

  it("omits Verified card when attested count is zero", () => {
    const briefing = buildDailyBriefing(baseSignals({ verifiedClaimCount: 0 }));
    expect(briefing.cards.some((c) => c.id === "verified-attested")).toBe(
      false,
    );
  });

  it("includes Verified card only for positive attested count", () => {
    const briefing = buildDailyBriefing(
      baseSignals({
        hasExperienceEvidence: true,
        experienceEvidenceCount: 1,
        verifiedClaimCount: 2,
      }),
    );
    const card = briefing.cards.find((c) => c.id === "verified-attested");
    expect(card?.body).toMatch(/2 claim/);
    expect(card?.whyHere).toMatch(/T8/);
  });

  it("attaches thin Workspace card when requested (E deferred)", () => {
    const briefing = buildDailyBriefing(
      baseSignals({ showWorkspaceSummary: true }),
    );
    const card = briefing.cards.find((c) => c.id === "workspace-thin");
    expect(card?.primaryAction?.href).toBe("/workspace");
    expect(card?.body).not.toMatch(/programme health|Excellent/i);
  });

  it("every card has whyHere", () => {
    const briefing = buildDailyBriefing(
      baseSignals({
        hasActiveExperienceWork: true,
        experienceCompanyName: "MediFlow",
        experienceDay: 1,
        showWorkspaceSummary: true,
        verifiedClaimCount: 1,
      }),
    );
    for (const card of briefing.cards) {
      expect(card.whyHere.trim().length).toBeGreaterThan(0);
    }
  });
});
