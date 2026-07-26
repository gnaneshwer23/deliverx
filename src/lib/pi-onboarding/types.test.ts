import { describe, expect, it } from "vitest";
import {
  DEFAULT_PI_ONBOARDING_STEP_SET,
  PI_ONBOARDING_STEP_SETS,
  explainRecommendation,
  isSkippableStep,
  nextStep,
  prevStep,
  recommendPath,
  resolveStepForSet,
  stepsForSet,
  summariseForReview,
  validateStep,
  whyWeAsk,
  type PiOnboardingPayload,
  type PiOnboardingStep,
} from "@/lib/pi-onboarding/types";
import { resolveOnboardingStepSet } from "@/lib/pi-onboarding/flag";

const COMPLETE_V2_PAYLOAD: PiOnboardingPayload = {
  firstName: "Ada",
  lastName: "Lovelace",
  professionalIdentity: "Product manager",
  currentSituation: "employed_pm",
  careerObjective: "Move into a senior product role in healthtech.",
  targetRole: "Senior Product Manager",
  targetSeniority: "senior",
};

describe("step sets", () => {
  it("ships an eight-step conversation as the default shape", () => {
    expect(DEFAULT_PI_ONBOARDING_STEP_SET).toBe("v2-conversation");
    expect(stepsForSet("v2-conversation")).toEqual([
      "welcome",
      "identity",
      "targets",
      "strengths",
      "evidence",
      "working_style",
      "review",
      "path",
    ]);
  });

  it("keeps the previously shipped six-step set available for rollback", () => {
    expect(stepsForSet("v1-six-step")).toEqual([
      "identity",
      "situation",
      "targets",
      "evidence",
      "consent",
      "path",
    ]);
  });

  it("walks forwards and backwards within the active set only", () => {
    expect(nextStep("welcome", "v2-conversation")).toBe("identity");
    expect(nextStep("identity", "v2-conversation")).toBe("targets");
    expect(nextStep("path", "v2-conversation")).toBe("completed");
    expect(prevStep("welcome", "v2-conversation")).toBeNull();
    expect(prevStep("review", "v2-conversation")).toBe("working_style");
    expect(nextStep("identity", "v1-six-step")).toBe("situation");
  });

  it("marks only non-essential steps skippable", () => {
    expect(isSkippableStep("strengths")).toBe(true);
    expect(isSkippableStep("evidence")).toBe(true);
    expect(isSkippableStep("working_style")).toBe(true);
    expect(isSkippableStep("identity")).toBe(false);
    expect(isSkippableStep("review")).toBe(false);
    expect(isSkippableStep("path")).toBe(false);
  });

  it("explains why every step exists", () => {
    const allSteps = new Set<PiOnboardingStep>([
      ...PI_ONBOARDING_STEP_SETS["v1-six-step"],
      ...PI_ONBOARDING_STEP_SETS["v2-conversation"],
    ]);
    for (const step of allSteps) {
      expect(whyWeAsk(step).length).toBeGreaterThan(20);
    }
  });
});

describe("resolveStepForSet", () => {
  it("keeps a step that exists in the active set", () => {
    expect(resolveStepForSet("evidence", "v2-conversation")).toBe("evidence");
  });

  it("resumes retired six-step ids on the nearest eight-step question", () => {
    expect(resolveStepForSet("situation", "v2-conversation")).toBe("identity");
    expect(resolveStepForSet("consent", "v2-conversation")).toBe("review");
  });

  it("resumes eight-step ids on the nearest six-step question after rollback", () => {
    expect(resolveStepForSet("welcome", "v1-six-step")).toBe("identity");
    expect(resolveStepForSet("strengths", "v1-six-step")).toBe("targets");
    expect(resolveStepForSet("working_style", "v1-six-step")).toBe("evidence");
    expect(resolveStepForSet("review", "v1-six-step")).toBe("consent");
  });

  it("falls back to the first step for unknown or missing ids", () => {
    expect(resolveStepForSet(null, "v2-conversation")).toBe("welcome");
    expect(resolveStepForSet("not-a-step", "v2-conversation")).toBe("welcome");
    expect(resolveStepForSet(undefined, "v1-six-step")).toBe("identity");
  });
});

