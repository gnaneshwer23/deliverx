"use client";

import type { ReactNode } from "react";

/** Burndown + impediments + ceremonies scrum layout. */
export function ScrumDashboardLayout({
  aiSynthesis,
  kpiStrip,
  burndownPanel,
  impedimentCeremonyRow,
  footer,
}: {
  aiSynthesis: ReactNode;
  kpiStrip: ReactNode;
  burndownPanel: ReactNode;
  impedimentCeremonyRow: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="space-y-4" data-layout="scrum-team-health">
      {aiSynthesis}
      {kpiStrip}
      {burndownPanel}
      {impedimentCeremonyRow}
      {footer}
    </div>
  );
}
