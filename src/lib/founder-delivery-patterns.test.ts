import { describe, expect, it } from "vitest";
import type { FounderIntelligenceFeedItem } from "@/lib/founder-intelligence-feed";
import { pickFounderDeliveryPatternInsight } from "./founder-delivery-patterns";
import { DELIVERY_PATTERNS_HREF } from "./intelligence-nav-labels";

const SAMPLE_INTEL: FounderIntelligenceFeedItem = {
  id: "intel-1",
  source: "impact",
  message: "Cross-team handoff delay affecting milestone Alpha-3",
  badge: "PM",
  severity: "high",
  meta: "coordination gap",
  projectId: "p1",
  projectName: "Alpha",
  createdAt: new Date().toISOString(),
};

describe("founder-delivery-patterns", () => {
  it("returns null when intelligence is fallback", () => {
    expect(pickFounderDeliveryPatternInsight([SAMPLE_INTEL], "fallback")).toBeNull();
  });

  it("picks highest-severity insight and links to ecosystem view", () => {
    const insight = pickFounderDeliveryPatternInsight(
      [
        { ...SAMPLE_INTEL, id: "low", severity: "low", message: "Minor update" },
        SAMPLE_INTEL,
      ],
      "live",
    );

    expect(insight?.headline).toBe(SAMPLE_INTEL.message);
    expect(insight?.href).toBe(DELIVERY_PATTERNS_HREF);
    expect(insight?.detail).toMatch(/Alpha/);
  });
});