describe("validateStep", () => {
  it("never blocks the welcome step", () => {
    expect(validateStep("welcome", {})).toEqual({ ok: true });
  });

  it("requires identity fields", () => {
    expect(validateStep("identity", {})).toEqual({
      ok: false,
      message: "Enter your first name (1–80 characters).",
    });
    expect(
      validateStep("identity", {
        firstName: "Ada",
        lastName: "Lovelace",
        professionalIdentity: "Product manager",
        currentSituation: "employed_pm",
      }),
    ).toEqual({ ok: true });
  });

  it("asks for current situation on the eight-step background step only", () => {
    const withoutSituation: PiOnboardingPayload = {
      firstName: "Ada",
      lastName: "Lovelace",
      professionalIdentity: "Product manager",
    };
    expect(validateStep("identity", withoutSituation, "v2-conversation")).toEqual({
      ok: false,
      message: "Select your current situation.",
    });
    expect(validateStep("identity", withoutSituation, "v1-six-step")).toEqual({ ok: true });
  });

  it("asks for the objective on the career direction step in the eight-step set", () => {
    const withoutObjective: PiOnboardingPayload = {
      targetRole: "Senior Product Manager",
      targetSeniority: "senior",
    };
    expect(validateStep("targets", withoutObjective, "v2-conversation").ok).toBe(false);
    expect(validateStep("targets", withoutObjective, "v1-six-step")).toEqual({ ok: true });
  });

  it("treats strengths and working style as optional", () => {
    expect(validateStep("strengths", {})).toEqual({ ok: true });
    expect(validateStep("working_style", {})).toEqual({ ok: true });
  });

  it("bounds self-reported strengths selections", () => {
    expect(
      validateStep("strengths", {
        selfReportedStrengths: ["a", "b", "c", "d"],
      }),
    ).toEqual({ ok: false, message: "Choose up to 3 strengths." });
  });

  it("allows no prior experience on evidence step", () => {
    expect(validateStep("evidence", { noPriorExperience: true })).toEqual({ ok: true });
  });

  it("requires consent", () => {
    expect(validateStep("consent", { visibilityDefault: "private" }).ok).toBe(false);
  });

  it("keeps the consent rail on the review step when consent has no step of its own", () => {
    expect(validateStep("review", { visibilityDefault: "private" }, "v2-conversation").ok).toBe(
      false,
    );
    expect(
      validateStep(
        "review",
        { consentAnalysis: true, visibilityDefault: "private" },
        "v2-conversation",
      ),
    ).toEqual({ ok: true });
    expect(validateStep("review", {}, "v1-six-step")).toEqual({ ok: true });
  });
});

describe("recommendPath", () => {
  it("recommends experience when no prior evidence", () => {
    expect(recommendPath({ noPriorExperience: true })).toBe("experience");
  });

  it("recommends launchpad when between roles with experience", () => {
    const payload: PiOnboardingPayload = {
      currentSituation: "between_roles",
      existingExperienceSummary:
        "Led two product discovery cycles for a B2B billing tool.",
    };
    expect(recommendPath(payload)).toBe("launchpad");
  });
});

describe("explainRecommendation", () => {
  it("gives deterministic reasons for the recommended path", () => {
    const result = explainRecommendation({
      ...COMPLETE_V2_PAYLOAD,
      existingExperienceSummary: "Shipped a payments onboarding revamp end to end.",
    });
    expect(result.path).toBe("launchpad");
    expect(result.dataSufficiency).toBe("sufficient");
    expect(result.reasons.some((reason) => reason.includes("Senior Product Manager"))).toBe(true);
  });

  it("flags limited data and offers a starter experience when optional steps are skipped", () => {
    const result = explainRecommendation({ targetRole: "Product Manager" });
    expect(result.path).toBe("experience");
    expect(result.dataSufficiency).toBe("limited");
    expect(result.reasons.some((reason) => reason.includes("default starter Experience"))).toBe(
      true,
    );
  });
});

describe("summariseForReview", () => {
  it("labels every recorded answer as self-reported or imported, never verified", () => {
    const rows = summariseForReview({
      ...COMPLETE_V2_PAYLOAD,
      selfReportedStrengths: ["product_discovery"],
      cvImportNote: "linkedin.com/in/example",
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.sourceLabel === "Self-reported" || row.sourceLabel === "Imported draft")).toBe(
      true,
    );
    expect(rows.some((row) => /verified/i.test(row.sourceLabel))).toBe(false);
  });

  it("routes each row back to a step in the active set so answers stay editable", () => {
    const v2Steps = stepsForSet("v2-conversation");
    for (const row of summariseForReview(COMPLETE_V2_PAYLOAD, "v2-conversation")) {
      expect(v2Steps).toContain(row.step);
    }
    const v1Steps = stepsForSet("v1-six-step");
    for (const row of summariseForReview(COMPLETE_V2_PAYLOAD, "v1-six-step")) {
      expect(v1Steps).toContain(row.step);
    }
  });

  it("marks missing optional answers rather than inventing them", () => {
    const rows = summariseForReview({});
    expect(rows.find((row) => row.label === "Timeframe")?.value).toBe("Not provided");
    expect(rows.find((row) => row.label === "Imports")?.value).toBe("None added");
  });
});

describe("resolveOnboardingStepSet", () => {
  it("defaults to the eight-step conversation", () => {
    expect(resolveOnboardingStepSet({})).toBe("v2-conversation");
    expect(resolveOnboardingStepSet({ DELIVERX_ONBOARDING_STEP_SET: "" })).toBe("v2-conversation");
    expect(resolveOnboardingStepSet({ DELIVERX_ONBOARDING_STEP_SET: "nonsense" })).toBe(
      "v2-conversation",
    );
  });

  it("rolls back to the six-step set on request", () => {
    expect(resolveOnboardingStepSet({ DELIVERX_ONBOARDING_STEP_SET: "v1-six-step" })).toBe(
      "v1-six-step",
    );
    expect(resolveOnboardingStepSet({ DELIVERX_ONBOARDING_STEP_SET: " V1-Six-Step " })).toBe(
      "v1-six-step",
    );
  });
});
