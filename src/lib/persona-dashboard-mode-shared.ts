export type PersonaDashboardMode = "day-one" | "steady-state";

export type ResolvePersonaDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  hasFollowUpWork: boolean;
  bridgeDismissed: boolean;
};

export type WelcomeBridgeChip = {
  label: string;
  count: number;
};

/** Shared day-one resolution — bootstrap exists, follow-up remains, bridge not dismissed. */
export function resolvePersonaDashboardMode(
  input: ResolvePersonaDashboardModeInput,
): PersonaDashboardMode {
  const { projectId, hasBootstrapSummary, hasFollowUpWork, bridgeDismissed } = input;

  if (!projectId || !hasBootstrapSummary || bridgeDismissed) {
    return "steady-state";
  }

  return hasFollowUpWork ? "day-one" : "steady-state";
}

export function personaBridgeDismissStorageKey(prefix: string, projectId: string): string {
  return `dx-${prefix}-bridge:${projectId}`;
}

export function isPersonaBridgeDismissed(prefix: string, projectId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(personaBridgeDismissStorageKey(prefix, projectId)) === "dismissed";
}

export function dismissPersonaBridge(prefix: string, projectId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(personaBridgeDismissStorageKey(prefix, projectId), "dismissed");
}
