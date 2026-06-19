"use client";

import { PersonaWelcomeBridge } from "@/components/dx/persona-welcome-bridge";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  buildPmWelcomeBridgeChips,
  dismissPmBridge,
} from "@/lib/pm-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function PmWelcomeBridge({
  projectId,
  summary,
  teamJoinedCount,
  onDismiss,
}: {
  projectId: string;
  summary: ProjectBootstrapSummary;
  teamJoinedCount?: number;
  onDismiss: () => void;
}) {
  const accent = getMissionPersonaAccent("pm-mission");
  const chips = buildPmWelcomeBridgeChips(summary, { teamJoinedCount });

  return (
    <PersonaWelcomeBridge
      testId="pm-welcome-bridge"
      ariaLabel="Welcome to your PM mission dashboard"
      accent={accent}
      headline="Built from your business case"
      body="Your GO bootstrap seeded this mission dashboard — workstreams, milestones, RAID, and guided tasks are ready for review. Connect onboarding to delivery by checking AI outputs below."
      chips={chips}
      onDismiss={() => {
        dismissPmBridge(projectId);
        onDismiss();
      }}
    />
  );
}
