"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PmWelcomeBridge } from "@/components/delivery-pm/pm-welcome-bridge";
import { PmDashboardModeContext } from "@/components/delivery-pm/pm-mission-panel-switch";
import {
  isPmBridgeDismissed,
  resolvePmDashboardMode,
  type PmDashboardMode,
} from "@/lib/pm-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function PmMissionShell({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  teamInvitesPending,
  summary,
  teamJoinedCount,
  children,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  teamInvitesPending: number;
  summary: ProjectBootstrapSummary | null;
  teamJoinedCount?: number;
  children: ReactNode;
}) {
  const [bridgeDismissed, setBridgeDismissed] = useState(() =>
    projectId ? isPmBridgeDismissed(projectId) : false,
  );

  const mode: PmDashboardMode = useMemo(
    () =>
      resolvePmDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        teamInvitesPending,
        bridgeDismissed,
      }),
    [projectId, hasBootstrapSummary, pendingReviewCount, teamInvitesPending, bridgeDismissed],
  );

  const showBridge = mode === "day-one" && projectId && summary;

  return (
    <PmDashboardModeContext.Provider value={mode}>
      <div data-pm-mode={mode}>
        {showBridge ? (
          <PmWelcomeBridge
            projectId={projectId}
            summary={summary}
            teamJoinedCount={teamJoinedCount}
            onDismiss={() => setBridgeDismissed(true)}
          />
        ) : null}
        {children}
      </div>
    </PmDashboardModeContext.Provider>
  );
}
