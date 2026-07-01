import {
  resolveWorkspaceFlowStage,
  type ResolveWorkspaceFlowStageInput,
  type WorkspaceFlowStageState,
} from "@/lib/workspace-flow-stages";
import type { WorkspaceFlowSnapshot } from "@/services/workspaceFlowSnapshot";

export function emptyWorkspaceFlowStageInput(): ResolveWorkspaceFlowStageInput {
  return {
    hasBusinessCase: false,
    extractionStatus: "none",
    baInviteActive: false,
    baJoined: false,
    requirementsExtracted: 0,
    storiesReady: 0,
  };
}

export function resolveWorkspaceFlowStageFromSnapshot(
  snapshot: WorkspaceFlowSnapshot | null | undefined,
  options?: { storiesReady?: number; requirementsExtracted?: number },
): WorkspaceFlowStageState {
  if (!snapshot) {
    return resolveWorkspaceFlowStage(emptyWorkspaceFlowStageInput());
  }

  return resolveWorkspaceFlowStage({
    hasBusinessCase: snapshot.businessCase.hasBusinessCase,
    extractionStatus: snapshot.businessCase.extractionStatus,
    baInviteActive: snapshot.businessCase.baInviteActive,
    baJoined: Boolean(snapshot.businessCase.baMember),
    requirementsExtracted: options?.requirementsExtracted ?? snapshot.counts.requirements ?? 0,
    storiesReady: options?.storiesReady ?? 0,
  });
}
