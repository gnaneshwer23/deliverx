import { describe, expect, it, beforeEach, vi } from "vitest";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import {
  buildPmWelcomeBridgeChips,
  dismissPmBridge,
  isPmBridgeDismissed,
  pmBridgeDismissStorageKey,
  resolvePmDashboardMode,
} from "./pm-dashboard-mode";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 4,
    tasks: 12,
    raidItems: 5,
    milestones: 3,
    stakeholders: 2,
  },
  personas: {
    pm: { ok: true, counts: { criticalRisks: 2 } },
    ba: { ok: true },
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

describe("pm-dashboard-mode", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("builds project-scoped bridge dismiss storage keys", () => {
    expect(pmBridgeDismissStorageKey("proj-123")).toBe("dx-pm-bridge:proj-123");
  });

  it("reads and writes bridge dismiss state via localStorage", () => {
    expect(isPmBridgeDismissed("proj-123")).toBe(false);
    dismissPmBridge("proj-123");
    expect(isPmBridgeDismissed("proj-123")).toBe(true);
  });

  it("returns steady-state without project, bootstrap summary, or after dismiss", () => {
    expect(
      resolvePmDashboardMode({
        projectId: null,
        hasBootstrapSummary: true,
        pendingReviewCount: 3,
        bridgeDismissed: false,
      }),
    ).toBe("steady-state");

    expect(
      resolvePmDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: false,
        pendingReviewCount: 3,
        bridgeDismissed: false,
      }),
    ).toBe("steady-state");

    expect(
      resolvePmDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 3,
        bridgeDismissed: true,
      }),
    ).toBe("steady-state");
  });

  it("returns day-one when bootstrap exists with pending reviews or invites", () => {
    expect(
      resolvePmDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 2,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");

    expect(
      resolvePmDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        teamInvitesPending: 1,
        bridgeDismissed: false,
      }),
    ).toBe("day-one");
  });

  it("returns steady-state when bootstrap exists but no follow-up work remains", () => {
    expect(
      resolvePmDashboardMode({
        projectId: "proj-1",
        hasBootstrapSummary: true,
        pendingReviewCount: 0,
        teamInvitesPending: 0,
        bridgeDismissed: false,
      }),
    ).toBe("steady-state");
  });

  it("builds four welcome bridge chips from bootstrap summary", () => {
    expect(buildPmWelcomeBridgeChips(SAMPLE_SUMMARY)).toEqual([
      { label: "workstreams", count: 4 },
      { label: "milestones", count: 3 },
      { label: "RAID items", count: 5 },
      { label: "team joined", count: 2 },
    ]);
  });

  it("falls back chip counts when structure fields are missing", () => {
    const chips = buildPmWelcomeBridgeChips(
      { personas: { pm: { ok: true, counts: { criticalRisks: 1 } } } },
      { teamJoinedCount: 4 },
    );

    expect(chips).toHaveLength(4);
    expect(chips.find((chip) => chip.label === "RAID items")?.count).toBe(1);
    expect(chips.find((chip) => chip.label === "team joined")?.count).toBe(4);
  });
});
