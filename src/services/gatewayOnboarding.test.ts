import { describe, expect, it } from "vitest";
import {
  BOOTSTRAP_PERSONA_KEYS,
  canProceedFromGoReview,
  gatewayStepRoute,
  getInitialGatewayStepForRole,
  getPostRoleSelectRedirect,
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

  it("routes executives through sponsor gateway paths", () => {
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "project",
        role: "executive",
      }),
    ).toBe("/project/new");
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "ai_review",
        role: "executive",
      }),
    ).toBe("/project/new");
  });

  it("routes non-executive roles to persona onboarding", () => {
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "project",
        role: "ba",
      }),
    ).toBe("/onboarding/persona");
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "business_case",
        role: "engineer",
      }),
    ).toBe("/onboarding/persona");
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "team",
        role: "product_manager",
      }),
    ).toBe("/onboarding/complete");
  });

  it("skips gateway redirect for team_member when complete", () => {
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "project",
        role: "team_member",
      }),
    ).toBeNull();
  });

  it("selects post-role redirect by persona", () => {
    expect(getPostRoleSelectRedirect("executive")).toBe("/project/new");
    expect(getPostRoleSelectRedirect("ba")).toBe("/onboarding/persona");
    expect(getPostRoleSelectRedirect("team_member")).toBe("/onboarding/complete");
  });

  it("assigns initial gateway step by role", () => {
    expect(getInitialGatewayStepForRole("executive")).toBe("project");
    expect(getInitialGatewayStepForRole("pm")).toBe("project");
    expect(getInitialGatewayStepForRole("team_member")).toBe("complete");
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
