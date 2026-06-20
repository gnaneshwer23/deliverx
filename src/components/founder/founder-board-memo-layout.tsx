"use client";

import type { ReactNode } from "react";

/** Sparse vertical board memo layout — narrative-led, not PM control room grid. */
export function FounderBoardMemoLayout({
  narrativeSummary,
  strategicKpis,
  decisionCentre,
  deliveryPatterns,
  footer,
}: {
  narrativeSummary: ReactNode;
  strategicKpis: ReactNode;
  decisionCentre: ReactNode;
  deliveryPatterns?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-6" data-layout="founder-board-memo">
      {narrativeSummary}
      {strategicKpis}
      {decisionCentre}
      {deliveryPatterns}
      {footer}
    </div>
  );
}
