import { describe, expect, it } from "vitest";
import {
  attentionSeverityPct,
  budgetSpendPct,
  buildGovernanceTabBarSegments,
  buildMilestoneTimelineSegments,
  buildRaidBarSegments,
  clampPct,
  governanceTabProgressPct,
  milestoneProgressPct,
  pendingReviewBarPct,
  pmRaidHref,
  teamJoinPct,
} from "./pm-viz-helpers";

describe("pm-viz-helpers", () => {
  it("clamps percentages to 0–100", () => {
    expect(clampPct(-5)).toBe(0);
    expect(clampPct(150)).toBe(100);
    expect(clampPct(62.4)).toBe(62);
  });

  it("parses budget spend ratio from label", () => {
    expect(budgetSpendPct("£120k / £200k")).toBeNull();
    expect(budgetSpendPct("120 / 200")).toBe(60);
    expect(budgetSpendPct("invalid")).toBeNull();
  });

  it("builds milestone and team progress bars", () => {
    expect(
      milestoneProgressPct(
        [
          { phase: "A", status: "done" },
          { phase: "B", status: "active" },
        ],
        4,
      ),
    ).toBe(25);

    expect(teamJoinPct(2, 4)).toBe(50);
    expect(pendingReviewBarPct(2)).toBe(25);
  });

  it("maps attention wait days to severity bar width", () => {
    expect(attentionSeverityPct(0)).toBeGreaterThan(attentionSeverityPct(7));
    expect(attentionSeverityPct(0)).toBe(100);
  });

  it("builds RAID and governance bar segments from counts", () => {
    const raidSegments = buildRaidBarSegments({
      highRisk: 2,
      assumptions: 1,
      issues: 0,
      dependencies: 3,
    });
    expect(raidSegments).toHaveLength(3);
    expect(raidSegments.map((s) => s.id)).toEqual(["highRisk", "assumptions", "dependencies"]);

    const tabCounts = { risks: 4, decisions: 2, changes: 1, approvals: 3 };
    const govSegments = buildGovernanceTabBarSegments(tabCounts);
    expect(govSegments).toHaveLength(4);
    expect(governanceTabProgressPct(4, tabCounts)).toBe(40);
  });

  it("builds equal-width milestone timeline segments", () => {
    const segments = buildMilestoneTimelineSegments([
      { phase: "Discovery", status: "done" },
      { phase: "Build", status: "active" },
      { phase: "Launch", status: "pending" },
    ]);
    expect(segments).toHaveLength(3);
    expect(segments.every((s) => s.widthPct === 100 / 3)).toBe(true);
  });

  it("resolves RAID href without dead-end anchors", () => {
    expect(pmRaidHref("proj-1")).toBe("/project/proj-1/delivery#raid");
    expect(pmRaidHref()).toBe("/workspace/dashboard");
    expect(pmRaidHref()).not.toContain("#");
  });
});
