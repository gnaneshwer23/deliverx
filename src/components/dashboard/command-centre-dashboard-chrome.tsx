"use client";

import type { ReactNode } from "react";
import { DashboardCustomizeProvider } from "@/components/dx/dashboard-customize-context";
import { DashboardHeaderActions } from "@/components/dx/dashboard-customize-toggle";
import {
  CommandCentrePersonaHeader,
  type CommandCentreHeaderProps,
} from "@/components/dx/mission-persona-header";

export function CommandCentreDashboardChrome({
  header,
  children,
}: {
  header: Omit<CommandCentreHeaderProps, "variant" | "action"> & { action?: ReactNode };
  children: ReactNode;
}) {
  const { action, ...headerProps } = header;

  return (
    <DashboardCustomizeProvider personaId="command-centre">
      <CommandCentrePersonaHeader
        {...headerProps}
        action={<DashboardHeaderActions>{action}</DashboardHeaderActions>}
      />
      {children}
    </DashboardCustomizeProvider>
  );
}
