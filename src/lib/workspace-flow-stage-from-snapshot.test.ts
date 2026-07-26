import { describe, expect, it } from "vitest";
import { resolveWorkspaceFlowStageFromSnapshot } from "@/lib/workspace-flow-stage-from-snapshot";

describe("resolveWorkspaceFlowStageFromSnapshot", () => {
  it("starts at upload when snapshot is missing", () => {
    const stage = resolveWorkspaceFlowStageFromSnapshot(null);
    expect(stage.currentIndex).toBe(0);
    expect(stage.steps[0]?.label).toBe("Upload business case");
    expect(stage.steps[0]?.status).toBe("current");
  });

  it("marks earlier steps done for BA welcome review when BC exists", () => {
    const stage = resolveWorkspaceFlowStageFromSnapshot(
      {
        businessCase: {
          hasBusinessCase: true,
          charterExcerpt: "Excerpt",
          charterUpdatedAt: "2026-01-01",
          extractionStatus: "queued",
          pendingReviewId: "rev-1",
          pendingReviewTitle: "BC",
          baMember: { userId: "u1", name: "Alex", joinedAt: "2026-01-02" },
          baInviteActive: true,
          baInviteJoinUrl: null,
          baInviteExpiresAt: null,
        },
        counts: { requirements: null, gaps: 2, risks: 1, objectives: 0, traceability: null },
        nothingAppliedYet: true,
        charterTitle: "BC",
        aiSummary: "Summary",
        pendingReviewId: "rev-1",
      },
      { storiesReady: 0, requirementsExtracted: 0 },
    );
    expect(stage.completedThrough).toBe(2);
    expect(stage.currentIndex).toBe(3);
    expect(stage.steps[3]?.status).toBe("current");
    expect(stage.steps[3]?.short).toBe("Review");
  });
});
