"use client";

import type { ReactNode } from "react";

/** Traceability-matrix-led BA layout — not PM control room or founder memo. */
export function BaDashboardLayout({
  aiSynthesis,
  kpiStrip,
  traceabilityMatrix,
  clarificationQueue,
  footer,
}: {
  aiSynthesis: ReactNode;
  kpiStrip: ReactNode;
  traceabilityMatrix: ReactNode;
  clarificationQueue: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-4" data-layout="ba-traceability-matrix">
      {aiSynthesis}
      {kpiStrip}
      {traceabilityMatrix}
      {clarificationQueue}
      {footer}
    </div>
  );
}
