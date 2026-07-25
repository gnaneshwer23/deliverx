import { describe, expect, it } from "vitest";
import {
  recommendPath,
  validateStep,
  type PiOnboardingPayload,
} from "@/lib/pi-onboarding/types";

describe("validateStep", () => {
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
      }),
    ).toEqual({ ok: true });
  });

  it("allows no prior experience on evidence step", () => {
    expect(
      validateStep("evidence", { noPriorExperience: true }),
    ).toEqual({ ok: true });
  });

  it("requires consent", () => {
    const result = validateStep("consent", { visibilityDefault: "private" });
    expect(result.ok).toBe(false);
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
