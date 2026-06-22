import { describe, expect, it } from "vitest";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { StakeholderActionRow } from "@/services/deliveryPmEngine";
import type { TaskWithMeta } from "@/services/delivery";
import {
  buildPmAttentionFeed,
  buildPmSteadyStateKpis,
  buildPmSteadyStateSubtitle,
  buildPmTeamCapacityRows,
  dueLabelToWaitDays,
} from "./pm-steady-state-panels";

const SAMPLE_OVERVIEW: PmMissionControl["overview"] = {
  healthTier: "watch",
  healthScore: 68,
  timelineComplete: 62,
  budgetLabel: "£120k / £200k",
  criticalRisks: 2,
  openDecisions: 1,
  blockedDependencies: 3,
  benefitsDeliveredPct: 45,
  goLiveProbability: 0.72,
};

function action(overrides: Partial<StakeholderActionRow> & Pick<StakeholderActionRow, "id">): StakeholderActionRow {
  return {
    stakeholder: "Sponsor",
    action: "Decide: Budget approval",
    priority: "high",
    dueLabel: "Today",
    tone: "amber",
    ...overrides,
  };
}

const SAMPLE_RAID: PmMissionControl["raid"] = {
  risks: [{ title: "Vendor delay", severity: "high", owner: "PM" }],
  issues: [{ title: "API outage", severity: "critical" }],
  dependencies: [],
};

describe("pm-steady-state-panels", () => {
  it("maps due labels to wait days for sorting", () => {
    expect(dueLabelToWaitDays("Today", "high")).toBe(0);
    expect(dueLabelToWaitDays("This week", "medium")).toBe(3);
    expect(dueLabelToWaitDays("Before sprint planning", "low")).toBe(5);
  });

  it("builds attention feed sorted by wait age with pills and roles", () => {
    const feed = buildPmAttentionFeed({
      stakeholderActionQueue: [
        action({ id: "a1", dueLabel: "This week", priority: "medium", action: "Clarify scope" }),
        action({ id: "a2", dueLabel: "Today", priority: "high", tone: "red", stakeholder: "Engineering", action: "Unblock API work" }),
      ],
      decisions: [{ title: "Vendor selection", status: "proposed", impact: "High" }],
      blockedDependencies: 2,
      projectId: "proj-1",
    });

    expect(feed.length).toBeGreaterThanOrEqual(3);
    expect(feed[0]?.waitSortDays).toBeLessThanOrEqual(feed[1]?.waitSortDays ?? 99);
    expect(feed.some((item) => item.pills.some((pill) => pill.label === "Urgent"))).toBe(true);
    expect(feed.some((item) => item.role === "Sponsor")).toBe(true);
    expect(feed.find((item) => item.id === "pending-reviews-feed")).toBeFalsy();
  });

  it("includes pending reviews when explicitly requested", () => {
    const feed = buildPmAttentionFeed({
      stakeholderActionQueue: [],
      decisions: [],
      blockedDependencies: 0,
      projectId: "proj-1",
      pendingReviewCount: 2,
      includePendingReviews: true,
    });

    expect(feed.find((item) => item.id === "pending-reviews-feed")).toBeTruthy();
  });

  it("deduplicates stakeholder queue items already in feed", () => {
    const feed = buildPmAttentionFeed({
      stakeholderActionQueue: [
        action({ id: "blocked-tasks", stakeholder: "Engineering", action: "Unblock 2 delivery tasks", dueLabel: "Today" }),
      ],
      decisions: [],
      blockedDependencies: 2,
    });

    const blockedItems = feed.filter((item) => item.title.toLowerCase().includes("block"));
    expect(blockedItems).toHaveLength(1);
  });

  it("builds five control-room KPIs from overview and capacity", () => {
    const kpis = buildPmSteadyStateKpis({
      overview: SAMPLE_OVERVIEW,
      raid: SAMPLE_RAID,
      pendingApprovalCount: 2,
      teamCapacityPct: 78,
      tasks: [],
      projectId: "proj-1",
    });

    expect(kpis).toHaveLength(5);
    expect(kpis.map((kpi) => kpi.label)).toEqual([
      "Blocked",
      "Overdue",
      "Approvals",
      "RAID critical",
      "Team load",
    ]);
    expect(kpis.find((kpi) => kpi.label === "Blocked")?.value).toBe("3");
    expect(kpis.find((kpi) => kpi.label === "Team load")?.value).toBe("78%");
    expect(kpis.find((kpi) => kpi.label === "Team load")?.progressPct).toBe(78);
  });

  it("shows honest empty capacity when no sprint assignees", () => {
    const { members, avgLoadPct } = buildPmTeamCapacityRows({
      tasks: [
        { id: "t1", assignee_id: null, status: "todo" } as TaskWithMeta,
      ],
      members: [
        { id: "u1", name: "Alex", email: null, role: "engineer" },
        { id: "u2", name: "Sam", email: null, role: "pm" },
      ],
    });

    expect(avgLoadPct).toBeNull();
    expect(members).toHaveLength(0);
  });

  it("derives team load from assigned active tasks", () => {
    const { members, avgLoadPct } = buildPmTeamCapacityRows({
      tasks: [
        { id: "t1", assignee_id: "u1", status: "in_progress" } as TaskWithMeta,
        { id: "t2", assignee_id: "u1", status: "blocked" } as TaskWithMeta,
        { id: "t3", assignee_id: "u2", status: "todo" } as TaskWithMeta,
        { id: "t4", assignee_id: "u2", status: "done" } as TaskWithMeta,
      ],
      members: [
        { id: "u1", name: "Alex", email: null, role: "engineer" },
        { id: "u2", name: "Sam", email: null, role: "pm" },
      ],
    });

    expect(avgLoadPct).not.toBeNull();
    expect(members.find((m) => m.id === "u1")?.assignedCount).toBe(2);
    expect(members.find((m) => m.id === "u2")?.assignedCount).toBe(1);
  });

  it("shows em-dash team load when no assignees", () => {
    const kpis = buildPmSteadyStateKpis({
      overview: SAMPLE_OVERVIEW,
      raid: SAMPLE_RAID,
      pendingApprovalCount: 0,
      teamCapacityPct: null,
      tasks: [],
    });

    expect(kpis.find((kpi) => kpi.label === "Team load")).toMatchObject({
      value: "—",
      hint: "Assign tasks to see team load",
    });
  });

  it("builds steady-state subtitle from project and counts", () => {
    expect(
      buildPmSteadyStateSubtitle({
        projectName: "Atlas",
        waitingOnYouCount: 2,
        blockerCount: 1,
        openDecisions: 0,
      }),
    ).toContain("Atlas");
    expect(
      buildPmSteadyStateSubtitle({
        waitingOnYouCount: 0,
        blockerCount: 0,
        openDecisions: 0,
      }),
    ).toContain("steady-state");
  });
});
