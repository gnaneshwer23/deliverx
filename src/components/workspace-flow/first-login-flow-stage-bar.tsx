"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WorkspaceFlowStageBar } from "@/components/workspace-flow/workspace-flow-stage-bar";
import {
  canDismissWorkspaceFlowStageBar,
  dismissWorkspaceFlowStageBar,
  isWorkspaceFlowStageBarDismissed,
  shouldAutoHideWorkspaceFlowStageBar,
} from "@/lib/workspace-flow-first-login";
import type { WorkspaceFlowStageState } from "@/lib/workspace-flow-stages";

export function FirstLoginFlowStageBar({
  projectId,
  stage,
  prominent = false,
}: {
  projectId: string;
  stage: WorkspaceFlowStageState;
  prominent?: boolean;
}) {
  const [dismissed, setDismissed] = useState(() => isWorkspaceFlowStageBarDismissed(projectId));
  const autoHidden = shouldAutoHideWorkspaceFlowStageBar(stage);

  useEffect(() => {
    if (autoHidden && !dismissed) {
      dismissWorkspaceFlowStageBar(projectId);
    }
  }, [autoHidden, dismissed, projectId]);

  if (dismissed || autoHidden) return null;

  const showDismiss = canDismissWorkspaceFlowStageBar(stage);

  function handleDismiss() {
    dismissWorkspaceFlowStageBar(projectId);
    setDismissed(true);
  }

  return (
    <div
      className={`relative mb-4 ${prominent ? "rounded-2xl ring-2 ring-[#1C4A2E]/15" : ""}`}
      data-panel="first-login-flow-stage-bar"
      data-prominent={prominent ? "true" : undefined}
    >
      <WorkspaceFlowStageBar stage={stage} className={showDismiss ? "pb-2" : ""} />
      {showDismiss ? (
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[var(--dx-rul)] bg-white px-2.5 py-1 text-[10px] font-medium text-[var(--dx-mut)] transition hover:border-[#1C4A2E]/30 hover:text-[#1C4A2E]"
            aria-label="Dismiss project workspace flow progress"
          >
            <X size={12} aria-hidden />
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
