"use client";

import type { ReactNode } from "react";
import { DashboardCustomizeProvider } from "@/components/dx/dashboard-customize-context";
import { DashboardHeaderActions } from "@/components/dx/dashboard-customize-toggle";
import {
  DefaultMissionAction,
  MissionPersonaHeader,
  type MissionPersonaHeaderProps,
} from "@/components/dx/mission-persona-header";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import type { MissionPersonaId } from "@/lib/mission-nav";

export function MissionDashboardChrome({
  personaId,
  header,
  children,
}: {
  personaId: MissionPersonaId;
  header: Omit<MissionPersonaHeaderProps, "personaId" | "action">;
  children: ReactNode;
}) {
  const meta = getMissionPersonaMeta(personaId);

  return (
    <DashboardCustomizeProvider personaId={personaId}>
      <MissionPersonaHeader
        personaId={personaId}
        {...header}
        action={
          <DashboardHeaderActions>
            <DefaultMissionAction meta={meta} primaryProject={header.primaryProject} />
          </DashboardHeaderActions>
        }
      />
      {children}
    </DashboardCustomizeProvider>
  );
}
