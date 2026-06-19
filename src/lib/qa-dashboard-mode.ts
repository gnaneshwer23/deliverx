import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  dismissPersonaBridge,
  isPersonaBridgeDismissed,
  personaBridgeDismissStorageKey,
  resolvePersonaDashboardMode,
  type PersonaDashboardMode,
  type WelcomeBridgeChip,
} from "@/lib/persona-dashboard-mode-shared";

export type QaDashboardMode = PersonaDashboardMode;

const BRIDGE_PREFIX = "qa";

export type ResolveQaDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  criticalDefects?: number;
  bridgeDismissed: boolean;
};

export function qaBridgeDismissStorageKey(projectId: string): string {
  return personaBridgeDismissStorageKey(BRIDGE_PREFIX, projectId);
}

export function isQaBridgeDismissed(projectId: string): boolean {
  return isPersonaBridgeDismissed(BRIDGE_PREFIX, projectId);
}

export function dismissQaBridge(projectId: string): void {
  dismissPersonaBridge(BRIDGE_PREFIX, projectId);
}

export function resolveQaDashboardMode(input: ResolveQaDashboardModeInput): QaDashboardMode {
  const {
    projectId,
    hasBootstrapSummary,
    pendingReviewCount,
    criticalDefects = 0,
    bridgeDismissed,
  } = input;

  const hasFollowUpWork = pendingReviewCount > 0 || criticalDefects > 0;

  return resolvePersonaDashboardMode({
    projectId,
    hasBootstrapSummary,
    hasFollowUpWork,
    bridgeDismissed,
  });
}

export function buildQaWelcomeBridgeChips(
  summary: ProjectBootstrapSummary,
  options?: { criticalDefects?: number; pendingReviewCount?: number },
): WelcomeBridgeChip[] {
  const structure = summary.structure;
  const qaPersona = summary.personas.qa;
  const guidedTasks = qaPersona?.counts?.guidedTasks;
  const readyPersonas = Object.values(summary.personas).filter((p) => p.ok).length;

  return [
    {
      label: "test cases",
      count: guidedTasks ?? structure?.tasks ?? 0,
    },
    {
      label: "critical defects",
      count: options?.criticalDefects ?? 0,
    },
    {
      label: "milestones",
      count: structure?.milestones ?? (readyPersonas > 0 ? readyPersonas : 2),
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

export const QA_DAY_ONE_SUBTITLE =
  "Welcome — your test plan and defect inbox are ready. Review AI-built coverage and confirm release readiness below.";

export const QA_BRIDGE_HEADLINE = "Quality plan ready for review";
export const QA_BRIDGE_BODY =
  "Your GO bootstrap seeded test cases, defect tracking, and UAT scenarios for this release. Start in the defects inbox and review AI-generated test coverage before sign-off.";
