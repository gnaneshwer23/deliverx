"use client";

import { usePmDashboardMode } from "@/components/delivery-pm/pm-mission-panel-switch";
import { FirstLoginFlowStageBar } from "@/components/workspace-flow/first-login-flow-stage-bar";
import type { WorkspaceFlowStageState } from "@/lib/workspace-flow-stages";

export function PmFirstLoginStageBarSlot({
  projectId,
  stage,
  onboardMode,
}: {
  projectId: string;
  stage: WorkspaceFlowStageState;
  onboardMode: boolean;
}) {
  const pmMode = usePmDashboardMode();
  const visible = onboardMode || pmMode === "day-one";

  if (!visible) return null;

  return (
    <FirstLoginFlowStageBar projectId={projectId} stage={stage} prominent={onboardMode} />
  );
}
