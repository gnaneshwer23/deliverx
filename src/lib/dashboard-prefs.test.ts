import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  dashboardPrefsStorageKey,
  EMPTY_DASHBOARD_PREFS,
  buildDefaultDashboardPrefs,
  mergeDashboardPrefs,
  parseDashboardPrefs,
  readDashboardPrefs,
  setPanelCollapsed,
  setPanelHidden,
  writeDashboardPrefs,
} from "./dashboard-prefs";
import { essentialPanelCount } from "@/config/dashboard-essential-panels";

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

describe("dashboard-prefs", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("builds persona-scoped storage keys", () => {
    expect(dashboardPrefsStorageKey("pm-mission")).toBe("dx-dashboard-prefs:pm-mission");
    expect(dashboardPrefsStorageKey("command-centre")).toBe("dx-dashboard-prefs:command-centre");
  });

  it("returns empty prefs for missing or invalid JSON", () => {
    expect(parseDashboardPrefs(null)).toEqual(EMPTY_DASHBOARD_PREFS);
    expect(parseDashboardPrefs("{not-json")).toEqual(EMPTY_DASHBOARD_PREFS);
    expect(parseDashboardPrefs('{"collapsed":{"a":true}}')).toEqual({
      collapsed: { a: true },
      hidden: {},
    });
  });

  it("merges partial prefs without dropping existing keys", () => {
    const merged = mergeDashboardPrefs(
      { collapsed: { a: true }, hidden: { b: true } },
      { collapsed: { c: true } },
    );
    expect(merged).toEqual({
      collapsed: { a: true, c: true },
      hidden: { b: true },
    });
  });

  it("returns panel-diet defaults when storage key is absent", () => {
    const defaults = readDashboardPrefs("founder");
    expect(Object.keys(defaults.hidden).length).toBeGreaterThan(0);
    expect(defaults.hidden.portfolio).toBeUndefined();
    expect(defaults.hidden.investor).toBe(true);
  });

  it("builds default prefs that show only essential panels", () => {
    const defaults = buildDefaultDashboardPrefs("ba");
    const visibleCount = Object.values(defaults.hidden).filter((v) => !v).length;
    expect(visibleCount).toBe(0);
    expect(essentialPanelCount("ba")).toBe(5);
    expect(defaults.hidden["success-metrics"]).toBe(true);
    expect(defaults.hidden["guided-tasks"]).toBeUndefined();
  });

  it("respects saved prefs when storage key exists", () => {
    writeDashboardPrefs("founder", EMPTY_DASHBOARD_PREFS);
    expect(readDashboardPrefs("founder")).toEqual(EMPTY_DASHBOARD_PREFS);
  });

  it("reads and writes prefs via localStorage", () => {
    writeDashboardPrefs("founder", {
      collapsed: { portfolio: true },
      hidden: { investor: true },
    });
    expect(readDashboardPrefs("founder")).toEqual({
      collapsed: { portfolio: true },
      hidden: { investor: true },
    });
  });

  it("sets collapsed and hidden flags with cleanup on false", () => {
    let prefs = setPanelCollapsed(EMPTY_DASHBOARD_PREFS, "health", true);
    expect(prefs.collapsed.health).toBe(true);

    prefs = setPanelCollapsed(prefs, "health", false);
    expect(prefs.collapsed.health).toBeUndefined();

    prefs = setPanelHidden(prefs, "raid", true);
    expect(prefs.hidden.raid).toBe(true);

    prefs = setPanelHidden(prefs, "raid", false);
    expect(prefs.hidden.raid).toBeUndefined();
  });
});
