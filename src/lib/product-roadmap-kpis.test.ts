import { describe, expect, it } from "vitest";
import {
  buildProductRoadmapKpis,
  buildProductRoadmapSynthesis,
} from "./product-roadmap-kpis";

describe("product-roadmap-kpis", () => {
  it("returns em-dash for top RICE when data is fallback", () => {
    const kpis = buildProductRoadmapKpis({
      kpis: {
        productHealth: 0,
        featureAdoption: 0,
        nps: null,
        retention: null,
        featuresNow: 0,
        featuresTotal: 0,
        insightsCount: 0,
      },
      roadmap: { now: [], next: ["A"], later: ["B"] },
      topFeatures: [{ title: "Feature X", score: 42, horizon: "now" }],
      dataSources: { roadmapRice: "fallback" },
    });
    expect(kpis.find((k) => k.label === "Top RICE")?.value).toBe("—");
  });

  it("flags empty Now column in synthesis when live", () => {
    const summary = buildProductRoadmapSynthesis({
      nowCount: 0,
      nextCount: 2,
      pendingReviewCount: 0,
      productHealth: 80,
      isLive: true,
    });
    expect(summary).toContain("Now column is empty");
  });
});
