"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PmDashboardMode } from "@/lib/pm-dashboard-mode";

const PmDashboardModeContext = createContext<PmDashboardMode>("steady-state");

export function usePmDashboardMode(): PmDashboardMode {
  return useContext(PmDashboardModeContext);
}

export function PmMissionPanelSwitch({
  dayOne,
  steadyState,
}: {
  dayOne: ReactNode;
  steadyState: ReactNode;
}) {
  const mode = usePmDashboardMode();
  return mode === "day-one" ? dayOne : steadyState;
}

export { PmDashboardModeContext };
