import { describe, expect, it } from "vitest";
import {
  buildFounderBoardMemoNarrative,
  buildFounderBoardMemoSubtitle,
} from "./founder-narrative-summary";

describe("founder-narrative-summary", () => {
  it("builds business-focused narrative when runway and decisions need attention", () => {
    const narrative = buildFounderBoardMemoNarrative({
      projectName: "Alpha",
      runwayMonths: 5,
      pendingDecisionsCount: 2,
      pendingReviewCount: 1,
      portfolioOnTrack: 1,
      portfolioTotal: 3,
      primaryObjectiveProgress: 55,
      primaryObjectiveTitle: "Reach PMF",
    });

    expect(narrative).toMatch(/Alpha/i);
    expect(narrative).toMatch(/runway/i);
    expect(narrative).toMatch(/decision/i);
    expect(narrative).not.toMatch(/blocked task/i);
  });

  it("returns calm narrative when nothing blocks the business", () => {
    expect(
      buildFounderBoardMemoNarrative({
        runwayMonths: 14,
        pendingDecisionsCount: 0,
        pendingReviewCount: 0,
        portfolioOnTrack: 2,
        portfolioTotal: 2,
      }),
    ).toMatch(/within range/i);
  });

  it("uses fallback AI summary when provided and no blockers", () => {
    expect(
      buildFounderBoardMemoNarrative({
        runwayMonths: 14,
        pendingDecisionsCount: 0,
        pendingReviewCount: 0,
        portfolioOnTrack: 2,
        portfolioTotal: 2,
        fallbackSummary: "Q2 focus: expand EU channel partnerships.",
      }),
    ).toBe("Q2 focus: expand EU channel partnerships.");
  });

  it("builds board memo subtitle in executive tone", () => {
    expect(
      buildFounderBoardMemoSubtitle({
        projectName: "Alpha",
        pendingDecisionsCount: 1,
        pendingReviewCount: 2,
      }),
    ).toBe("Alpha — 1 decision for you · 2 items to sign off.");

    expect(
      buildFounderBoardMemoSubtitle({
        pendingDecisionsCount: 0,
        pendingReviewCount: 0,
      }),
    ).toMatch(/Board memo/i);
  });
});
