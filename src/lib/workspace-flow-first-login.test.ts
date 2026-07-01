import { describe, expect, it } from "vitest";
import { resolveWorkspaceFlowStage } from "@/lib/workspace-flow-stages";
import {
  canDismissWorkspaceFlowStageBar,
  shouldAutoHideWorkspaceFlowStageBar,
} from "@/lib/workspace-flow-first-login";

describe("workspace flow stage bar dismiss", () => {
  it("allows dismiss after BA review is complete", () => {
    const stage = resolveWorkspaceFlowStage({
      hasBusinessCase: true,
      extractionStatus: "queued",
      baInviteActive: true,
      baJoined: true,
      requirementsExtracted: 5,
      storiesReady: 0,
    });
    expect(stage.completedThrough).toBe(3);
    expect(canDismissWorkspaceFlowStageBar(stage)).toBe(true);
    expect(shouldAutoHideWorkspaceFlowStageBar(stage)).toBe(false);
  });

  it("auto-hides after delivery stories are ready", () => {
    const stage = resolveWorkspaceFlowStage({
      hasBusinessCase: true,
      extractionStatus: "complete",
      baInviteActive: true,
      baJoined: true,
      requirementsExtracted: 5,
      storiesReady: 3,
    });
    expect(stage.completedThrough).toBe(4);
    expect(canDismissWorkspaceFlowStageBar(stage)).toBe(true);
    expect(shouldAutoHideWorkspaceFlowStageBar(stage)).toBe(true);
  });

  it("does not allow dismiss on empty upload step", () => {
    const stage = resolveWorkspaceFlowStage({
      hasBusinessCase: false,
      extractionStatus: "none",
      baInviteActive: false,
      baJoined: false,
      requirementsExtracted: 0,
      storiesReady: 0,
    });
    expect(stage.currentIndex).toBe(0);
    expect(canDismissWorkspaceFlowStageBar(stage)).toBe(false);
  });
});
