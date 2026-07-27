import { describe, expect, it } from "vitest";
import {
  AI_COST_ESTIMATE_DISCLOSURE,
  AI_COST_ESTIMATE_KIND,
  costEstimateDisclosure,
  estimateCostUsd,
} from "@/lib/ai-orchestration/usage-log";

describe("AI usage cost honesty", () => {
  it("labels estimated cost as heuristic and not provider billing", () => {
    const estimated = estimateCostUsd(1000, 500);
    expect(estimated).toBeGreaterThan(0);
    expect(costEstimateDisclosure(estimated)).toEqual({
      costEstimateKind: AI_COST_ESTIMATE_KIND,
      costEstimateDisclosure: AI_COST_ESTIMATE_DISCLOSURE,
    });
    expect(AI_COST_ESTIMATE_DISCLOSURE).toMatch(/not provider billing/i);
  });

  it("still discloses estimate semantics when no cost value is available", () => {
    expect(costEstimateDisclosure(null)).toEqual({
      costEstimateKind: null,
      costEstimateDisclosure: AI_COST_ESTIMATE_DISCLOSURE,
    });
  });
});
