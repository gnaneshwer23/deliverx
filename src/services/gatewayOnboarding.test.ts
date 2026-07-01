import { describe, expect, it } from "vitest";
import {
  BOOTSTRAP_PERSONA_KEYS,
  canProceedFromGoReview,
  formatObStepLabel,
  formatPersonaGatewayObStep,
  formatSponsorGatewayObStep,
  formatTeamMemberGatewayObStep,
  gatewayStepRoute,
  getInitialGatewayStepForRole,
  getPostRoleSelectRedirect,
  onboardingStepCount,
  projectFormStepNumber,
  projectFormStepToGatewayStep,
  resolveGatewayRedirect,
  resolveOnboardingFlowKind,
  runGatewayOnboardingEngineSmokeTest,
  simulatePersonaOnboardingPath,
  SPONSOR_GATEWAY_STEP_COUNT,
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
    expect(getPostRoleSelectRedirect("pm")).toBe("/workspace/pm-mission?onboard=1");
    expect(getPostRoleSelectRedirect("ba")).toBe("/onboarding/persona");
    expect(getPostRoleSelectRedirect("team_member")).toBe("/onboarding/complete");
  });

  it("routes PM through mission control instead of persona wizard", () => {
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "project",
        role: "pm",
      }),
    ).toBe("/workspace/pm-mission?onboard=1");
    expect(
      resolveGatewayRedirect({
        hasOrg: true,
        hasRole: true,
        gatewayStep: "business_case",
        role: "pm",
      }),
    ).toBe("/workspace/pm-mission?onboard=1");
  });

  it("simulates PM onboarding without persona wizard", () => {
    const result = simulatePersonaOnboardingPath({ role: "pm" });
    expect(result.ok).toBe(true);
    expect(result.steps).toEqual(["role_select", "workspace"]);
    expect(result.missionHref).toBe("/workspace/pm-mission?onboard=1");
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

  it("simulates BA persona onboarding without GO gate", () => {
    const result = simulatePersonaOnboardingPath({ role: "ba" });
    expect(result.ok).toBe(true);
    expect(result.missionHref).toBe("/workspace/ba");
  });

  it("uses a single sponsor step count across onboarding surfaces", () => {
    expect(SPONSOR_GATEWAY_STEP_COUNT).toBe(5);
    expect(formatSponsorGatewayObStep("account")).toBe("Step 1 of 5 · Account");
    expect(formatSponsorGatewayObStep("team")).toBe("Step 5 of 5 · Team");
    expect(formatPersonaGatewayObStep("PM")).toBe("Step 2 of 3 · PM workspace");
    expect(formatTeamMemberGatewayObStep(1)).toBe("Step 1 of 2 · Account");
    expect(formatTeamMemberGatewayObStep(2)).toBe("Step 2 of 2 · Ready");
  });

  it("defaults unknown roles to the founder sponsor flow", () => {
    expect(resolveOnboardingFlowKind(null)).toBe("sponsor");
    expect(onboardingStepCount(null)).toBe(5);
    expect(formatObStepLabel(1, null, "Account")).toBe("Step 1 of 5 · Account");
  });

  it("maps project form substeps to sponsor gateway step numbers", () => {
    expect(projectFormStepNumber("project")).toBe(2);
    expect(projectFormStepNumber("brief")).toBe(3);
    expect(projectFormStepNumber("review")).toBe(4);
    expect(projectFormStepNumber("discovery")).toBe(4);
    expect(projectFormStepNumber("create")).toBe(4);
  });
});
