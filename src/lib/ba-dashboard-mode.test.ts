import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  buildBaWelcomeBridgeChips,
  baBridgeDismissStorageKey,
  dismissBaBridge,
  isBaBridgeDismissed,
  resolveBaDashboardMode,
} from "./ba-dashboard-mode";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 3,
    tasks: 8,
    raidItems: 2,
    milestones: 4,
    stakeholders: 3,
  },
  personas: {
    ba: { ok: true, counts: { requirements: 6, clarifications: 2 } },
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

describe("ba-dashboard-mode", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("uses project-scoped dismiss storage keys", () => {
    expect(baBridgeDismissStorageKey("proj-123")).toBe("dx-ba-bridge:proj-123");
  });

  it("persists bridge dismiss state", () => {
    expect(isBaBridgeDismissed("proj-123")).toBe(false);
    dismissBaBridge("proj-123");
    expect(isBaBridgeDismissed("proj-123")).toBe(true);
  });

  it("returns day-one when bootstrap exists with reviews or clarifications", () => {
    expect(
      resolveBaDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 1,
        pendingClarifications: 0,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");

    expect(
      resolveBaDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        pendingClarifications: 2,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");
  });

  it("returns steady-state when no follow-up work remains", () => {
    expect(
      resolveBaDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        pendingClarifications: 0,
        bridgeDismissed: false,
      }),
    ).toBe("steady-state");
  });

  it("builds BA welcome bridge chips from bootstrap summary", () => {
    expect(buildBaWelcomeBridgeChips(SAMPLE_SUMMARY, { pendingReviewCount: 3 })).toEqual([
      { label: "requirements", count: 6 },
      { label: "clarifications", count: 2 },
      { label: "stories linked", count: 8 },
      { label: "outputs to review", count: 3 },
    ]);
  });
});
