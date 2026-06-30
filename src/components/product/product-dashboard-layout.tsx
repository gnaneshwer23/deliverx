"use client";

import type { ReactNode } from "react";

/** Roadmap-led product layout — synthesis, KPIs, then one dominant focus area. */
export function ProductDashboardLayout({
  aiSynthesis,
  kpiStrip,
  primaryFocus,
}: {
  aiSynthesis: ReactNode;
  kpiStrip: ReactNode;
  primaryFocus: ReactNode;
}) {
  return (
    <div className="space-y-6" data-layout="product-roadmap">
      {aiSynthesis}
      {kpiStrip}
      {primaryFocus}
    </div>
  );
}
