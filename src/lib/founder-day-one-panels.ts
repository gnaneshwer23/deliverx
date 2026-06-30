import type { ArtifactEntityType } from "@/lib/approval/constants";
import { extractReviewConfidence } from "@/lib/pm-day-one-panels";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { FounderMissionControl } from "@/services/founderDashboard";
import type { FounderPortfolioRow } from "@/services/founderEngine";

/** Panel shell ids prioritized in founder day-one layout (P-Founder-1). */
export const FOUNDER_DAY_ONE_PANEL_IDS = [
  "decisions",
  "intelligence-feed",
  "funding",
  "objectives",
  "founder-context",
] as const;

export type FounderDayOnePanelId = (typeof FOUNDER_DAY_ONE_PANEL_IDS)[number];

export function isFounderDayOnePanel(panelId: string): panelId is FounderDayOnePanelId {
  return (FOUNDER_DAY_ONE_PANEL_IDS as readonly string[]).includes(panelId);
}

export type FounderReviewCategoryId =
  | "strategic-decisions"
  | "investment-reports"
  | "market-insights"
  | "org-portfolio";

export type FounderReviewCategoryGroup = {
  id: FounderReviewCategoryId;
  label: string;
  reviews: ArtifactReviewRow[];
  meta: string;
  confidencePct: number | null;
};

export type FounderDayOneKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "healthy" | "watch" | "at-risk";
};

export type FounderPortfolioSnapshotCounts = {
  onTrack: number;
  atRisk: number;
  offTrack: number;
  total: number;
};

export type FounderPortfolioTopItem = {
  name: string;
  ragStatus: FounderPortfolioRow["ragStatus"];
  deliveryPct: number;
};

const REVIEW_CATEGORY_LABELS: Record<FounderReviewCategoryId, string> = {
  "strategic-decisions": "Strategic decisions",
  "investment-reports": "Investment & reports",
  "market-insights": "Customer & market",
  "org-portfolio": "Org & portfolio structure",
};

