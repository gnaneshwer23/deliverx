import type { WorkspaceFlowStageState } from "@/lib/workspace-flow-stages";

export function workspaceFlowStageBarDismissKey(projectId: string): string {
  return `dx-workspace-flow-stage:${projectId}`;
}

export function isWorkspaceFlowStageBarDismissed(projectId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(workspaceFlowStageBarDismissKey(projectId)) === "dismissed";
}

export function dismissWorkspaceFlowStageBar(projectId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(workspaceFlowStageBarDismissKey(projectId), "dismissed");
}

/** Dismiss control appears once BA review is complete (step 4 in the 1-based flow). */
export function canDismissWorkspaceFlowStageBar(stage: WorkspaceFlowStageState): boolean {
  return stage.completedThrough >= 3;
}

/** Auto-hide after delivery step is complete — no need to keep the strip visible. */
export function shouldAutoHideWorkspaceFlowStageBar(stage: WorkspaceFlowStageState): boolean {
  return stage.completedThrough >= 4;
}
