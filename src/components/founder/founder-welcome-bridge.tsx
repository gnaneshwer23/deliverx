"use client";

import { PersonaWelcomeBridge } from "@/components/dx/persona-welcome-bridge";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";
import {
  buildFounderWelcomeBridgeChips,
  dismissFounderBridge,
} from "@/lib/founder-dashboard-mode";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export function FounderWelcomeBridge({
  projectId,
  summary,
  pendingDecisionsCount,
  pendingReviewCount,
  onDismiss,
}: {
  projectId: string;
  summary: ProjectBootstrapSummary;
  pendingDecisionsCount: number;
  pendingReviewCount: number;
  onDismiss: () => void;
}) {
  const accent = getMissionPersonaAccent("founder");
  const chips = buildFounderWelcomeBridgeChips(summary, {
    pendingDecisionsCount,
    pendingReviewCount,
  });

  return (
    <PersonaWelcomeBridge
      testId="founder-welcome-bridge"
      ariaLabel="Welcome to your founder mission dashboard"
      accent={accent}
      headline="Built from your business case"
      body="After your GO decision, DeliverX seeded this executive dashboard with portfolio health, funding signals, and strategic decisions. Start by reviewing AI outputs and confirming what matters most for the business."
      chips={chips}
      onDismiss={() => {
        dismissFounderBridge(projectId);
        onDismiss();
      }}
    />
  );
}
