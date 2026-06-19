import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export type PmDashboardMode = "day-one" | "steady-state";

export type ResolvePmDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  teamInvitesPending?: number;
  bridgeDismissed: boolean;
};

export type PmWelcomeBridgeChip = {
  label: string;
  count: number;
};

export function pmBridgeDismissStorageKey(projectId: string): string {
  return `dx-pm-bridge:${projectId}`;
}

export function isPmBridgeDismissed(projectId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(pmBridgeDismissStorageKey(projectId)) === "dismissed";
}

export function dismissPmBridge(projectId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(pmBridgeDismissStorageKey(projectId), "dismissed");
}

/** P-PM-0: day-one when post-GO bootstrap exists, follow-up work remains, and bridge not dismissed. */
export function resolvePmDashboardMode(input: ResolvePmDashboardModeInput): PmDashboardMode {
  const {
    projectId,
    hasBootstrapSummary,
    pendingReviewCount,
    teamInvitesPending = 0,
    bridgeDismissed,
  } = input;

  if (!projectId || !hasBootstrapSummary || bridgeDismissed) {
    return "steady-state";
  }

  const hasFollowUpWork = pendingReviewCount > 0 || teamInvitesPending > 0;
  return hasFollowUpWork ? "day-one" : "steady-state";
}

/** Four KPI chips for the PM welcome bridge — bootstrap counts with sensible fallbacks. */
export function buildPmWelcomeBridgeChips(
  summary: ProjectBootstrapSummary,
  options?: { teamJoinedCount?: number },
): PmWelcomeBridgeChip[] {
  const structure = summary.structure;
  const readyPersonas = Object.values(summary.personas).filter((persona) => persona.ok).length;
  const criticalRisks = summary.personas.pm?.counts?.criticalRisks;

  return [
    {
      label: "workstreams",
      count: structure?.workstreams ?? (readyPersonas > 0 ? readyPersonas : 1),
    },
    {
      label: "milestones",
      count: structure?.milestones ?? 2,
    },
    {
      label: "RAID items",
      count: structure?.raidItems ?? criticalRisks ?? 0,
    },
    {
      label: "team joined",
      count: options?.teamJoinedCount ?? structure?.stakeholders ?? readyPersonas,
    },
  ];
}

export const PM_DAY_ONE_SUBTITLE =
  "Welcome — built from your business case. Review AI outputs below and invite teammates when you are ready.";
