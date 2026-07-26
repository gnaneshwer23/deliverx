import { describe, expect, it } from "vitest";
import {
  HELP_ARTICLES,
  SEARCH_CATALOGUE,
  SEARCH_DESTINATIONS,
} from "@/lib/global-search/catalogue";
import {
  clampSearchIndex,
  filterCatalogue,
  moveSearchIndex,
} from "@/lib/global-search/filter";
import { isGlobalSearchEnabled } from "@/lib/global-search/flag";
import { searchOwnResources } from "@/lib/global-search/search-own";

describe("global-search catalogue", () => {
  it("lists destinations without an Insights product Home", () => {
    expect(SEARCH_DESTINATIONS.length).toBeGreaterThanOrEqual(12);
    const blob = SEARCH_DESTINATIONS.map((d) => `${d.id} ${d.title} ${d.href}`).join(" ");
    expect(blob.toLowerCase()).not.toMatch(/\binsights\b/);
    expect(SEARCH_DESTINATIONS.some((d) => d.href === "/help")).toBe(true);
    expect(SEARCH_DESTINATIONS.some((d) => d.href === "/profile")).toBe(true);
    expect(SEARCH_DESTINATIONS.some((d) => d.href === "/experience/app")).toBe(true);
  });

  it("includes calm help articles that route into existing surfaces", () => {
    expect(HELP_ARTICLES.length).toBeGreaterThanOrEqual(5);
    for (const article of HELP_ARTICLES) {
      expect(article.kind).toBe("help");
      expect(article.href.startsWith("/help")).toBe(true);
    }
  });
});

describe("filterCatalogue", () => {
  it("returns all items for an empty query", () => {
    expect(filterCatalogue(SEARCH_CATALOGUE, "  ")).toHaveLength(SEARCH_CATALOGUE.length);
  });

  it("matches title, description, and keywords", () => {
    const byTitle = filterCatalogue(SEARCH_CATALOGUE, "Evidence Ledger");
    expect(byTitle.some((h) => h.id === "dest-evidence")).toBe(true);

    const byKeyword = filterCatalogue(SEARCH_CATALOGUE, "attestation");
    expect(byKeyword.some((h) => h.id === "help-verified")).toBe(true);

    const byMulti = filterCatalogue(SEARCH_CATALOGUE, "observation consent");
    expect(byMulti.some((h) => h.id === "help-consent")).toBe(true);
  });

  it("is case-insensitive and ignores unknown tokens", () => {
    const hits = filterCatalogue(SEARCH_CATALOGUE, "LAUNCHPAD");
    expect(hits.some((h) => h.href === "/launchpad/app")).toBe(true);
    expect(filterCatalogue(SEARCH_CATALOGUE, "zzz-not-a-real-destination")).toEqual([]);
  });
});

describe("moveSearchIndex / clampSearchIndex", () => {
  it("wraps arrow navigation", () => {
    expect(moveSearchIndex(0, "ArrowDown", 3)).toBe(1);
    expect(moveSearchIndex(2, "ArrowDown", 3)).toBe(0);
    expect(moveSearchIndex(0, "ArrowUp", 3)).toBe(2);
    expect(moveSearchIndex(1, "ArrowUp", 3)).toBe(0);
  });

  it("handles empty lists safely", () => {
    expect(moveSearchIndex(0, "ArrowDown", 0)).toBe(0);
    expect(clampSearchIndex(5, 0)).toBe(0);
    expect(clampSearchIndex(5, 3)).toBe(2);
    expect(clampSearchIndex(-1, 3)).toBe(0);
  });
});

describe("isGlobalSearchEnabled", () => {
  it("defaults on and kills on off/0/false/disabled", () => {
    expect(isGlobalSearchEnabled({})).toBe(true);
    expect(isGlobalSearchEnabled({ DELIVERX_GLOBAL_SEARCH: "on" })).toBe(true);
    expect(isGlobalSearchEnabled({ DELIVERX_GLOBAL_SEARCH: "off" })).toBe(false);
    expect(isGlobalSearchEnabled({ DELIVERX_GLOBAL_SEARCH: "0" })).toBe(false);
    expect(isGlobalSearchEnabled({ DELIVERX_GLOBAL_SEARCH: "false" })).toBe(false);
    expect(isGlobalSearchEnabled({ DELIVERX_GLOBAL_SEARCH: "disabled" })).toBe(false);
  });
});

type FakeRow = Record<string, unknown> & { user_id?: string; created_by?: string };

function createScopedFakeClient(rowsByTable: Record<string, FakeRow[]>) {
  const calls: { table: string; filters: Array<{ column: string; value: string }> }[] = [];

  return {
    calls,
    client: {
      from(table: string) {
        const state = {
          filters: [] as Array<{ column: string; value: string }>,
          pattern: "",
        };
        const api = {
          select() {
            return api;
          },
          eq(column: string, value: string) {
            state.filters.push({ column, value });
            return api;
          },
          or() {
            return api;
          },
          ilike() {
            return api;
          },
          order() {
            return api;
          },
          limit() {
            calls.push({ table, filters: [...state.filters] });
            const rows = (rowsByTable[table] ?? []).filter((row) =>
              state.filters.every((f) => {
                const cell = row[f.column];
                return cell === f.value;
              }),
            );
            return Promise.resolve({ data: rows, error: null });
          },
        };
        return api;
      },
    },
  };
}

describe("searchOwnResources — self-only", () => {
  it("rejects empty userId", async () => {
    const { client } = createScopedFakeClient({});
    await expect(
      searchOwnResources(client as never, "  ", "evidence"),
    ).rejects.toThrow(/userId is required/);
  });

  it("scopes every table query to the authenticated user and excludes other users", async () => {
    const self = "user-self";
    const other = "user-other";
    const { client, calls } = createScopedFakeClient({
      pi_evidence_records: [
        { id: "e1", user_id: self, title: "My evidence", summary: "ok", category: "work" },
        { id: "e2", user_id: other, title: "Other evidence", summary: "secret", category: "work" },
      ],
      projects: [
        { id: "p1", created_by: self, name: "My project", status: "active" },
        { id: "p2", created_by: other, name: "Other project", status: "active" },
      ],
      artefacts: [
        { id: "a1", user_id: self, title: "My artefact", kind: "doc" },
        { id: "a2", user_id: other, title: "Other artefact", kind: "doc" },
      ],
      xperience_enrolments: [
        { id: "x1", user_id: self, company_name: "NovaDesk", status: "active", day: 1 },
        { id: "x2", user_id: other, company_name: "OtherCo", status: "active", day: 2 },
      ],
    });

    const hits = await searchOwnResources(client as never, self, "my");

    expect(calls).toHaveLength(4);
    for (const call of calls) {
      const ownerFilter = call.filters.find(
        (f) => f.column === "user_id" || f.column === "created_by",
      );
      expect(ownerFilter?.value).toBe(self);
    }

    expect(hits.every((h) => !h.id.includes("other") && !h.title.toLowerCase().includes("other"))).toBe(
      true,
    );
    expect(hits.some((h) => h.id === "evidence-e1")).toBe(true);
    expect(hits.some((h) => h.id === "evidence-e2")).toBe(false);
    expect(hits.some((h) => h.id === "project-p2")).toBe(false);
    expect(hits.some((h) => h.id === "artefact-a2")).toBe(false);
    expect(hits.some((h) => h.id === "enrolment-x2")).toBe(false);
  });
});
