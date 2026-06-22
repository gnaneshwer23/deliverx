import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  dismissPersonaBridge,
  isPersonaBridgeDismissed,
  personaBridgeDismissStorageKey,
  resolvePersonaDashboardMode,
  type PersonaDashboardMode,
  type WelcomeBridgeChip,
} from "@/lib/persona-dashboard-mode-shared";

export type ProductDashboardMode = PersonaDashboardMode;

const BRIDGE_PREFIX = "product";

export type ResolveProductDashboardModeInput = {
  projectId: string | null | undefined;
  hasBootstrapSummary: boolean;
  pendingReviewCount: number;
  roadmapItemCount?: number;
  bridgeDismissed: boolean;
};

export function productBridgeDismissStorageKey(projectId: string): string {
  return personaBridgeDismissStorageKey(BRIDGE_PREFIX, projectId);
}

export function isProductBridgeDismissed(projectId: string): boolean {
  return isPersonaBridgeDismissed(BRIDGE_PREFIX, projectId);
}

export function dismissProductBridge(projectId: string): void {
  dismissPersonaBridge(BRIDGE_PREFIX, projectId);
}

export function resolveProductDashboardMode(
  input: ResolveProductDashboardModeInput,
): ProductDashboardMode {
  const {
    projectId,
    hasBootstrapSummary,
    pendingReviewCount,
    roadmapItemCount = 0,
    bridgeDismissed,
  } = input;

  const hasFollowUpWork = pendingReviewCount > 0 || roadmapItemCount === 0;

  return resolvePersonaDashboardMode({
    projectId,
    hasBootstrapSummary,
    hasFollowUpWork,
    bridgeDismissed,
  });
}

export function buildProductWelcomeBridgeChips(
  summary: ProjectBootstrapSummary,
  options?: { pendingReviewCount?: number; roadmapItemCount?: number },
): WelcomeBridgeChip[] {
  const structure = summary.structure;
  const productPersona = summary.personas.product;
  const features = productPersona?.counts?.features;

  return [
    {
      label: "features",
      count: features ?? structure?.tasks ?? 0,
    },
    {
      label: "roadmap items",
      count: options?.roadmapItemCount ?? 0,
    },
    {
      label: "workstreams",
      count: structure?.workstreams ?? 0,
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

export const PRODUCT_DAY_ONE_SUBTITLE =
  "Welcome — your roadmap and RICE backlog are ready. Review AI-built features and confirm prioritisation below.";

export const PRODUCT_BRIDGE_HEADLINE = "Product roadmap ready for review";
export const PRODUCT_BRIDGE_BODY =
  "Your GO bootstrap seeded Now/Next/Later horizons and RICE-scored features from your business case. Start by reviewing AI-built roadmap items and customer insights before the next planning cycle.";
