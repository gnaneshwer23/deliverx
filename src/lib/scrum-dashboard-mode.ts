import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  dismissPersonaBridge,
  isPersonaBridgeDismissed,
  personaBridgeDismissStorageKey,
  resolvePersonaDashboardMode,
  type PersonaDashboardMode,
  type WelcomeBridgeChip,
} from "@/lib/persona-dashboard-mode-shared";

export type ScrumDashboardMode = PersonaDashboardMode;

const BRIDGE_PREFIX = "scrum";

export type ResolveScrumDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  impedimentCount?: number;
  blockedStories?: number;
  bridgeDismissed: boolean;
};

export function scrumBridgeDismissStorageKey(projectId: string): string {
  return personaBridgeDismissStorageKey(BRIDGE_PREFIX, projectId);
}

export function isScrumBridgeDismissed(projectId: string): boolean {
  return isPersonaBridgeDismissed(BRIDGE_PREFIX, projectId);
}

export function dismissScrumBridge(projectId: string): void {
  dismissPersonaBridge(BRIDGE_PREFIX, projectId);
}

export function resolveScrumDashboardMode(
  input: ResolveScrumDashboardModeInput,
): ScrumDashboardMode {
  const {
    projectId,
    hasBootstrapSummary,
    pendingReviewCount,
    impedimentCount = 0,
    blockedStories = 0,
    bridgeDismissed,
  } = input;

  const hasFollowUpWork =
    pendingReviewCount > 0 || impedimentCount > 0 || blockedStories > 0;

  return resolvePersonaDashboardMode({
    projectId,
    hasBootstrapSummary,
    hasFollowUpWork,
    bridgeDismissed,
  });
}

export function buildScrumWelcomeBridgeChips(
  summary: ProjectBootstrapSummary,
  options?: {
    pendingReviewCount?: number;
    impedimentCount?: number;
    blockedStories?: number;
  },
): WelcomeBridgeChip[] {
  const structure = summary.structure;
  const scrumPersona = summary.personas.scrum;
  const guidedTasks = scrumPersona?.counts?.guidedTasks;

  return [
    {
      label: "sprint tasks",
      count: guidedTasks ?? structure?.tasks ?? 0,
    },
    {
      label: "impediments",
      count: options?.impedimentCount ?? 0,
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

export const SCRUM_DAY_ONE_SUBTITLE =
  "Welcome — sprint health and impediments are ready. Review AI-built ceremonies and confirm team capacity below.";

export const SCRUM_BRIDGE_HEADLINE = "Sprint workspace ready for review";
export const SCRUM_BRIDGE_BODY =
  "Your GO bootstrap seeded sprint tasks, impediments, and ceremony cadence for this team. Start by reviewing standup blockers and confirming velocity assumptions before planning.";
