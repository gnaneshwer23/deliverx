import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  dismissPersonaBridge,
  isPersonaBridgeDismissed,
  personaBridgeDismissStorageKey,
  resolvePersonaDashboardMode,
  type PersonaDashboardMode,
  type WelcomeBridgeChip,
} from "@/lib/persona-dashboard-mode-shared";

export type BaDashboardMode = PersonaDashboardMode;

const BRIDGE_PREFIX = "ba";

export type ResolveBaDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  pendingClarifications?: number;
  bridgeDismissed: boolean;
};

export function baBridgeDismissStorageKey(projectId: string): string {
  return personaBridgeDismissStorageKey(BRIDGE_PREFIX, projectId);
}

export function isBaBridgeDismissed(projectId: string): boolean {
  return isPersonaBridgeDismissed(BRIDGE_PREFIX, projectId);
}

export function dismissBaBridge(projectId: string): void {
  dismissPersonaBridge(BRIDGE_PREFIX, projectId);
}

export function resolveBaDashboardMode(input: ResolveBaDashboardModeInput): BaDashboardMode {
  const {
    projectId,
    hasBootstrapSummary,
    pendingReviewCount,
    pendingClarifications = 0,
    bridgeDismissed,
  } = input;

  const hasFollowUpWork = pendingReviewCount > 0 || pendingClarifications > 0;

  return resolvePersonaDashboardMode({
    projectId,
    hasBootstrapSummary,
    hasFollowUpWork,
    bridgeDismissed,
  });
}

export function buildBaWelcomeBridgeChips(
  summary: ProjectBootstrapSummary,
  options?: { pendingClarifications?: number; pendingReviewCount?: number },
): WelcomeBridgeChip[] {
  const structure = summary.structure;
  const baPersona = summary.personas.ba;
  const requirements = baPersona?.counts?.requirements;
  const clarifications =
    options?.pendingClarifications ?? baPersona?.counts?.clarifications ?? 0;
  const readyPersonas = Object.values(summary.personas).filter((p) => p.ok).length;

  return [
    {
      label: "requirements",
      count: requirements ?? structure?.tasks ?? 0,
    },
    {
      label: "clarifications",
      count: clarifications,
    },
    {
      label: "stories linked",
      count: structure?.tasks ?? (readyPersonas > 0 ? readyPersonas : 0),
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

export const BA_DAY_ONE_SUBTITLE =
  "Welcome — requirements and traceability are seeded from your business case. Review what AI built and confirm traceability below.";

export const BA_BRIDGE_HEADLINE = "Requirements ready for review";
export const BA_BRIDGE_BODY =
  "Your GO bootstrap seeded requirements, clarifications, and traceability links for this programme. Start by reviewing AI-built artifacts and mapping business needs to delivery.";