const CATEGORY_ENTITY_TYPES: Record<FounderReviewCategoryId, ArtifactEntityType[]> = {
  "strategic-decisions": ["decision", "change_request"],
  "investment-reports": ["report"],
  "market-insights": ["customer_insight"],
  "org-portfolio": ["structure_bundle"],
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

/** Infer founder review category from entity type and title hints. */
export function inferFounderReviewCategory(
  review: Pick<ArtifactReviewRow, "entity_type" | "title" | "summary">,
): FounderReviewCategoryId {
  const title = normalizeText(review.title);
  const summary = normalizeText(String(review.summary ?? ""));

  if (
    title.includes("customer") ||
    title.includes("market") ||
    title.includes("insight") ||
    review.entity_type === "customer_insight"
  ) {
    return "market-insights";
  }

  if (
    title.includes("investment") ||
    title.includes("business case") ||
    title.includes("report") ||
    review.entity_type === "report"
  ) {
    return "investment-reports";
  }

  if (
    title.includes("portfolio") ||
    title.includes("structure") ||
    title.includes("objective") ||
    review.entity_type === "structure_bundle"
  ) {
    return "org-portfolio";
  }

  for (const [categoryId, types] of Object.entries(CATEGORY_ENTITY_TYPES) as Array<
    [FounderReviewCategoryId, ArtifactEntityType[]]
  >) {
    if (types.includes(review.entity_type)) {
      return categoryId;
    }
  }

  if (title.includes("decision") || summary.includes("decision")) {
    return "strategic-decisions";
  }

  return "strategic-decisions";
}

function buildCategoryMeta(reviews: ArtifactReviewRow[]): string {
  const itemCount = reviews.reduce(
    (total, review) => total + Math.max(review.entity_ids.length, review.entity_id ? 1 : 1),
    0,
  );
  const reviewWord = reviews.length === 1 ? "proposal" : "proposals";
  const itemWord = itemCount === 1 ? "item" : "items";
  return `${reviews.length} ${reviewWord} · ${itemCount} ${itemWord}`;
}

function averageConfidence(reviews: ArtifactReviewRow[]): number | null {
  const values = reviews
    .map((review) => extractReviewConfidence(review))
    .filter((value): value is number => value != null);
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/** Group pending founder artifact reviews into day-one categories (stable order). */
export function groupPendingFounderReviewsByCategory(
  reviews: ArtifactReviewRow[],
): FounderReviewCategoryGroup[] {
  const buckets = new Map<FounderReviewCategoryId, ArtifactReviewRow[]>();

  for (const review of reviews) {
    const categoryId = inferFounderReviewCategory(review);
    const existing = buckets.get(categoryId) ?? [];
    existing.push(review);
    buckets.set(categoryId, existing);
  }

  const order: FounderReviewCategoryId[] = [
    "strategic-decisions",
    "investment-reports",
    "market-insights",
    "org-portfolio",
  ];

  return order
    .map((id) => {
      const categoryReviews = buckets.get(id);
      if (!categoryReviews?.length) return null;
      return {
        id,
        label: REVIEW_CATEGORY_LABELS[id],
        reviews: categoryReviews,
        meta: buildCategoryMeta(categoryReviews),
        confidencePct: averageConfidence(categoryReviews),
      };
    })
    .filter((group): group is FounderReviewCategoryGroup => group != null);
}

export function buildFounderPortfolioSnapshotCounts(
  portfolio: FounderPortfolioRow[],
): FounderPortfolioSnapshotCounts {
  let onTrack = 0;
  let atRisk = 0;
  let offTrack = 0;

  for (const project of portfolio) {
    if (project.ragStatus === "green") onTrack += 1;
    else if (project.ragStatus === "amber") atRisk += 1;
    else offTrack += 1;
  }

  return { onTrack, atRisk, offTrack, total: portfolio.length };
}

export function buildFounderPortfolioTopItems(
  portfolio: FounderPortfolioRow[],
  limit = 3,
): FounderPortfolioTopItem[] {
  const priority = { red: 0, amber: 1, green: 2 };
  return [...portfolio]
    .sort((a, b) => priority[a.ragStatus] - priority[b.ragStatus])
    .slice(0, limit)
    .map((project) => ({
      name: project.name,
      ragStatus: project.ragStatus,
      deliveryPct: project.deliveryPct,
    }));
}

export type BuildFounderDayOneKpisInput = {
  pendingReviewCount: number;
  pendingDecisionsCount: number;
  companyHealth: FounderMissionControl["companyHealth"];
  kpis: FounderMissionControl["kpis"];
  funding: FounderMissionControl["funding"];
  portfolio: FounderPortfolioRow[];
  dataSources: FounderMissionControl["dataSources"];
};

export function buildFounderDayOneKpis(input: BuildFounderDayOneKpisInput): FounderDayOneKpi[] {
  const sym = input.funding.currency === "GBP" ? "£" : "$";
  const financialIsLive = input.dataSources.financials === "live";
  const portfolioCounts = buildFounderPortfolioSnapshotCounts(input.portfolio);

  const healthTone =
    input.companyHealth.tier === "green"
      ? "healthy"
      : input.companyHealth.tier === "amber"
        ? "watch"
        : "at-risk";

  const runwayTone =
    input.kpis.runwayMonths >= 12
      ? "healthy"
      : input.kpis.runwayMonths >= 6
        ? "watch"
        : "at-risk";

  const portfolioValue =
    portfolioCounts.total > 0
      ? `${portfolioCounts.onTrack}/${portfolioCounts.total} on track`
      : "—";

  return [
    {
      label: "Company health",
      value: input.companyHealth.label,
      hint: financialIsLive ? "Portfolio + runway composite" : "Add financials for live signal",
      tone: healthTone,
    },
    {
      label: "Decisions waiting",
      value: String(input.pendingDecisionsCount),
      hint:
        input.pendingDecisionsCount === 1
          ? "Executive sign-off needed"
          : input.pendingDecisionsCount > 0
            ? "Executive sign-offs needed"
            : "Governance clear",
      tone: input.pendingDecisionsCount > 0 ? "watch" : "healthy",
    },
    {
      label: "Awaiting review",
      value: String(input.pendingReviewCount),
      hint: input.pendingReviewCount === 1 ? "AI output" : "AI outputs",
      tone: input.pendingReviewCount > 0 ? "watch" : "healthy",
    },
    {
      label: "Runway",
      value: `${input.kpis.runwayMonths} mo`,
      hint: financialIsLive
        ? `${sym}${Math.round(input.kpis.monthlyBurn / 1000)}k/mo burn`
        : "Set cash & burn in founder context",
      tone: runwayTone,
    },
    {
      label: "Portfolio",
      value: portfolioValue,
      hint:
        portfolioCounts.atRisk + portfolioCounts.offTrack > 0
          ? `${portfolioCounts.atRisk + portfolioCounts.offTrack} need attention`
          : portfolioCounts.total
            ? "All projects green"
            : "Projects appear after GO",
      tone:
        portfolioCounts.offTrack > 0
          ? "at-risk"
          : portfolioCounts.atRisk > 0
            ? "watch"
            : portfolioCounts.total > 0
              ? "healthy"
              : "default",
    },
  ];
}

export function buildFounderProposalsHref(projectId?: string, reviewId?: string): string {
  const params = new URLSearchParams({ persona: "founder" });
  if (projectId) params.set("project", projectId);
  if (reviewId) params.set("review", reviewId);
  return `/workspace/proposals?${params.toString()}`;
}
