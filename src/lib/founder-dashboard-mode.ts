import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export type FounderDashboardMode = "day-one" | "steady-state";

export type ResolveFounderDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  pendingDecisionsCount?: number;
  bridgeDismissed: boolean;
};

export type FounderWelcomeBridgeChip = {
  label: string;
  count: number;
};

export function founderBridgeDismissStorageKey(projectId: string): string {
  return `dx-founder-bridge:${projectId}`;
}

export function isFounderBridgeDismissed(projectId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(founderBridgeDismissStorageKey(projectId)) === "dismissed";
}

export function dismissFounderBridge(projectId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(founderBridgeDismissStorageKey(projectId), "dismissed");
}

/** P-Founder-0: day-one when post-GO bootstrap exists, founder follow-up remains, bridge not dismissed. */
export function resolveFounderDashboardMode(
  input: ResolveFounderDashboardModeInput,
): FounderDashboardMode {
  const {
    projectId,
    hasBootstrapSummary,
    pendingReviewCount,
    pendingDecisionsCount = 0,
    bridgeDismissed,
  } = input;

  if (!projectId || !hasBootstrapSummary || bridgeDismissed) {
    return "steady-state";
  }

  const hasFollowUpWork = pendingReviewCount > 0 || pendingDecisionsCount > 0;
  return hasFollowUpWork ? "day-one" : "steady-state";
}

/** KPI chips for the founder welcome bridge — bootstrap counts with founder-friendly labels. */
export function buildFounderWelcomeBridgeChips(
  summary: ProjectBootstrapSummary,
  options?: { pendingDecisionsCount?: number; pendingReviewCount?: number },
): FounderWelcomeBridgeChip[] {
  const structure = summary.structure;
  const readyPersonas = Object.values(summary.personas).filter((persona) => persona.ok).length;
  const pendingReviews =
    options?.pendingReviewCount ??
    (typeof summary.pendingArtifactReviews === "number" ? summary.pendingArtifactReviews : 0);

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
      label: "decisions waiting",
      count: options?.pendingDecisionsCount ?? 0,
    },
    {
      label: "outputs to review",
      count: pendingReviews,
    },
  ];
}

export const FOUNDER_DAY_ONE_SUBTITLE =
  "Welcome — your executive dashboard is ready. Review what DeliverX built and confirm the decisions below.";
