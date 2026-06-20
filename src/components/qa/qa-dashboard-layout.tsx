"use client";

import type { ReactNode } from "react";

/** Release gauge + defect board QA layout. */
export function QaDashboardLayout({
  aiSynthesis,
  kpiStrip,
  readinessRow,
  defectBoard,
  footer,
}: {
  aiSynthesis: ReactNode;
  kpiStrip: ReactNode;
  readinessRow: ReactNode;
  defectBoard: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-4" data-layout="qa-release-readiness">
      {aiSynthesis}
      {kpiStrip}
      {readinessRow}
      {defectBoard}
      {footer}
    </div>
  );
}
