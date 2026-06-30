import type { ArtifactEntityType } from "@/lib/approval/constants";
import {
  budgetSpendPct,
  milestoneProgressPct,
  pendingReviewBarPct,
  teamJoinPct,
} from "@/lib/pm-viz-helpers";
import { formatHonestKpi } from "@/lib/honest-kpi";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

export type PmReviewCategoryId =
  | "workstreams"
  | "milestones-timeline"
  | "raid-risks"
  | "go-recommendation";

export type PmReviewCategoryGroup = {
  id: PmReviewCategoryId;
  label: string;
  reviews: ArtifactReviewRow[];
  meta: string;
  confidencePct: number | null;
};

export type PmDayOneKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "healthy" | "watch" | "at-risk";
  progressPct?: number;
};

export type PmRaidSummaryCounts = {
  highRisk: number;
  assumptions: number;
  issues: number;
  dependencies: number;
};

export type PmRaidTopItem = {
  title: string;
  kind: "risk" | "issue" | "dependency";
  severity?: string;
};

const REVIEW_CATEGORY_LABELS: Record<PmReviewCategoryId, string> = {
  workstreams: "Workstreams",
  "milestones-timeline": "Milestones & timeline",
  "raid-risks": "RAID & risks",
  "go-recommendation": "GO recommendation",
};

