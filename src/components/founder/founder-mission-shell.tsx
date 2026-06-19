"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FounderWelcomeBridge } from "@/components/founder/founder-welcome-bridge";
import { FounderDashboardModeContext } from "@/components/founder/founder-mission-panel-switch";
import {
  isFounderBridgeDismissed,
  resolveFounderDashboardMode,
  type FounderDashboardMode,
} from "@/lib/founder-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function FounderMissionShell({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  pendingDecisionsCount,
  summary,
  children,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  pendingDecisionsCount: number;
  summary: ProjectBootstrapSummary | null;
  children: ReactNode;
}) {
  const [bridgeDismissed, setBridgeDismissed] = useState(() =>
    projectId ? isFounderBridgeDismissed(projectId) : false,
  );

  const mode: FounderDashboardMode = useMemo(
    () =>
      resolveFounderDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        pendingDecisionsCount,
        bridgeDismissed,
      }),
    [
      projectId,
      hasBootstrapSummary,
      pendingReviewCount,
      pendingDecisionsCount,
      bridgeDismissed,
    ],
  );

  const showBridge = mode === "day-one" && projectId && summary;

  return (
    <FounderDashboardModeContext.Provider value={mode}>
      <div data-founder-mode={mode}>
        {showBridge ? (
          <FounderWelcomeBridge
            projectId={projectId}
            summary={summary}
            pendingDecisionsCount={pendingDecisionsCount}
            pendingReviewCount={pendingReviewCount}
            onDismiss={() => setBridgeDismissed(true)}
          />
        ) : null}
        {children}
      </div>
    </FounderDashboardModeContext.Provider>
  );
}
