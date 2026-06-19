import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  aiSummaryFieldKey,
  dashboardInlineEditStorageKey,
  EMPTY_DASHBOARD_INLINE_EDITS,
  mergeDashboardInlineEdits,
  panelNoteFieldKey,
  parseDashboardInlineEdits,
  readDashboardInlineEdits,
  resolveInlineText,
  setInlineEditField,
  writeDashboardInlineEdits,
} from "./dashboard-inline-edit";

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

describe("dashboard-inline-edit", () => {
  beforeEach(() => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("builds persona-scoped storage keys", () => {
    expect(dashboardInlineEditStorageKey("pm-mission")).toBe("dx-dashboard-inline-edit:pm-mission");
    expect(dashboardInlineEditStorageKey("founder")).toBe("dx-dashboard-inline-edit:founder");
  });

  it("uses stable field keys for ai summary and panel notes", () => {
    expect(aiSummaryFieldKey()).toBe("ai-summary");
    expect(panelNoteFieldKey("health")).toBe("panel-note:health");
  });

  it("returns empty edits for missing or invalid JSON", () => {
    expect(parseDashboardInlineEdits(null)).toEqual(EMPTY_DASHBOARD_INLINE_EDITS);
    expect(parseDashboardInlineEdits("{bad")).toEqual(EMPTY_DASHBOARD_INLINE_EDITS);
    expect(parseDashboardInlineEdits("[]")).toEqual(EMPTY_DASHBOARD_INLINE_EDITS);
    expect(parseDashboardInlineEdits('{"ai-summary":"ok","bad":1}')).toEqual({
      "ai-summary": "ok",
    });
  });

  it("merges partial edits without dropping existing keys", () => {
    const merged = mergeDashboardInlineEdits(
      { "ai-summary": "a", "panel-note:health": "b" },
      { "panel-note:raid": "c" },
    );
    expect(merged).toEqual({
      "ai-summary": "a",
      "panel-note:health": "b",
      "panel-note:raid": "c",
    });
  });

  it("sets and clears inline edit fields on empty trim", () => {
    let edits = setInlineEditField(EMPTY_DASHBOARD_INLINE_EDITS, "ai-summary", "  Saved  ");
    expect(edits["ai-summary"]).toBe("Saved");

    edits = setInlineEditField(edits, "ai-summary", "   ");
    expect(edits["ai-summary"]).toBeUndefined();
  });

  it("resolves inline text with override fallback to default", () => {
    const edits = { "ai-summary": "Custom summary" };
    expect(resolveInlineText(edits, "ai-summary", "Server summary")).toBe("Custom summary");
    expect(resolveInlineText(edits, "panel-note:health", "Default note")).toBe("Default note");
    expect(resolveInlineText({ "ai-summary": "" }, "ai-summary", "Server summary")).toBe(
      "Server summary",
    );
  });

  it("reads and writes edits via localStorage", () => {
    writeDashboardInlineEdits("founder", {
      "ai-summary": "Founder override",
      "panel-note:decisions": "Review Q3 bets",
    });
    expect(readDashboardInlineEdits("founder")).toEqual({
      "ai-summary": "Founder override",
      "panel-note:decisions": "Review Q3 bets",
    });
  });
});
