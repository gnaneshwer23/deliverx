"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PersonaWelcomeBridge } from "@/components/dx/persona-welcome-bridge";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  ENGINEER_BRIDGE_BODY,
  ENGINEER_BRIDGE_HEADLINE,
  buildEngineerWelcomeBridgeChips,
  dismissEngineerBridge,
  isEngineerBridgeDismissed,
  resolveEngineerDashboardMode,
  type EngineerDashboardMode,
} from "@/lib/engineer-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function EngineerMissionShell({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  blockedStories,
  summary,
  children,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  blockedStories: number;
  summary: ProjectBootstrapSummary | null;
  children: ReactNode;
}) {
  const accent = getMissionPersonaAccent("engineer");
  const [bridgeDismissed, setBridgeDismissed] = useState(() =>
    projectId ? isEngineerBridgeDismissed(projectId) : false,
  );

  const mode: EngineerDashboardMode = useMemo(
    () =>
      resolveEngineerDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        blockedStories,
        bridgeDismissed,
      }),
    [projectId, hasBootstrapSummary, pendingReviewCount, blockedStories, bridgeDismissed],
  );

  const showBridge = mode === "day-one" && projectId && summary;

  return (
    <div data-engineer-mode={mode}>
      {showBridge ? (
        <PersonaWelcomeBridge
          testId="engineer-welcome-bridge"
          ariaLabel="Welcome to your engineer mission dashboard"
          accent={accent}
          headline={ENGINEER_BRIDGE_HEADLINE}
          body={ENGINEER_BRIDGE_BODY}
          chips={buildEngineerWelcomeBridgeChips(summary, {
            blockedStories,
            pendingReviewCount,
          })}
          onDismiss={() => {
            dismissEngineerBridge(projectId);
            setBridgeDismissed(true);
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
