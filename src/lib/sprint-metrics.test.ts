import { describe, expect, it } from "vitest";
import {
  buildBurndownFromTasks,
  buildPmSprintCapacityRows,
  buildVelocityFromWorkstreams,
  collectSprintMemberIds,
  computeSprintPoints,
  deriveCeremoniesFromMeetings,
  resolveSprintScope,
  type SprintTaskSnapshot,
  type SprintWorkstreamSnapshot,
} from "./sprint-metrics";

const TASKS: SprintTaskSnapshot[] = [
  {
    id: "t1",
    status: "done",
    assignee_id: "u1",
    completed_at: "2026-06-20T12:00:00.000Z",
    created_at: "2026-06-18T10:00:00.000Z",
    workstream_id: "ws1",
  },
  {
    id: "t2",
    status: "done",
    assignee_id: "u1",
    completed_at: "2026-06-21T12:00:00.000Z",
    created_at: "2026-06-18T10:00:00.000Z",
    workstream_id: "ws1",
  },
  {
    id: "t3",
    status: "in_progress",
    assignee_id: "u2",
    completed_at: null,
    created_at: "2026-06-18T10:00:00.000Z",
    workstream_id: "ws1",
  },
  {
    id: "t4",
    status: "todo",
    assignee_id: "u2",
    completed_at: null,
    created_at: "2026-06-18T10:00:00.000Z",
    workstream_id: "ws1",
  },
];

const WORKSTREAMS: SprintWorkstreamSnapshot[] = [
  {
    id: "ws1",
    name: "Sprint 12",
    status: "active",
    owner_id: "u3",
    created_at: "2026-06-18T00:00:00.000Z",
    updated_at: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "ws0",
    name: "Sprint 11",
    status: "completed",
    owner_id: "u3",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-17T00:00:00.000Z",
  },
];

describe("sprint-metrics", () => {
  it("resolves active workstream as sprint scope", () => {
    const scope = resolveSprintScope({
      workstreams: WORKSTREAMS,
      tasks: TASKS,
      now: new Date("2026-06-22T12:00:00.000Z"),
    });

    expect(scope?.label).toBe("Sprint 12");
    expect(scope?.tasks).toHaveLength(4);
  });

  it("computes sprint points from task counts", () => {
    expect(computeSprintPoints(TASKS)).toEqual({
      plannedPoints: 4,
      completedPoints: 2,
    });
  });

  it("builds burndown from task completion history", () => {
    const scope = resolveSprintScope({
      workstreams: WORKSTREAMS,
      tasks: TASKS,
      now: new Date("2026-06-22T12:00:00.000Z"),
    });
    expect(scope).not.toBeNull();

    const points = buildBurndownFromTasks({
      tasks: scope!.tasks,
      startDate: scope!.startDate,
      sprintDays: scope!.sprintDays,
      now: new Date("2026-06-22T12:00:00.000Z"),
    });

    expect(points.length).toBeGreaterThan(0);
    expect(points[points.length - 1]?.remaining).toBe(2);
  });

  it("builds velocity from completed workstreams", () => {
    const completedTasks: SprintTaskSnapshot[] = [
      {
        id: "old1",
        status: "done",
        assignee_id: "u1",
        completed_at: "2026-06-10T12:00:00.000Z",
        created_at: "2026-06-01T00:00:00.000Z",
        workstream_id: "ws0",
      },
      ...TASKS,
    ];

    const velocity = buildVelocityFromWorkstreams({
      workstreams: WORKSTREAMS,
      tasks: completedTasks,
    });

    expect(velocity.some((v) => v.sprint === "Sprint 11")).toBe(true);
  });

  it("collects sprint member ids from assignees and owner", () => {
    const scope = resolveSprintScope({
      workstreams: WORKSTREAMS,
      tasks: TASKS,
      now: new Date("2026-06-22T12:00:00.000Z"),
    });
    expect(scope).not.toBeNull();

    const ids = collectSprintMemberIds(scope!);
    expect(ids).toContain("u1");
    expect(ids).toContain("u2");
    expect(ids).toContain("u3");
  });

  it("builds PM sprint capacity without placeholder rows", () => {
    const scope = resolveSprintScope({
      workstreams: WORKSTREAMS,
      tasks: TASKS,
      now: new Date("2026-06-22T12:00:00.000Z"),
    });

    const { members, avgLoadPct } = buildPmSprintCapacityRows({
      scope,
      members: [
        { id: "u1", name: "Alex", email: null, role: "engineer" },
        { id: "u2", name: "Sam", email: null, role: "qa" },
        { id: "u3", name: "Jordan", email: null, role: "scrum_master" },
      ],
    });

    expect(members.every((m) => !m.placeholder)).toBe(true);
    expect(avgLoadPct).not.toBeNull();
    expect(members.find((m) => m.id === "u2")?.assignedCount).toBe(2);
  });

  it("returns empty capacity when no sprint assignees", () => {
    const scope = resolveSprintScope({
      workstreams: WORKSTREAMS,
      tasks: TASKS.map((t) => ({ ...t, assignee_id: null })),
      now: new Date("2026-06-22T12:00:00.000Z"),
    });

    const { members, avgLoadPct } = buildPmSprintCapacityRows({
      scope,
      members: [{ id: "u1", name: "Alex", email: null, role: "engineer" }],
    });

    expect(members).toHaveLength(0);
    expect(avgLoadPct).toBeNull();
  });

  it("maps meeting titles to ceremonies", () => {
    const ceremonies = deriveCeremoniesFromMeetings([
      { title: "Sprint 12 planning", scheduled_at: "2026-06-18T09:00:00.000Z" },
      { title: "Daily standup", scheduled_at: "2026-06-22T09:00:00.000Z" },
    ]);

    expect(ceremonies).toContain("Sprint Planning");
    expect(ceremonies).toContain("Daily Standup");
  });
});
