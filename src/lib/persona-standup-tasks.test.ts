import { describe, expect, it, vi, beforeEach } from "vitest";
import { loadPersonaStandupTasks, toStandupTaskCard } from "@/lib/persona-standup-tasks";
import type { TaskWithMeta } from "@/services/delivery";

vi.mock("@/services/delivery", () => ({
  listUserMeetingSourcedTasks: vi.fn(),
}));

import { listUserMeetingSourcedTasks } from "@/services/delivery";

const NOW = new Date("2026-07-01T12:00:00.000Z");

function meetingTask(
  patch: Partial<TaskWithMeta> = {},
): TaskWithMeta {
  return {
    id: "t1",
    organisation_id: "org-1",
    project_id: "p1",
    workstream_id: null,
    title: "Ship auth fix",
    description: null,
    status: "todo",
    priority: "medium",
    assignee_id: "u1",
    due_date: null,
    blocked_reason: null,
    completed_at: null,
    created_by: null,
    source: "meeting",
    source_id: "m1",
    created_at: "2026-07-01T10:00:00.000Z",
    updated_at: "2026-07-01T10:00:00.000Z",
    project_name: "DeliverX",
    workstream_name: null,
    meeting_title: "Daily standup",
    meeting_ceremony_type: "standup",
    meeting_scheduled_at: "2026-07-01T09:00:00.000Z",
    meeting_has_transcript: true,
    ...patch,
  };
}

describe("persona-standup-tasks", () => {
  beforeEach(() => {
    vi.mocked(listUserMeetingSourcedTasks).mockReset();
  });

  it("maps TaskWithMeta to StandupTaskCard", () => {
    const card = toStandupTaskCard(meetingTask({ id: "t9", title: "Review PR" }));
    expect(card.id).toBe("t9");
    expect(card.title).toBe("Review PR");
    expect(card.project_name).toBe("DeliverX");
    expect(card.meeting_ceremony_type).toBe("standup");
  });

  it("loads today's standup batch for the assignee", async () => {
    const today = meetingTask({ id: "today" });
    const retro = meetingTask({
      id: "retro",
      meeting_ceremony_type: "retro",
      source_id: "m2",
    });
    vi.mocked(listUserMeetingSourcedTasks).mockResolvedValue([today, retro]);

    const tasks = await loadPersonaStandupTasks(undefined);
    expect(listUserMeetingSourcedTasks).toHaveBeenCalledWith({ projectId: undefined });
    expect(tasks.map((t) => t.id)).toEqual(["today"]);
  });

  it("scopes standup tasks to the mission project", async () => {
    vi.mocked(listUserMeetingSourcedTasks).mockResolvedValue([
      meetingTask({ id: "scoped", project_id: "p9" }),
    ]);

    const tasks = await loadPersonaStandupTasks("p9");
    expect(listUserMeetingSourcedTasks).toHaveBeenCalledWith({ projectId: "p9" });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.project_id).toBe("p9");
  });

  it("returns empty array when the delivery query fails", async () => {
    vi.mocked(listUserMeetingSourcedTasks).mockRejectedValue(new Error("network"));

    await expect(loadPersonaStandupTasks()).resolves.toEqual([]);
  });

  it("falls back to the most recent standup batch when none are from today", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    const older = meetingTask({
      id: "older",
      source_id: "m-old",
      meeting_scheduled_at: "2026-06-25T09:00:00.000Z",
      created_at: "2026-06-25T10:00:00.000Z",
    });
    const recent = meetingTask({
      id: "recent",
      source_id: "m-recent",
      meeting_scheduled_at: "2026-06-30T09:00:00.000Z",
      created_at: "2026-06-30T10:00:00.000Z",
    });
    vi.mocked(listUserMeetingSourcedTasks).mockResolvedValue([older, recent]);

    const tasks = await loadPersonaStandupTasks();
    expect(tasks.map((t) => t.id)).toEqual(["recent"]);

    vi.useRealTimers();
  });
});
