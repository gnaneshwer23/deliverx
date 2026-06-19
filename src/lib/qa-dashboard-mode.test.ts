import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  buildQaWelcomeBridgeChips,
  qaBridgeDismissStorageKey,
  resolveQaDashboardMode,
} from "./qa-dashboard-mode";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 2,
    tasks: 12,
    raidItems: 0,
    milestones: 2,
    stakeholders: 1,
  },
  personas: {
    qa: { ok: true, counts: { guidedTasks: 9 } },
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

describe("qa-dashboard-mode", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("uses project-scoped dismiss storage keys", () => {
    expect(qaBridgeDismissStorageKey("proj-789")).toBe("dx-qa-bridge:proj-789");
  });

  it("returns day-one when reviews or critical defects remain", () => {
    expect(
      resolveQaDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        criticalDefects: 1,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");
  });

  it("builds QA welcome bridge chips", () => {
    expect(
      buildQaWelcomeBridgeChips(SAMPLE_SUMMARY, {
        criticalDefects: 1,
        pendingReviewCount: 2,
      }),
    ).toEqual([
      { label: "test cases", count: 9 },
      { label: "critical defects", count: 1 },
      { label: "milestones", count: 2 },
      { label: "outputs to review", count: 2 },
    ]);
  });
});
