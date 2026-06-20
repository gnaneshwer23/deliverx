import { describe, expect, it } from "vitest";
import type { FounderPortfolioRow } from "@/services/founderEngine";
import { buildFounderStrategicKpis, FOUNDER_STRATEGIC_KPI_MAX } from "./founder-strategic-kpis";

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

describe("founder-strategic-kpis", () => {
  it("returns exactly five strategic KPIs with honest labels", () => {
    const kpis = buildFounderStrategicKpis({
      funding: {
        cashInBank: 620_000,
        monthlyBurn: 45_000,
        runwayMonths: 14,
        nextRaise: "Q2 2027",
        runwayEndPrediction: "Stable runway",
        currency: "GBP",
      },
      kpis: {
        runwayMonths: 14,
        monthlyBurn: 45_000,
        mrr: 25_000,
        arr: 300_000,
        growthPct: 12,
        teamVelocity: "Stable",
      },
      portfolio: SAMPLE_PORTFOLIO,
      strategicObjectives: [
        { title: "Reach PMF", progress: 68, insight: "Below target" },
        { title: "Expand EU", progress: 82 },
      ],
      pendingDecisionsCount: 2,
      dataSources: {
        financials: "live",
        strategicObjectives: "live",
        decisions: "live",
        intelligence: "live",
      },
    });

    expect(kpis).toHaveLength(FOUNDER_STRATEGIC_KPI_MAX);
    expect(kpis.map((kpi) => kpi.label)).toEqual([
      "Runway",
      "Burn",
      "Objective progress",
      "Portfolio health",
      "Decisions waiting",
    ]);
    expect(kpis.find((kpi) => kpi.label === "Runway")?.progressPct).toBeGreaterThan(0);
    expect(kpis.find((kpi) => kpi.label === "Objective progress")?.value).toBe("75%");
    expect(kpis.find((kpi) => kpi.label === "Portfolio health")?.value).toBe("1/2");
  });

  it("shows em-dash when financials are not live", () => {
    const kpis = buildFounderStrategicKpis({
      funding: {
        cashInBank: 0,
        monthlyBurn: 0,
        runwayMonths: 0,
        nextRaise: "—",
        runwayEndPrediction: "",
        currency: "GBP",
      },
      kpis: {
        runwayMonths: 14,
        monthlyBurn: 45_000,
        mrr: 0,
        arr: 0,
        growthPct: 0,
        teamVelocity: "Stable",
      },
      portfolio: [],
      strategicObjectives: [],
      pendingDecisionsCount: 0,
      dataSources: {
        financials: "fallback",
        strategicObjectives: "fallback",
        decisions: "live",
        intelligence: "fallback",
      },
    });

    expect(kpis.find((kpi) => kpi.label === "Runway")?.value).toBe("—");
    expect(kpis.find((kpi) => kpi.label === "Burn")?.value).toBe("—");
  });
});
