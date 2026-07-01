"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BaExtractionReviewPanel } from "@/components/workspace-flow/ba-extraction-review-panel";
import { FirstLoginFlowStageBar } from "@/components/workspace-flow/first-login-flow-stage-bar";
import { resolveWorkspaceFlowStageFromSnapshot } from "@/lib/workspace-flow-stage-from-snapshot";
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
  const flowReview = searchParams.get("flow") === "review";
  const isWelcome = searchParams.get("welcome") === "1";
  const showFirstLoginStageBar = isWelcome && flowReview;
  const showReview = flowReview || isWelcome;
  const [reviewDismissed, setReviewDismissed] = useState(false);

  const stage = resolveWorkspaceFlowStageFromSnapshot(snapshot, { storiesReady });

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
    <div className="space-y-6">
      {showFirstLoginStageBar ? (
        <FirstLoginFlowStageBar projectId={projectId} stage={stage} prominent />
      ) : null}
      {shouldShowReview ? (
        <BaExtractionReviewPanel
          projectId={projectId}
          projectName={projectName}
          counts={snapshot.counts}
          nothingAppliedYet={snapshot.nothingAppliedYet}
          aiSummary={snapshot.aiSummary}
          pendingReviewId={snapshot.pendingReviewId}
          isWelcome={isWelcome}
          onContinue={dismissReview}
        />
      ) : null}
      {children}
    </div>
  );
}
