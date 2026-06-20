import { describe, expect, it } from "vitest";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { TaskWithMeta } from "@/services/delivery";
import {
  buildPmBlockingYouSynthesis,
  buildPmControlRoomKpis,
  countCriticalRaidItems,
  countOverdueTasks,
} from "./pm-control-room-kpis";

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

const SAMPLE_RAID: PmMissionControl["raid"] = {
  risks: [
    { title: "Vendor delay", severity: "high", owner: "PM" },
    { title: "Scope creep", severity: "medium", owner: "BA" },
  ],
  issues: [{ title: "API outage", severity: "critical" }],
  dependencies: ["Third-party SSO"],
};

function task(overrides: Partial<TaskWithMeta> & Pick<TaskWithMeta, "id">): TaskWithMeta {
  return {
    id: overrides.id,
    project_id: "proj-1",
    title: "Task",
    status: "todo",
    due_date: null,
    assignee_id: null,
    project_name: "Atlas",
    workstream_name: null,
    ...overrides,
  } as TaskWithMeta;
}

describe("pm-control-room-kpis", () => {
  it("counts overdue open tasks with past due dates", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(
      countOverdueTasks([
        task({ id: "t1", due_date: yesterday.toISOString(), status: "in_progress" }),
        task({ id: "t2", due_date: yesterday.toISOString(), status: "done" }),
        task({ id: "t3", due_date: null, status: "todo" }),
      ]),
    ).toBe(1);
  });

  it("counts critical RAID risks and issues", () => {
    expect(countCriticalRaidItems(SAMPLE_RAID)).toBe(2);
  });

  it("builds five control-room KPIs with honest values and routes", () => {
    const kpis = buildPmControlRoomKpis({
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
    expect(kpis.find((kpi) => kpi.label === "Blocked")).toMatchObject({
      value: "3",
      href: "/project/proj-1/delivery",
    });
    expect(kpis.find((kpi) => kpi.label === "Approvals")).toMatchObject({
      value: "2",
      href: "/workspace/proposals?persona=pm-mission&project=proj-1",
    });
    expect(kpis.find((kpi) => kpi.label === "Team load")).toMatchObject({
      value: "78%",
      progressPct: 78,
    });
  });

  it("shows em-dash team load when capacity is unknown", () => {
    const kpis = buildPmControlRoomKpis({
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

  it("synthesises blocking-you line from live signals", () => {
    expect(
      buildPmBlockingYouSynthesis({
        projectName: "Atlas",
        blockedCount: 2,
        overdueCount: 1,
        pendingApprovals: 0,
        criticalRaidCount: 0,
        teamNeedsCount: 0,
      }),
    ).toContain("Atlas");
    expect(
      buildPmBlockingYouSynthesis({
        blockedCount: 0,
        overdueCount: 0,
        pendingApprovals: 0,
        criticalRaidCount: 0,
        teamNeedsCount: 0,
      }),
    ).toContain("Nothing urgent blocking you");
  });
});
