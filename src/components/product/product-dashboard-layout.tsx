"use client";

import type { ReactNode } from "react";

/** Now/Next/Later roadmap-led product layout. */
export function ProductDashboardLayout({
  aiSynthesis,
  kpiStrip,
  roadmapKanban,
  riceBacklog,
  footer,
}: {
  aiSynthesis: ReactNode;
  kpiStrip: ReactNode;
  roadmapKanban: ReactNode;
  riceBacklog: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-4" data-layout="product-roadmap">
      {aiSynthesis}
      {kpiStrip}
      {roadmapKanban}
      {riceBacklog}
      {footer}
    </div>
  );
}
