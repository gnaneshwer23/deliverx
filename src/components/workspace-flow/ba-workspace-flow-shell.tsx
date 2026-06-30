"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BaExtractionReviewPanel } from "@/components/workspace-flow/ba-extraction-review-panel";
import { WorkspaceFlowStageBar } from "@/components/workspace-flow/workspace-flow-stage-bar";
import { resolveWorkspaceFlowStage } from "@/lib/workspace-flow-stages";
import type { WorkspaceFlowSnapshot } from "@/services/workspaceFlowSnapshot";

export function BaWorkspaceFlowShell({
  projectId,
  projectName,
  snapshot,
  storiesReady,
  children,
}: {
  projectId: string;
  projectName: string;
  snapshot: WorkspaceFlowSnapshot;
  storiesReady: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showReview =
    searchParams.get("flow") === "review" || searchParams.get("welcome") === "1";
  const [reviewDismissed, setReviewDismissed] = useState(false);

  const stage = resolveWorkspaceFlowStage({
    hasBusinessCase: snapshot.businessCase.hasBusinessCase,
    extractionStatus: snapshot.businessCase.extractionStatus,
    baInviteActive: snapshot.businessCase.baInviteActive,
    baJoined: Boolean(snapshot.businessCase.baMember),
    requirementsExtracted: snapshot.counts.requirements ?? 0,
    storiesReady,
  });

  const shouldShowReview =
    showReview &&
    !reviewDismissed &&
    snapshot.businessCase.hasBusinessCase &&
    snapshot.nothingAppliedYet;

  function dismissReview() {
    setReviewDismissed(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("flow");
    params.delete("welcome");
    const qs = params.toString();
    router.replace(qs ? `/workspace/ba?${qs}` : "/workspace/ba");
  }

  return (
    <div className="space-y-4">
      <WorkspaceFlowStageBar stage={stage} />
      {shouldShowReview ? (
        <BaExtractionReviewPanel
          projectId={projectId}
          projectName={projectName}
          counts={snapshot.counts}
          nothingAppliedYet={snapshot.nothingAppliedYet}
          aiSummary={snapshot.aiSummary}
          pendingReviewId={snapshot.pendingReviewId}
          onContinue={dismissReview}
        />
      ) : null}
      {children}
    </div>
  );
}
