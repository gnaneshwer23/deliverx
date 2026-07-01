import { describe, expect, it } from "vitest";
import {
  buildFounderExecutiveKpis,
  FOUNDER_EXECUTIVE_KPI_COUNT,
} from "@/lib/founder-executive-kpis";
import type { FounderMissionControl } from "@/services/founderDashboard";

function sampleFounderData(
  patch: Partial<FounderMissionControl> = {},
): FounderMissionControl {
  return {
    userName: "Pat",
    orgName: "Acme",
    primaryProject: { id: "p1", name: "Alpha" },
    projects: [{ id: "p1", name: "Alpha", status: "active" }],
    companyHealth: { tier: "green", label: "Healthy" },
    dataSources: {
      financials: "fallback",
      strategicObjectives: "fallback",
      decisions: "live",
      intelligence: "fallback",
    },
    intelligenceFeed: [],
    kpis: {
      runwayMonths: 14,
      monthlyBurn: 45_000,
      mrr: 25_000,
      arr: 300_000,
      growthPct: 12,
      teamVelocity: "Stable",
    },
    aiSummary: "Summary",
    portfolio: [
      {
        id: "p1",
        name: "Alpha",
        healthTone: "green",
        ragStatus: "green",
        budgetLabel: "On track",
        deliveryPct: 72,
        openRisks: 0,
      },
    ],
    strategicObjectives: [],
    strategicInsight: "",
    funding: {
      cashInBank: 620_000,
      monthlyBurn: 45_000,
      runwayMonths: 14,
      nextRaise: "Q2 2027",
      runwayEndPrediction: "Runway ends in ~14 months",
      currency: "GBP",
    },
    investorUpdate: [],
    decisionsNeeded: [],
    deliveryHealth: {
      projectsOnTrack: "1/1",
      criticalRisks: 0,
      blockedDependencies: 0,
      avgDeliveryConfidence: 84,
    },
    productHealth: {
      nps: null,
      retention: null,
      featureAdoption: 74,
      satisfaction: null,
    },
    teamHealth: {
      engineeringCapacityPct: 92,
      burnoutRisk: "Low",
      hiringNeed: "None urgent",
      recommendation: "Stable",
    },
    crossRoleImpact: [],
    extractionStatus: "pending",
    investmentReports: [],
    benefitsTracker: [],
    ...patch,
  };
}

describe("founder-executive-kpis", () => {
  it("returns exactly three KPIs", () => {
    const kpis = buildFounderExecutiveKpis(sampleFounderData());
    expect(kpis).toHaveLength(FOUNDER_EXECUTIVE_KPI_COUNT);
    expect(kpis.map((k) => k.label)).toEqual(["Programme health", "Budget", "Open risks"]);
  });

  it("uses em-dash for budget when financials are not live", () => {
    const kpis = buildFounderExecutiveKpis(sampleFounderData());
    const budget = kpis.find((k) => k.label === "Budget");
    expect(budget?.value).toBe("—");
    expect(budget?.hint).toMatch(/founder context/i);
  });

  it("shows live budget when financials are connected", () => {
    const kpis = buildFounderExecutiveKpis(
      sampleFounderData({ dataSources: { ...sampleFounderData().dataSources, financials: "live" } }),
    );
    const budget = kpis.find((k) => k.label === "Budget");
    expect(budget?.value).toMatch(/burn/);
    expect(budget?.value).not.toBe("—");
  });

  it("shows honest risk count when intelligence is live", () => {
    const kpis = buildFounderExecutiveKpis(
      sampleFounderData({
        dataSources: { ...sampleFounderData().dataSources, intelligence: "live" },
        deliveryHealth: { ...sampleFounderData().deliveryHealth, criticalRisks: 2 },
      }),
    );
    expect(kpis.find((k) => k.label === "Open risks")?.value).toBe("2");
  });
});
