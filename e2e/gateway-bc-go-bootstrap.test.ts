import { describe, expect, it } from "vitest";
import {
  runBcGoBootstrapSmokeTest,
  simulateBcGoBootstrapLoop,
} from "@/services/gatewayBcGoBootstrapEngine";
import { simulatePersonaOnboardingPath } from "@/services/gatewayOnboardingEngine";

describe("E2E: BC → GO → bootstrap loop", () => {
  it("completes the sponsor gateway flow with GO acceptance", () => {
    const result = simulateBcGoBootstrapLoop({
      brief: "Launch a digital patient portal with online booking and results access.",
      goAccepted: true,
    });

    expect(result.ok).toBe(true);
    expect(result.steps).toEqual([
      "business_case",
      "ai_review",
      "go_gate",
      "project_create",
      "bootstrap",
    ]);
    expect(result.recommendation).toBe("go");
    expect(result.bootstrapPersonas).toHaveLength(7);
  });

  it("blocks no-go recommendations", () => {
    const result = simulateBcGoBootstrapLoop({ goAccepted: false });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Accept the GO/i);
  });

  it("passes smoke test harness", () => {
    const smoke = runBcGoBootstrapSmokeTest();
    expect(smoke.ok).toBe(true);
  });

  it("routes BA signup to persona mission without forced GO gate", () => {
    const result = simulatePersonaOnboardingPath({ role: "ba" });
    expect(result.ok).toBe(true);
    expect(result.skippedGoGate).toBe(true);
    expect(result.steps).toEqual(["role_select", "persona_wizard", "workspace"]);
    expect(result.missionHref).toBe("/workspace/ba");
    expect(result.steps).not.toContain("go_gate");
  });

  it.skipIf(!process.env.OPENAI_API_KEY)("live AI review (requires OPENAI_API_KEY)", async () => {
    const { reviewBusinessCase } = await import("@/services/aiBusinessCaseReview");
    const review = await reviewBusinessCase(
      "Build an AI-assisted delivery platform for enterprise PMOs. Project: DeliverX Pilot.",
    );
    expect(["go", "conditional_go", "no_go"]).toContain(review.recommendation);
  });
});
