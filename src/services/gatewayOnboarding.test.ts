import { describe, expect, it } from "vitest";
import {
  BOOTSTRAP_PERSONA_KEYS,
  canProceedFromGoReview,
  gatewayStepRoute,
  projectFormStepToGatewayStep,
  resolveGatewayRedirect,
  runGatewayOnboardingEngineSmokeTest,
} from "./gatewayOnboardingEngine";

describe("gatewayOnboardingEngine", () => {
  it("passes engine smoke test", () => {
    const result = runGatewayOnboardingEngineSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.stepCount).toBe(6);
    expect(result.personaCount).toBe(7);
  });

  it("maps project form steps to gateway steps", () => {
    expect(projectFormStepToGatewayStep("project")).toBe("project");
    expect(projectFormStepToGatewayStep("brief")).toBe("business_case");
    expect(projectFormStepToGatewayStep("review")).toBe("ai_review");
  });

  it("routes gateway steps to paths", () => {
    expect(gatewayStepRoute("account")).toBe("/onboarding/organisation");
    expect(gatewayStepRoute("team")).toBe("/onboarding/team");
    expect(gatewayStepRoute("business_case")).toBe("/project/new");
  });

  it("blocks no-go and conditional go without waiver", () => {
    expect(
      canProceedFromGoReview({
        recommendation: "no_go",
        goAccepted: true,
        conditionalWaiver: false,
      }).ok,
    ).toBe(false);
    expect(
      canProceedFromGoReview({
        recommendation: "conditional_go",
        goAccepted: true,
        conditionalWaiver: false,
      }).ok,
    ).toBe(false);
    expect(
      canProceedFromGoReview({
        recommendation: "conditional_go",
        goAccepted: true,
        conditionalWaiver: true,
      }).ok,
    ).toBe(true);
  });

  it("resolves redirects for incomplete gateway", () => {
    expect(
      resolveGatewayRedirect({ hasOrg: true, hasRole: true, gatewayStep: "team" }),
    ).toBe("/onboarding/team");
    expect(
      resolveGatewayRedirect({ hasOrg: true, hasRole: true, gatewayStep: "complete" }),
    ).toBeNull();
  });

  it("lists seven bootstrap personas", () => {
    expect(BOOTSTRAP_PERSONA_KEYS).toEqual([
      "ba",
      "product",
      "pm",
      "engineer",
      "scrum",
      "qa",
      "founder",
    ]);
  });
});
