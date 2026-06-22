import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  buildProductWelcomeBridgeChips,
  productBridgeDismissStorageKey,
  resolveProductDashboardMode,
} from "./product-dashboard-mode";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 2,
    tasks: 8,
    raidItems: 1,
    milestones: 3,
    stakeholders: 2,
  },
  personas: {
    product: { ok: true, counts: { features: 5 } },
  },
};

function createStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    clear: () => store.clear(),
  };
}

describe("product-dashboard-mode", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("uses project-scoped dismiss storage keys", () => {
    expect(productBridgeDismissStorageKey("proj-456")).toBe("dx-product-bridge:proj-456");
  });

  it("returns day-one when reviews remain or roadmap is empty", () => {
    expect(
      resolveProductDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 1,
        roadmapItemCount: 4,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");

    expect(
      resolveProductDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        roadmapItemCount: 0,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");
  });

  it("builds welcome bridge chips from bootstrap summary", () => {
    const chips = buildProductWelcomeBridgeChips(SAMPLE_SUMMARY, {
      pendingReviewCount: 2,
      roadmapItemCount: 6,
    });
    expect(chips).toEqual([
      { label: "features", count: 5 },
      { label: "roadmap items", count: 6 },
      { label: "workstreams", count: 2 },
      { label: "outputs to review", count: 2 },
    ]);
  });
});
