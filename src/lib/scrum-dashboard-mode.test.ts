import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  buildScrumWelcomeBridgeChips,
  scrumBridgeDismissStorageKey,
  resolveScrumDashboardMode,
} from "./scrum-dashboard-mode";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 2,
    tasks: 12,
    raidItems: 2,
    milestones: 3,
    stakeholders: 2,
  },
  personas: {
    scrum: { ok: true, counts: { guidedTasks: 9 } },
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

describe("scrum-dashboard-mode", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("uses project-scoped dismiss storage keys", () => {
    expect(scrumBridgeDismissStorageKey("proj-456")).toBe("dx-scrum-bridge:proj-456");
  });

  it("returns day-one when impediments or blocked stories remain", () => {
    expect(
      resolveScrumDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        impedimentCount: 1,
        blockedStories: 0,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");
  });

  it("builds welcome bridge chips from bootstrap summary", () => {
    const chips = buildScrumWelcomeBridgeChips(SAMPLE_SUMMARY, {
      pendingReviewCount: 1,
      impedimentCount: 2,
      blockedStories: 3,
    });
    expect(chips).toEqual([
      { label: "sprint tasks", count: 9 },
      { label: "impediments", count: 2 },
      { label: "blocked stories", count: 3 },
      { label: "outputs to review", count: 1 },
    ]);
  });
});
