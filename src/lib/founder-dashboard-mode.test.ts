import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  buildFounderWelcomeBridgeChips,
  dismissFounderBridge,
  founderBridgeDismissStorageKey,
  isFounderBridgeDismissed,
  resolveFounderDashboardMode,
} from "./founder-dashboard-mode";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 3,
    tasks: 10,
    raidItems: 4,
    milestones: 2,
    stakeholders: 5,
  },
  personas: {
    pm: { ok: true },
    founder: { ok: true },
  },
  pendingArtifactReviews: 2,
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

describe("founder-dashboard-mode", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("builds project-scoped bridge dismiss storage keys", () => {
    expect(founderBridgeDismissStorageKey("proj-456")).toBe("dx-founder-bridge:proj-456");
  });

  it("reads and writes bridge dismiss state via localStorage", () => {
    expect(isFounderBridgeDismissed("proj-456")).toBe(false);
    dismissFounderBridge("proj-456");
    expect(isFounderBridgeDismissed("proj-456")).toBe(true);
  });

  it("returns steady-state without project, bootstrap summary, or after dismiss", () => {
    expect(
      resolveFounderDashboardMode({
        projectId: null,
        hasBootstrapSummary: true,
        pendingReviewCount: 2,
        pendingDecisionsCount: 1,
        bridgeDismissed: false,
      }),
    ).toBe("steady-state");

    expect(
      resolveFounderDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: false,
        pendingReviewCount: 2,
        bridgeDismissed: false,
      }),
    ).toBe("steady-state");

    expect(
      resolveFounderDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 2,
        bridgeDismissed: true,
      }),
    ).toBe("steady-state");
  });

  it("returns day-one when bootstrap exists with pending reviews or decisions", () => {
    expect(
      resolveFounderDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 1,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");

    expect(
      resolveFounderDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        pendingDecisionsCount: 2,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");
  });

  it("returns steady-state when bootstrap exists but no follow-up work remains", () => {
    expect(
      resolveFounderDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        pendingDecisionsCount: 0,
        bridgeDismissed: false,
      }),
    ).toBe("steady-state");
  });

  it("builds four welcome bridge chips from bootstrap summary and follow-up counts", () => {
    expect(
      buildFounderWelcomeBridgeChips(SAMPLE_SUMMARY, {
        pendingDecisionsCount: 1,
        pendingReviewCount: 3,
      }),
    ).toEqual([
      { label: "workstreams", count: 3 },
      { label: "milestones", count: 2 },
      { label: "decisions waiting", count: 1 },
      { label: "outputs to review", count: 3 },
    ]);
  });

  it("falls back chip counts when structure fields are missing", () => {
    const chips = buildFounderWelcomeBridgeChips(
      { personas: { founder: { ok: true } }, pendingArtifactReviews: 1 },
      { pendingDecisionsCount: 2 },
    );

    expect(chips).toHaveLength(4);
    expect(chips.find((chip) => chip.label === "workstreams")?.count).toBe(1);
    expect(chips.find((chip) => chip.label === "outputs to review")?.count).toBe(1);
    expect(chips.find((chip) => chip.label === "decisions waiting")?.count).toBe(2);
  });
});
