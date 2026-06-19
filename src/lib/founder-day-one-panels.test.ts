import { describe, expect, it } from "vitest";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { FounderPortfolioRow } from "@/services/founderEngine";
import {
  FOUNDER_DAY_ONE_PANEL_IDS,
  buildFounderDayOneKpis,
  buildFounderPortfolioSnapshotCounts,
  buildFounderPortfolioTopItems,
  buildFounderProposalsHref,
  groupPendingFounderReviewsByCategory,
  inferFounderReviewCategory,
  isFounderDayOnePanel,
} from "./founder-day-one-panels";

function mockReview(
  overrides: Partial<ArtifactReviewRow> & Pick<ArtifactReviewRow, "entity_type" | "title">,
): ArtifactReviewRow {
  return {
    id: overrides.id ?? "rev-1",
    organisation_id: "org-1",
    project_id: "proj-1",
    entity_id: null,
    entity_ids: overrides.entity_ids ?? ["e1"],
    summary: overrides.summary ?? "",
    payload: overrides.payload ?? {},
    status: "needs_review",
    source: "ai",
    reviewer_notes: null,
    decided_by: null,
    decided_at: null,
    created_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const SAMPLE_PORTFOLIO: FounderPortfolioRow[] = [
  {
    id: "p1",
    name: "Alpha",
    healthTone: "green",
    ragStatus: "green",
    budgetLabel: "£50k / £100k",
    deliveryPct: 72,
    openRisks: 0,
  },
  {
    id: "p2",
    name: "Beta",
    healthTone: "amber",
    ragStatus: "amber",
    budgetLabel: "£30k / £80k",
    deliveryPct: 45,
    openRisks: 1,
  },
  {
    id: "p3",
    name: "Gamma",
    healthTone: "red",
    ragStatus: "red",
    budgetLabel: "£90k / £100k",
    deliveryPct: 30,
    openRisks: 2,
  },
];

describe("founder-day-one-panels", () => {
  it("exposes stable day-one panel ids", () => {
    expect(FOUNDER_DAY_ONE_PANEL_IDS).toEqual([
      "decisions",
      "intelligence-feed",
      "funding",
      "objectives",
      "founder-context",
    ]);
    expect(isFounderDayOnePanel("decisions")).toBe(true);
    expect(isFounderDayOnePanel("portfolio")).toBe(false);
  });

  it("infers founder review categories from entity type and title", () => {
    expect(
      inferFounderReviewCategory(
        mockReview({ entity_type: "customer_insight", title: "Market insight draft" }),
      ),
    ).toBe("market-insights");
    expect(
      inferFounderReviewCategory(
        mockReview({ entity_type: "report", title: "Investment report" }),
      ),
    ).toBe("investment-reports");
    expect(
      inferFounderReviewCategory(
        mockReview({ entity_type: "structure_bundle", title: "Portfolio structure" }),
      ),
    ).toBe("org-portfolio");
    expect(
      inferFounderReviewCategory(mockReview({ entity_type: "decision", title: "Strategic GO" })),
    ).toBe("strategic-decisions");
  });

  it("groups pending reviews into stable category order", () => {
    const groups = groupPendingFounderReviewsByCategory([
      mockReview({ id: "r1", entity_type: "customer_insight", title: "Customer insight" }),
      mockReview({ id: "r2", entity_type: "decision", title: "Board decision" }),
      mockReview({ id: "r3", entity_type: "report", title: "Investment report" }),
    ]);

    expect(groups.map((group) => group.id)).toEqual([
      "strategic-decisions",
      "investment-reports",
      "market-insights",
    ]);
    expect(groups[0]?.meta).toContain("1 proposal");
  });

  it("builds day-one KPI strip from founder mission data", () => {
    const kpis = buildFounderDayOneKpis({
      pendingReviewCount: 2,
      pendingDecisionsCount: 3,
      companyHealth: { tier: "amber", label: "Amber" },
      kpis: {
        runwayMonths: 8,
        monthlyBurn: 45000,
        mrr: 12000,
        arr: 144000,
        growthPct: 12,
        teamVelocity: "42 pts",
      },
      funding: {
        cashInBank: 360000,
        monthlyBurn: 45000,
        runwayMonths: 8,
        nextRaise: "Q3",
        runwayEndPrediction: "Runway ends Dec 2026",
        currency: "GBP",
      },
      portfolio: SAMPLE_PORTFOLIO,
      dataSources: {
        financials: "live",
        strategicObjectives: "live",
        decisions: "live",
        intelligence: "live",
      },
    });

    expect(kpis.find((kpi) => kpi.label === "Company health")).toMatchObject({
      value: "Amber",
      tone: "watch",
    });
    expect(kpis.find((kpi) => kpi.label === "Decisions waiting")?.value).toBe("3");
    expect(kpis.find((kpi) => kpi.label === "Awaiting review")?.value).toBe("2");
    expect(kpis.find((kpi) => kpi.label === "Runway")?.value).toBe("8 mo");
    expect(kpis.find((kpi) => kpi.label === "Portfolio")?.value).toBe("1/3 on track");
  });

  it("summarises portfolio snapshot counts and top items", () => {
    expect(buildFounderPortfolioSnapshotCounts(SAMPLE_PORTFOLIO)).toEqual({
      onTrack: 1,
      atRisk: 1,
      offTrack: 1,
      total: 3,
    });

    const topItems = buildFounderPortfolioTopItems(SAMPLE_PORTFOLIO);
    expect(topItems.map((item) => item.name)).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  it("builds founder proposals href with persona and optional project", () => {
    expect(buildFounderProposalsHref("proj-1")).toBe(
      "/workspace/proposals?persona=founder&project=proj-1",
    );
    expect(buildFounderProposalsHref("proj-1", "rev-9")).toBe(
      "/workspace/proposals?persona=founder&project=proj-1&review=rev-9",
    );
  });
});
