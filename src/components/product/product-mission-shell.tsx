"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PersonaWelcomeBridge } from "@/components/dx/persona-welcome-bridge";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  PRODUCT_BRIDGE_BODY,
  PRODUCT_BRIDGE_HEADLINE,
  buildProductWelcomeBridgeChips,
  dismissProductBridge,
  isProductBridgeDismissed,
  resolveProductDashboardMode,
  type ProductDashboardMode,
} from "@/lib/product-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function ProductMissionShell({
  projectId,
  hasBootstrapSummary,
  pendingReviewCount,
  roadmapItemCount,
  summary,
  children,
}: {
  projectId?: string;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  roadmapItemCount: number;
  summary: ProjectBootstrapSummary | null;
  children: ReactNode;
}) {
  const accent = getMissionPersonaAccent("product");
  const [bridgeDismissed, setBridgeDismissed] = useState(() =>
    projectId ? isProductBridgeDismissed(projectId) : false,
  );

  const mode: ProductDashboardMode = useMemo(
    () =>
      resolveProductDashboardMode({
        projectId,
        hasBootstrapSummary,
        pendingReviewCount,
        roadmapItemCount,
        bridgeDismissed,
      }),
    [projectId, hasBootstrapSummary, pendingReviewCount, roadmapItemCount, bridgeDismissed],
  );

  const showBridge = mode === "day-one" && projectId && summary;

  return (
    <div data-product-mode={mode}>
      {showBridge ? (
        <PersonaWelcomeBridge
          testId="product-welcome-bridge"
          ariaLabel="Welcome to your product mission dashboard"
          accent={accent}
          headline={PRODUCT_BRIDGE_HEADLINE}
          body={PRODUCT_BRIDGE_BODY}
          chips={buildProductWelcomeBridgeChips(summary, {
            pendingReviewCount,
            roadmapItemCount,
          })}
          onDismiss={() => {
            dismissProductBridge(projectId);
            setBridgeDismissed(true);
          }}
        />
      ) : null}
      {children}
    </div>
  );
}
