"use client";

import type { ReactNode } from "react";
import { DashboardCustomizeProvider, useDashboardCustomize } from "@/components/dx/dashboard-customize-context";
import { DashboardHeaderActions } from "@/components/dx/dashboard-customize-toggle";
import {
  DefaultMissionAction,
  MissionPersonaHeader,
  type MissionPersonaHeaderProps,
} from "@/components/dx/mission-persona-header";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import type { MissionPersonaId } from "@/lib/mission-nav";

function ContentEditBanner() {
  const { contentEditMode } = useDashboardCustomize();
  if (!contentEditMode) return null;

  return (
    <div
      className="border-b border-[#C6DDD0] bg-[#EEF5F1] px-6 py-2.5 md:px-8"
      role="status"
    >
      <p className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.12em] text-[#1C4A2E]">
        Inline edit mode — text saves to this browser only
      </p>
    </div>
  );
}

export function MissionDashboardChrome({
  personaId,
  header,
  headerActions,
  children,
}: {
  personaId: MissionPersonaId;
  header: Omit<MissionPersonaHeaderProps, "personaId" | "action">;
  /** Replaces default mission workspace CTA when provided (e.g. PM generate report). */
  headerActions?: ReactNode;
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
            {headerActions ?? (
              <DefaultMissionAction meta={meta} primaryProject={header.primaryProject} />
            )}
          </DashboardHeaderActions>
        }
      />
      <ContentEditBanner />
      {children}
    </DashboardCustomizeProvider>
  );
}
