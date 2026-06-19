import { describe, expect, it } from "vitest";
import {
  buildFounderContextHref,
  buildFounderDecisionCentreHref,
  buildFounderSteadyStateSubtitle,
} from "./founder-steady-state-panels";

describe("founder-steady-state-panels", () => {
  it("builds steady-state subtitle from follow-up counts", () => {
    expect(
      buildFounderSteadyStateSubtitle({
        projectName: "Alpha",
        pendingDecisionsCount: 2,
        pendingReviewCount: 1,
        criticalRisks: 0,
      }),
    ).toBe("Alpha — 2 decisions waiting · 1 output to review.");

    expect(
      buildFounderSteadyStateSubtitle({
        pendingDecisionsCount: 0,
        pendingReviewCount: 0,
        criticalRisks: 0,
      }),
    ).toBe("Executive steady-state — portfolio on track, no urgent escalations.");
  });

  it("builds founder header anchor hrefs with optional project param", () => {
    expect(buildFounderDecisionCentreHref("proj-1")).toBe(
      "/workspace/founder?project=proj-1#decisions",
    );
    expect(buildFounderContextHref()).toBe("/workspace/founder#founder-context");
  });
});
