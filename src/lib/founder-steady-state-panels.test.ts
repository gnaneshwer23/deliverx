import { describe, expect, it } from "vitest";
import type { FounderIntelligenceFeedItem } from "@/lib/founder-intelligence-feed";
import type { FounderDecisionRow, FounderPortfolioRow } from "@/services/founderEngine";
import {
  FOUNDER_STEADY_STATE_LEFT_PANEL_IDS,
  FOUNDER_STEADY_STATE_PANEL_IDS,
  FOUNDER_STEADY_STATE_RIGHT_PANEL_IDS,
  buildFounderAttentionFeed,
  buildFounderContextHref,
  buildFounderDecisionCentreHref,
  buildFounderGovernanceTabCounts,
  buildFounderSteadyStateKpis,
  buildFounderSteadyStateSubtitle,
  countWaitingOnFounder,
  isFounderSteadyStatePanel,
} from "./founder-steady-state-panels";

const SAMPLE_PORTFOLIO: FounderPortfolioRow[] = [
  {
    id: "p1",
    name: "Alpha",
    healthTone: "green",
    ragStatus: "green",
    budgetLabel: "On track",
    deliveryPct: 82,
    openRisks: 0,
  },
  {
    id: "p2",
    name: "Beta",
    healthTone: "amber",
    ragStatus: "red",
    budgetLabel: "At risk",
    deliveryPct: 45,
    openRisks: 2,
  },
];

const SAMPLE_DECISION: FounderDecisionRow = {
  id: "d1",
  title: "Approve vendor contract",
  impact: "High",
  status: "pending",
  projectName: "Alpha",
  projectId: "p1",
  kind: "decision",
};

const SAMPLE_INTEL: FounderIntelligenceFeedItem = {
  id: "intel-1",
  source: "impact",
  message: "Critical blocker escalated to founder",
  badge: "PM",
  severity: "high",
  meta: "escalation",
  projectId: "p1",
  projectName: "Alpha",
  createdAt: new Date().toISOString(),
};

describe("founder-steady-state-panels", () => {
  it("registers steady-state panel ids and column layout order", () => {
    expect(FOUNDER_STEADY_STATE_PANEL_IDS).toContain("needs-attention");
    expect(FOUNDER_STEADY_STATE_PANEL_IDS).toContain("governance-tabs");
    expect(FOUNDER_STEADY_STATE_LEFT_PANEL_IDS[0]).toBe("needs-attention");
    expect(FOUNDER_STEADY_STATE_RIGHT_PANEL_IDS[0]).toBe("portfolio-snapshot");
    expect(isFounderSteadyStatePanel("needs-attention")).toBe(true);
    expect(isFounderSteadyStatePanel("unknown")).toBe(false);
  });

  it("builds steady-state subtitle from follow-up counts", () => {
    expect(
      buildFounderSteadyStateSubtitle({
        projectName: "Alpha",
        pendingDecisionsCount: 2,
        pendingReviewCount: 1,
        criticalRisks: 0,
      }),
    ).toBe("Alpha — 2 decisions waiting · 1 output to review.");

    expect(
      buildFounderSteadyStateSubtitle({
        pendingDecisionsCount: 0,
        pendingReviewCount: 0,
        criticalRisks: 0,
      }),
    ).toBe("Executive steady-state — portfolio on track, no urgent escalations.");
  });

  it("builds founder header anchor hrefs with optional project param", () => {
    expect(buildFounderDecisionCentreHref("proj-1")).toBe(
      "/workspace/founder?project=proj-1#decisions",
    );
    expect(buildFounderContextHref()).toBe("/workspace/founder#founder-context");
  });

  it("builds attention feed sorted by wait age with pills and roles", () => {
    const feed = buildFounderAttentionFeed({
      decisions: [SAMPLE_DECISION],
      pendingReviewCount: 2,
      criticalRisks: 1,
      blockedDependencies: 3,
      portfolio: SAMPLE_PORTFOLIO,
      intelligenceFeed: [SAMPLE_INTEL],
      runwayMonths: 4,
      projectId: "p1",
    });

    expect(feed.length).toBeGreaterThanOrEqual(4);
    expect(feed[0]?.waitSortDays).toBeLessThanOrEqual(feed[1]?.waitSortDays ?? 99);
    expect(feed.some((item) => item.pills.some((pill) => pill.label === "Urgent"))).toBe(true);
    expect(feed.some((item) => item.role === "Executive" || item.role === "Alpha")).toBe(true);
    expect(feed.find((item) => item.id === "pending-reviews-feed")).toBeTruthy();
    expect(feed.find((item) => item.id === "runway-feed")).toBeTruthy();
  });

  it("counts waiting-on-founder from attention feed length", () => {
    const feed = buildFounderAttentionFeed({
      decisions: [SAMPLE_DECISION],
      pendingReviewCount: 0,
      criticalRisks: 0,
      blockedDependencies: 0,
      portfolio: [],
      intelligenceFeed: [],
      runwayMonths: 14,
    });

    expect(countWaitingOnFounder(feed)).toBe(feed.length);
    expect(countWaitingOnFounder([])).toBe(0);
  });

  it("builds five steady-state KPIs from company and portfolio signals", () => {
    const kpis = buildFounderSteadyStateKpis({
      companyHealth: { tier: "green", label: "Healthy" },
      kpis: {
        runwayMonths: 14,
        monthlyBurn: 45_000,
        mrr: 25_000,
        arr: 300_000,
        growthPct: 12,
        teamVelocity: "Stable",
      },
      funding: { currency: "GBP", cashInBank: 620_000, monthlyBurn: 45_000, runwayMonths: 14, nextRaise: "Q2 2027", runwayEndPrediction: "Stable" },
      portfolio: SAMPLE_PORTFOLIO,
      waitingOnYouCount: 3,
      criticalRisks: 2,
      dataSources: {
        financials: "live",
        strategicObjectives: "live",
        decisions: "live",
        intelligence: "live",
      },
    });

    expect(kpis).toHaveLength(5);
    expect(kpis.map((kpi) => kpi.label)).toEqual([
      "Company health",
      "Portfolio on track",
      "Critical risks",
      "Waiting on you",
      "Runway",
    ]);
    expect(kpis.find((kpi) => kpi.label === "Waiting on you")?.value).toBe("3");
    expect(kpis.find((kpi) => kpi.label === "Critical risks")?.value).toBe("2");
  });

  it("builds governance tab counts from live data", () => {
    expect(
      buildFounderGovernanceTabCounts({
        decisionsCount: 2,
        portfolioCount: 3,
        objectivesCount: 4,
        runwayMonths: 8,
      }),
    ).toEqual({
      decisions: 2,
      funding: 1,
      portfolio: 3,
      objectives: 4,
    });
  });
});
