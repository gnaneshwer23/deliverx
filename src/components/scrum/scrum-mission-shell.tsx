"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PersonaWelcomeBridge } from "@/components/dx/persona-welcome-bridge";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  SCRUM_BRIDGE_BODY,
  SCRUM_BRIDGE_HEADLINE,
  buildScrumWelcomeBridgeChips,
  dismissScrumBridge,
  isScrumBridgeDismissed,
  resolveScrumDashboardMode,
  type ScrumDashboardMode,
} from "@/lib/scrum-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function ScrumMissionShell({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  impedimentCount,
  blockedStories,
  summary,
  children,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  impedimentCount: number;
  blockedStories: number;
  summary: ProjectBootstrapSummary | null;
  children: ReactNode;
}) {
  const accent = getMissionPersonaAccent("scrum");
  const [bridgeDismissed, setBridgeDismissed] = useState(() =>
    projectId ? isScrumBridgeDismissed(projectId) : false,
  );

  const mode: ScrumDashboardMode = useMemo(
    () =>
      resolveScrumDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        impedimentCount,
        blockedStories,
        bridgeDismissed,
      }),
    [
      projectId,
      hasBootstrapSummary,
      pendingReviewCount,
      impedimentCount,
      blockedStories,
      bridgeDismissed,
    ],
  );

  const showBridge = mode === "day-one" && projectId && summary;

  return (
    <div data-scrum-mode={mode}>
      {showBridge ? (
        <PersonaWelcomeBridge
          testId="scrum-welcome-bridge"
          ariaLabel="Welcome to your scrum mission dashboard"
          accent={accent}
          headline={SCRUM_BRIDGE_HEADLINE}
          body={SCRUM_BRIDGE_BODY}
          chips={buildScrumWelcomeBridgeChips(summary, {
            pendingReviewCount,
            impedimentCount,
            blockedStories,
          })}
          onDismiss={() => {
            dismissScrumBridge(projectId);
            setBridgeDismissed(true);
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
