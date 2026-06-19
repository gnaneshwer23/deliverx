"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PersonaWelcomeBridge } from "@/components/dx/persona-welcome-bridge";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  QA_BRIDGE_BODY,
  QA_BRIDGE_HEADLINE,
  buildQaWelcomeBridgeChips,
  dismissQaBridge,
  isQaBridgeDismissed,
  resolveQaDashboardMode,
  type QaDashboardMode,
} from "@/lib/qa-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function QaMissionShell({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  criticalDefects,
  summary,
  children,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  criticalDefects: number;
  summary: ProjectBootstrapSummary | null;
  children: ReactNode;
}) {
  const accent = getMissionPersonaAccent("qa");
  const [bridgeDismissed, setBridgeDismissed] = useState(() =>
    projectId ? isQaBridgeDismissed(projectId) : false,
  );

  const mode: QaDashboardMode = useMemo(
    () =>
      resolveQaDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        criticalDefects,
        bridgeDismissed,
      }),
    [projectId, hasBootstrapSummary, pendingReviewCount, criticalDefects, bridgeDismissed],
  );

  const showBridge = mode === "day-one" && projectId && summary;

  return (
    <div data-qa-mode={mode}>
      {showBridge ? (
        <PersonaWelcomeBridge
          testId="qa-welcome-bridge"
          ariaLabel="Welcome to your QA mission dashboard"
          accent={accent}
          headline={QA_BRIDGE_HEADLINE}
          body={QA_BRIDGE_BODY}
          chips={buildQaWelcomeBridgeChips(summary, {
            criticalDefects,
            pendingReviewCount,
          })}
          onDismiss={() => {
            dismissQaBridge(projectId);
            setBridgeDismissed(true);
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
