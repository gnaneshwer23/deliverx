"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FounderDashboardMode } from "@/lib/founder-dashboard-mode";

const FounderDashboardModeContext = createContext<FounderDashboardMode>("steady-state");

export function useFounderDashboardMode(): FounderDashboardMode {
  return useContext(FounderDashboardModeContext);
}

/** Swaps day-one vs steady-state panel layouts via founder dashboard mode context. */
export function FounderMissionPanelSwitch({
  dayOne,
  steadyState,
}: {
  dayOne: ReactNode;
  steadyState: ReactNode;
}) {
  const mode = useFounderDashboardMode();
  return mode === "day-one" ? dayOne : steadyState;
}

export { FounderDashboardModeContext };
