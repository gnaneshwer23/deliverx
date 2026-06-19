import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  buildEngineerWelcomeBridgeChips,
  engineerBridgeDismissStorageKey,
  resolveEngineerDashboardMode,
} from "./engineer-dashboard-mode";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 2,
    tasks: 10,
    raidItems: 1,
    milestones: 3,
    stakeholders: 2,
  },
  personas: {
    engineer: { ok: true, counts: { guidedTasks: 7 } },
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

describe("engineer-dashboard-mode", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("uses project-scoped dismiss storage keys", () => {
    expect(engineerBridgeDismissStorageKey("proj-456")).toBe("dx-engineer-bridge:proj-456");
  });

  it("returns day-one when reviews or blocked stories remain", () => {
    expect(
      resolveEngineerDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        blockedStories: 1,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");
  });

  it("builds engineer welcome bridge chips", () => {
    expect(
      buildEngineerWelcomeBridgeChips(SAMPLE_SUMMARY, {
        blockedStories: 2,
        pendingReviewCount: 4,
      }),
    ).toEqual([
      { label: "tasks assigned", count: 7 },
      { label: "milestones", count: 3 },
      { label: "blocked stories", count: 2 },
      { label: "outputs to review", count: 4 },
    ]);
  });
});
