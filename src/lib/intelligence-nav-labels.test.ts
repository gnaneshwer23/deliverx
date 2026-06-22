import { describe, expect, it } from "vitest";
import {
  BENCHMARKS_RECOMMENDATIONS_HREF,
  BENCHMARKS_RECOMMENDATIONS_NAV_LABEL,
  DELIVERY_BRAIN_HREF,
  DELIVERY_INSIGHTS_NAV_LABEL,
  DELIVERY_PATTERNS_HREF,
  DELIVERY_PATTERNS_NAV_LABEL,
} from "./intelligence-nav-labels";

describe("intelligence-nav-labels", () => {
  it("exposes user-friendly coordination and global labels", () => {
    expect(DELIVERY_PATTERNS_NAV_LABEL).toBe("Delivery Brain");
    expect(BENCHMARKS_RECOMMENDATIONS_NAV_LABEL).toBe("Benchmarks & Recommendations");
    expect(DELIVERY_INSIGHTS_NAV_LABEL).toBe("Delivery insights");
  });

  it("points nav labels at the expected routes", () => {
    expect(DELIVERY_BRAIN_HREF).toBe("/brain");
    expect(DELIVERY_PATTERNS_HREF).toBe("/workspace/coordination");
    expect(BENCHMARKS_RECOMMENDATIONS_HREF).toBe("/workspace/global");
  });
});
