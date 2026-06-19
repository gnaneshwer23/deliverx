import { describe, expect, it } from "vitest";
import {
  buildBootstrapChecklistItems,
  buildBootstrapParityHighlights,
  hasBootstrapParitySummary,
} from "@/lib/bootstrap-checklist";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";

const SAMPLE_SUMMARY: ProjectBootstrapSummary = {
  structure: {
    workstreams: 4,
    tasks: 18,
    raidItems: 6,
    milestones: 3,
    stakeholders: 5,
    pendingApproval: true,
  },
  personas: {
    ba: { ok: true, counts: { requirements: 12, clarifications: 4 } },
    product: { ok: true, counts: { features: 8 } },
    pm: { ok: true, counts: { guidedTasks: 5, criticalRisks: 2 } },
    engineer: { ok: true, counts: { guidedTasks: 3 } },
    scrum: { ok: true },
    qa: { ok: true },
    founder: { ok: false, error: "Missing financial model" },
  },
  pendingArtifactReviews: 4,
  narrativeDemo: {
    seeded: true,
    threadCount: 3,
    impactEvents: 9,
  },
};

describe("bootstrap-checklist", () => {
  it("builds checklist items from bootstrap summary counts", () => {
    const items = buildBootstrapChecklistItems(SAMPLE_SUMMARY);

    expect(items.find((item) => item.id === "structure-tasks")).toMatchObject({
      count: 18,
      status: "pending",
    });
    expect(items.find((item) => item.id === "requirements")).toMatchObject({
      count: 12,
      status: "ready",
    });
    expect(items.find((item) => item.id === "artifact-reviews")).toMatchObject({
      count: 4,
      status: "pending",
      href: "/workspace/proposals",
    });
    expect(items.find((item) => item.id === "persona-workspaces")).toMatchObject({
      count: 6,
      status: "warning",
    });
    expect(items.find((item) => item.id === "narrative-threads")).toMatchObject({
      count: 3,
      status: "ready",
      detail: "9 impact events propagated",
    });
  });

  it("omits narrative thread row when demo seed disabled in options", () => {
    const items = buildBootstrapChecklistItems(SAMPLE_SUMMARY, { demoThreadsEnabled: false });
    expect(items.some((item) => item.id === "narrative-threads")).toBe(false);
  });

  it("builds compact parity highlights for mission banners", () => {
    const highlights = buildBootstrapParityHighlights(SAMPLE_SUMMARY);

    expect(highlights).toEqual(
      expect.arrayContaining([
        { label: "tasks", count: 18 },
        { label: "requirements", count: 12 },
        { label: "proposals to review", count: 4 },
      ]),
    );
    expect(highlights.length).toBeLessThanOrEqual(5);
  });

  it("detects when a summary has parity data", () => {
    expect(hasBootstrapParitySummary(SAMPLE_SUMMARY)).toBe(true);
    expect(hasBootstrapParitySummary({ personas: {} })).toBe(false);
    expect(hasBootstrapParitySummary(null)).toBe(false);
  });
});
