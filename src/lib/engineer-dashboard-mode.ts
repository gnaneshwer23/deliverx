import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  dismissPersonaBridge,
  isPersonaBridgeDismissed,
  personaBridgeDismissStorageKey,
  resolvePersonaDashboardMode,
  type PersonaDashboardMode,
  type WelcomeBridgeChip,
} from "@/lib/persona-dashboard-mode-shared";

export type EngineerDashboardMode = PersonaDashboardMode;

const BRIDGE_PREFIX = "engineer";

export type ResolveEngineerDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  blockedStories?: number;
  bridgeDismissed: boolean;
};

export function engineerBridgeDismissStorageKey(projectId: string): string {
  return personaBridgeDismissStorageKey(BRIDGE_PREFIX, projectId);
}

export function isEngineerBridgeDismissed(projectId: string): boolean {
  return isPersonaBridgeDismissed(BRIDGE_PREFIX, projectId);
}

export function dismissEngineerBridge(projectId: string): void {
  dismissPersonaBridge(BRIDGE_PREFIX, projectId);
}

export function resolveEngineerDashboardMode(
  input: ResolveEngineerDashboardModeInput,
): EngineerDashboardMode {
  const {
    projectId,
    hasBootstrapSummary,
    pendingReviewCount,
    blockedStories = 0,
    bridgeDismissed,
  } = input;

  const hasFollowUpWork = pendingReviewCount > 0 || blockedStories > 0;

  return resolvePersonaDashboardMode({
    projectId,
    hasBootstrapSummary,
    hasFollowUpWork,
    bridgeDismissed,
  });
}

export function buildEngineerWelcomeBridgeChips(
  summary: ProjectBootstrapSummary,
  options?: { blockedStories?: number; pendingReviewCount?: number },
): WelcomeBridgeChip[] {
  const structure = summary.structure;
  const engineerPersona = summary.personas.engineer;
  const guidedTasks = engineerPersona?.counts?.guidedTasks;
  const readyPersonas = Object.values(summary.personas).filter((p) => p.ok).length;

  return [
    {
      label: "tasks assigned",
      count: guidedTasks ?? structure?.tasks ?? 0,
    },
    {
      label: "milestones",
      count: structure?.milestones ?? 2,
    },
    {
      label: "blocked stories",
      count: options?.blockedStories ?? 0,
    },
    {
      label: "outputs to review",
      count:
        options?.pendingReviewCount ??
        (typeof summary.pendingArtifactReviews === "number"
          ? summary.pendingArtifactReviews
          : 0),
    },
  ];
}

export const ENGINEER_DAY_ONE_SUBTITLE =
  "Welcome — architecture and engineering tasks are ready. Review what AI assigned and open your repo context below.";

export const ENGINEER_BRIDGE_HEADLINE = "Engineering workspace seeded";
export const ENGINEER_BRIDGE_BODY =
  "After GO, DeliverX mapped architecture, dependencies, and guided tasks to your codebase context. Review AI outputs and confirm the technical plan before you start building.";