const CATEGORY_ENTITY_TYPES: Record<PmReviewCategoryId, ArtifactEntityType[]> = {
  workstreams: ["structure_bundle", "task"],
  "milestones-timeline": ["report", "estimation"],
  "raid-risks": ["raid_item"],
  "go-recommendation": ["decision", "change_request"],
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

/** Infer review category from entity type and title/payload hints. */
export function inferPmReviewCategory(
  review: Pick<ArtifactReviewRow, "entity_type" | "title" | "payload" | "summary">,
): PmReviewCategoryId {
  const title = normalizeText(review.title);
  const summary = normalizeText(String(review.summary ?? ""));

  if (
    title.includes("go ") ||
    title.includes("go/no") ||
    title.includes("recommendation") ||
    review.entity_type === "decision" ||
    review.entity_type === "change_request"
  ) {
    return "go-recommendation";
  }

  if (
    title.includes("raid") ||
    title.includes("risk") ||
    review.entity_type === "raid_item"
  ) {
    return "raid-risks";
  }

  if (
    title.includes("milestone") ||
    title.includes("timeline") ||
    title.includes("phase") ||
    review.entity_type === "report" ||
    review.entity_type === "estimation"
  ) {
    return "milestones-timeline";
  }

  if (review.entity_type === "structure_bundle") {
    const draft = review.payload?.draft as Record<string, unknown> | undefined;
    if (Array.isArray(draft?.milestones) && (draft.milestones as unknown[]).length > 0) {
      return "milestones-timeline";
    }
    return "workstreams";
  }

  for (const [categoryId, types] of Object.entries(CATEGORY_ENTITY_TYPES) as Array<
    [PmReviewCategoryId, ArtifactEntityType[]]
  >) {
    if (types.includes(review.entity_type)) {
      return categoryId;
    }
  }

  if (title.includes("workstream") || summary.includes("workstream")) {
    return "workstreams";
  }

  return "workstreams";
}

/** Extract confidence % from proposal metadata when present. */
export function extractReviewConfidence(
  review: Pick<ArtifactReviewRow, "payload">,
): number | null {
  const payload = review.payload ?? {};
  const candidates = [
    payload.confidence,
    payload.confidencePct,
    payload.confidenceScore,
    (payload.draft as Record<string, unknown> | undefined)?.confidenceScore,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      const pct = candidate <= 1 ? Math.round(candidate * 100) : Math.round(candidate);
      if (pct >= 0 && pct <= 100) return pct;
    }
  }

  return null;
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

/** Group pending PM artifact reviews into day-one categories (stable order). */
export function groupPendingReviewsByCategory(
  reviews: ArtifactReviewRow[],
): PmReviewCategoryGroup[] {
  const buckets = new Map<PmReviewCategoryId, ArtifactReviewRow[]>();

  for (const review of reviews) {
    const categoryId = inferPmReviewCategory(review);
    const existing = buckets.get(categoryId) ?? [];
    existing.push(review);
    buckets.set(categoryId, existing);
  }

  const order: PmReviewCategoryId[] = [
    "workstreams",
    "milestones-timeline",
    "raid-risks",
    "go-recommendation",
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
    .filter((group): group is PmReviewCategoryGroup => group != null);
}

export function buildPmRaidSummaryCounts(raid: PmMissionControl["raid"]): PmRaidSummaryCounts {
  const highRisk = raid.risks.filter((risk) => {
    const severity = normalizeText(risk.severity);
    return severity === "high" || severity === "critical";
  }).length;

  const assumptions = raid.risks.filter((risk) => {
    const severity = normalizeText(risk.severity);
    return severity !== "high" && severity !== "critical";
  }).length;

  return {
    highRisk,
    assumptions,
    issues: raid.issues.length,
    dependencies: raid.dependencies.length,
  };
}

export function buildPmRaidTopItems(
  raid: PmMissionControl["raid"],
  limit = 3,
): PmRaidTopItem[] {
  const items: PmRaidTopItem[] = [
    ...raid.risks.map((risk) => ({
      title: risk.title,
      kind: "risk" as const,
      severity: risk.severity,
    })),
    ...raid.issues.map((issue) => ({
      title: issue.title,
      kind: "issue" as const,
      severity: issue.severity,
    })),
    ...raid.dependencies.map((dependency) => ({
      title: dependency,
      kind: "dependency" as const,
    })),
  ];

  return items.slice(0, limit);
}

export type BuildPmDayOneKpisInput = {
  pendingReviewCount: number;
  bootstrapSummary: ProjectBootstrapSummary | null;
  overview: PmMissionControl["overview"];
  milestones: PmMissionControl["milestones"];
  dataSources: PmMissionControl["dataSources"];
  teamJoinedCount: number;
  teamTotalCount: number;
};

export function buildPmDayOneKpis(input: BuildPmDayOneKpisInput): PmDayOneKpi[] {
  const milestoneTotal =
    input.bootstrapSummary?.structure?.milestones ?? input.milestones.length;
  const milestoneDone = input.milestones.filter((m) => m.status === "done").length;
  const milestonePct = milestoneProgressPct(input.milestones, milestoneTotal);

  const budgetIsLive = input.dataSources.deliveryPlan === "live";
  const budget = budgetIsLive
    ? formatHonestKpi(input.overview.budgetLabel, "Set budget after charter review")
    : formatHonestKpi(null, "Set budget after charter review");
  const budgetPct = budgetIsLive ? budgetSpendPct(input.overview.budgetLabel) : null;

  return [
    {
      label: "Project health",
      value: "—",
      hint: "Updates after first standup",
      tone: "default",
    },
    {
      label: "Milestones",
      value: `${milestoneDone}/${milestoneTotal || 0}`,
      hint: milestoneTotal ? "From GO bootstrap" : "Awaiting milestone plan",
      tone: milestoneDone > 0 ? "healthy" : "default",
      progressPct: milestonePct,
    },
    {
      label: "Awaiting review",
      value: String(input.pendingReviewCount),
      hint: input.pendingReviewCount === 1 ? "AI proposal" : "AI proposals",
      tone: input.pendingReviewCount > 0 ? "watch" : "healthy",
      progressPct: pendingReviewBarPct(input.pendingReviewCount),
    },
    {
      label: "Team joined",
      value: `${input.teamJoinedCount}/${input.teamTotalCount}`,
      hint:
        input.teamTotalCount > input.teamJoinedCount
          ? `${input.teamTotalCount - input.teamJoinedCount} invite pending`
          : "Org members on project",
      tone: input.teamJoinedCount >= input.teamTotalCount ? "healthy" : "watch",
      progressPct: teamJoinPct(input.teamJoinedCount, input.teamTotalCount),
    },
    {
      label: "Budget",
      value: String(budget.value),
      hint: budget.hint ?? "Approved vs spent",
      tone: budgetIsLive ? "default" : "default",
      progressPct: budgetPct ?? undefined,
    },
  ];
}

export function milestoneDayOneLabel(
  milestone: { phase: string; status: "done" | "active" | "pending" },
  index: number,
  milestones: Array<{ status: "done" | "active" | "pending" }>,
): string {
  if (milestone.status === "done") return "Complete";
  if (milestone.status === "active") {
    const firstActiveIndex = milestones.findIndex((m) => m.status === "active");
    if (firstActiveIndex === index) return "Starts now";
    return "In progress";
  }
  return "Upcoming";
}
