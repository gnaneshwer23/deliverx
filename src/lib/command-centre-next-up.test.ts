import { describe, expect, it } from "vitest";
import { buildCommandCentreNextUpItems } from "./command-centre-next-up";

describe("command-centre-next-up", () => {
  it("delegates to persona next-up when role has a mission home", () => {
    const items = buildCommandCentreNextUpItems({
      userRole: "ba",
      persona: "ba",
      primaryProject: null,
      hasProjects: false,
      pendingReviews: [],
      approvalTotal: 0,
      overdueTasks: 0,
      blockedTasks: 0,
    });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.href).toBeTruthy();
  });

  it("surfaces approvals and overdue tasks for team members", () => {
    const items = buildCommandCentreNextUpItems({
      userRole: "team_member",
      persona: null,
      primaryProject: null,
      hasProjects: true,
      pendingReviews: [],
      approvalTotal: 2,
      overdueTasks: 3,
      blockedTasks: 0,
    });
    expect(items[0]?.id).toBe("cc-approvals");
    expect(items[1]?.id).toBe("cc-overdue");
  });

  it("falls back to onboarding CTAs when no projects exist", () => {
    const items = buildCommandCentreNextUpItems({
      userRole: "team_member",
      persona: null,
      primaryProject: null,
      hasProjects: false,
      pendingReviews: [],
      approvalTotal: 0,
      overdueTasks: 0,
      blockedTasks: 0,
    });
    expect(items[0]?.id).toBe("cc-new-project");
  });
});
