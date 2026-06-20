import { describe, expect, it } from "vitest";
import { HONEST_KPI_EMPTY } from "./honest-kpi";
import {
  buildCommandCentreAiSynthesisLine,
  buildCommandCentreKpis,
  type CommandCentreKpiInput,
} from "./command-centre-kpis";

const BASE_INPUT: CommandCentreKpiInput = {
  userRole: "team_member",
  activeProjectCount: 2,
  portfolioHealth: 82,
  successScoreValue: 76,
  alignmentDelta: 3,
  topProjectId: "proj-1",
  delivery: {
    tasksInProgress: 14,
    overdueTasks: 2,
    blockedTasks: 1,
    standupsThisWeek: 3,
  },
  approvalCounts: { total: 4, artifacts: 2, proposals: 2 },
  velocityTrend: 2,
  governanceOpenRisks: 5,
};

describe("command-centre-kpis", () => {
  it("caps KPIs at five for every role", () => {
    for (const role of ["executive", "pm", "team_member", "engineer", null] as const) {
      const kpis = buildCommandCentreKpis({ ...BASE_INPUT, userRole: role });
      expect(kpis.length, role ?? "default").toBeLessThanOrEqual(5);
    }
  });

  it("prioritises portfolio KPIs for executives", () => {
    const kpis = buildCommandCentreKpis({ ...BASE_INPUT, userRole: "executive" });
    expect(kpis.map((kpi) => kpi.label)).toEqual([
      "Portfolio health",
      "Active projects",
      "Pending approvals",
      "Success score",
      "Open risks",
    ]);
  });

  it("prioritises delivery execution KPIs for PMs", () => {
    const kpis = buildCommandCentreKpis({ ...BASE_INPUT, userRole: "pm" });
    expect(kpis.map((kpi) => kpi.label)).toEqual([
      "Blocked",
      "Overdue",
      "Pending approvals",
      "Tasks in progress",
      "Standups (7d)",
    ]);
  });

  it("shows honest empty state when no projects exist", () => {
    const kpis = buildCommandCentreKpis({
      ...BASE_INPUT,
      activeProjectCount: 0,
      userRole: "pm",
    });

    expect(kpis).toHaveLength(3);
    expect(kpis[0]?.value).toBe(HONEST_KPI_EMPTY);
    expect(kpis[0]?.hint).toBe("No data yet");
    expect(kpis[1]?.hint).toBe("Create a project to track work");
  });

  it("uses em-dash for standups before first log", () => {
    const kpis = buildCommandCentreKpis({
      ...BASE_INPUT,
      userRole: "pm",
      delivery: { ...BASE_INPUT.delivery, standupsThisWeek: 0 },
    });
    const standups = kpis.find((kpi) => kpi.label === "Standups (7d)");
    expect(standups?.value).toBe(HONEST_KPI_EMPTY);
    expect(standups?.hint).toBe("Updates after first standup");
  });
});

describe("buildCommandCentreAiSynthesisLine", () => {
  it("prompts project creation when workspace is empty", () => {
    expect(
      buildCommandCentreAiSynthesisLine({
        userRole: "pm",
        hasProjects: false,
        blockedTasks: 0,
        overdueTasks: 0,
        openRisks: 0,
        pendingApprovals: 0,
        projectName: null,
      }),
    ).toContain("Create a project");
  });

  it("returns role-specific guidance when projects exist", () => {
    expect(
      buildCommandCentreAiSynthesisLine({
        userRole: "executive",
        hasProjects: true,
        blockedTasks: 0,
        overdueTasks: 2,
        openRisks: 1,
        pendingApprovals: 0,
        projectName: "Atlas",
      }),
    ).toContain("Atlas");
    expect(
      buildCommandCentreAiSynthesisLine({
        userRole: "pm",
        hasProjects: true,
        blockedTasks: 2,
        overdueTasks: 0,
        openRisks: 0,
        pendingApprovals: 0,
        projectName: "Atlas",
      }),
    ).toContain("blockers");
  });
});
