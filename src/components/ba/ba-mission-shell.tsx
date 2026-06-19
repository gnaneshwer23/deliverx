"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PersonaWelcomeBridge } from "@/components/dx/persona-welcome-bridge";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  BA_BRIDGE_BODY,
  BA_BRIDGE_HEADLINE,
  buildBaWelcomeBridgeChips,
  dismissBaBridge,
  isBaBridgeDismissed,
  resolveBaDashboardMode,
  type BaDashboardMode,
} from "@/lib/ba-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function BaMissionShell({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  pendingClarifications,
  summary,
  children,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  pendingClarifications: number;
  summary: ProjectBootstrapSummary | null;
  children: ReactNode;
}) {
  const accent = getMissionPersonaAccent("ba");
  const [bridgeDismissed, setBridgeDismissed] = useState(() =>
    projectId ? isBaBridgeDismissed(projectId) : false,
  );

  const mode: BaDashboardMode = useMemo(
    () =>
      resolveBaDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        pendingClarifications,
        bridgeDismissed,
      }),
    [projectId, hasBootstrapSummary, pendingReviewCount, pendingClarifications, bridgeDismissed],
  );

  const showBridge = mode === "day-one" && projectId && summary;

  return (
    <div data-ba-mode={mode}>
      {showBridge ? (
        <PersonaWelcomeBridge
          testId="ba-welcome-bridge"
          ariaLabel="Welcome to your BA mission dashboard"
          accent={accent}
          headline={BA_BRIDGE_HEADLINE}
          body={BA_BRIDGE_BODY}
          chips={buildBaWelcomeBridgeChips(summary, {
            pendingClarifications,
            pendingReviewCount,
          })}
          onDismiss={() => {
            dismissBaBridge(projectId);
            setBridgeDismissed(true);
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
