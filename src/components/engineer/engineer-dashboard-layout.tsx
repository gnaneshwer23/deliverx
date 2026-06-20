"use client";

import type { ReactNode } from "react";

/** Assigned work + PRs + dependencies engineer layout. */
export function EngineerDashboardLayout({
  aiSynthesis,
  kpiStrip,
  workRow,
  dependenciesPanel,
  footer,
}: {
  aiSynthesis: ReactNode;
  kpiStrip: ReactNode;
  workRow: ReactNode;
  dependenciesPanel: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-4" data-layout="engineer-shipping">
      {aiSynthesis}
      {kpiStrip}
      {workRow}
      {dependenciesPanel}
      {footer}
    </div>
  );
}
