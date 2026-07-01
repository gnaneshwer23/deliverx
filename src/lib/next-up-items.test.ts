import { describe, expect, it } from "vitest";
import { buildNextUpItems, listPersonaNextUpFallbacks } from "@/lib/next-up-items";

describe("next-up-items", () => {
  it("prioritises clarifications for BA over pending reviews", () => {
    const items = buildNextUpItems("ba", {
      hasProject: true,
      openClarifications: 4,
      pendingReviews: { count: 2, topTitle: "FR-012 scope" },
    });

    expect(items[0]?.id).toBe("clarifications");
    expect(items).toHaveLength(2);
  });

  it("surfaces blocked tasks before decisions for PM", () => {
    const items = buildNextUpItems("pm-mission", {
      hasProject: true,
      blockedTasks: { count: 3, topTitle: "Auth API dependency" },
      openDecisions: { count: 2, topTitle: "Scope change" },
    });

    expect(items[0]?.id).toBe("blocked-tasks");
    expect(items[1]?.id).toBe("open-decisions");
  });

  it("surfaces pending role invites for PM mission control", () => {
    const items = buildNextUpItems(
      "pm-mission",
      {
        hasProject: true,
        pendingRoleInvites: { count: 4, needsLinkCount: 4 },
      },
      "proj-1",
    );

    expect(items[0]?.id).toBe("pending-role-invites");
    expect(items[0]?.label).toContain("4 roles need invite links");
    expect(items[0]?.href).toBe("/workspace/pm-mission?project=proj-1#pm-role-invites");
  });

  it("shows impediments first for Scrum", () => {
    const items = buildNextUpItems("scrum", {
      hasProject: true,
      impediments: { count: 2, topTitle: "Test environment" },
      pendingReviews: { count: 1, topTitle: "Sprint story" },
    });

    expect(items[0]?.id).toBe("impediments");
  });

  it("shows critical defects first for QA", () => {
    const items = buildNextUpItems("qa", {
      hasProject: true,
      criticalDefects: 2,
      pendingReviews: { count: 5, topTitle: "Test case batch" },
    });

    expect(items[0]?.id).toBe("critical-defects");
  });

  it("uses persona fallbacks when no project and no signals", () => {
    const items = buildNextUpItems("engineer", { hasProject: false });
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(3);
    expect(items[0]?.href).toMatch(/^\/(workspace|project)/);
    expect(listPersonaNextUpFallbacks("engineer")).toBeGreaterThan(0);
  });

  it("caps output at three items", () => {
    const items = buildNextUpItems("founder", {
      hasProject: true,
      openDecisions: { count: 4, topTitle: "Budget approval" },
      pendingReviews: { count: 3, topTitle: "Portfolio report" },
      blockedTasks: { count: 2, topTitle: "Vendor contract" },
    });

    expect(items).toHaveLength(3);
  });

  it("links pending reviews to proposals with persona filter", () => {
    const items = buildNextUpItems("product", {
      hasProject: true,
      pendingReviews: { count: 1, topTitle: "RICE backlog" },
    });

    expect(items[0]?.href).toBe("/workspace/proposals?persona=product");
  });
});
