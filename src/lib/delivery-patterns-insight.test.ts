import { describe, expect, it } from "vitest";
import { pickPmDeliveryPatternInsight } from "./delivery-patterns-insight";
import type { CoordinationSnapshot } from "@/services/coordinationEngine";
import { DELIVERY_PATTERNS_HREF } from "./intelligence-nav-labels";

const baseSnapshot: CoordinationSnapshot = {
  capturedAt: new Date().toISOString(),
  coordinationStability: 72,
  governanceFriction: 20,
  agentInsights: [
    {
      agent: "Optimization Agent",
      specialization: "resource_rebalancing",
      type: "optimization",
      message: "Rebalance capacity across at-risk projects",
      confidence: 0.76,
      reasoning: "Multiple projects below health threshold",
      severity: "medium",
    },
    {
      agent: "Cross-Org Agent",
      specialization: "ecosystem_coordination",
      type: "cross_org",
      message: "Partner delay impacting programme",
      confidence: 0.86,
      reasoning: "Shared dependency across ecosystem boundary",
      severity: "high",
    },
  ],
  recommendations: [],
  graph: { nodes: [], edges: [] },
  chainSummary: "Nominal",
  crossOrgAlerts: [],
};

describe("delivery-patterns-insight", () => {
  it("returns null when snapshot is missing", () => {
    expect(pickPmDeliveryPatternInsight(null)).toBeNull();
  });

  it("picks the highest-severity coordination insight", () => {
    const insight = pickPmDeliveryPatternInsight(baseSnapshot);
    expect(insight?.headline).toContain("Partner delay");
    expect(insight?.href).toBe(DELIVERY_PATTERNS_HREF);
    expect(insight?.severity).toBe("high");
  });
});
