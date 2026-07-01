import { describe, expect, it } from "vitest";
import {
  filterByStandupSourceQuery,
  isMeetingSourcedTask,
  isStandupCeremonyTask,
  partitionStandupFromKanban,
  selectStandupBatchTasks,
  standupAttributionLabel,
} from "@/lib/standup-tasks";

const NOW = new Date("2026-07-01T12:00:00.000Z");

function task(
  patch: Partial<{
    id: string;
    title: string;
    project_id: string;
    status: string;
    source: string | null;
    source_id: string | null;
    created_at: string;
    meeting_ceremony_type: string | null;
    meeting_scheduled_at: string | null;
  }> = {},
) {
  return {
    id: "t1",
    title: "Update auth API",
    project_id: "p1",
    status: "todo",
    source: "meeting",
    source_id: "m1",
    created_at: "2026-07-01T10:00:00.000Z",
    meeting_ceremony_type: "standup",
    meeting_scheduled_at: "2026-07-01T09:00:00.000Z",
    ...patch,
  };
}

describe("standup-tasks", () => {
  it("detects meeting-sourced and standup ceremony tasks", () => {
    expect(isMeetingSourcedTask(task())).toBe(true);
    expect(isStandupCeremonyTask(task())).toBe(true);
    expect(isStandupCeremonyTask(task({ meeting_ceremony_type: "retro" }))).toBe(false);
    expect(isMeetingSourcedTask(task({ source: null, source_id: null }))).toBe(false);
  });

  it("selects today's standup batch first", () => {
    const todayTask = task({ id: "today", meeting_scheduled_at: "2026-07-01T09:00:00.000Z" });
    const olderTask = task({
      id: "older",
      source_id: "m2",
      meeting_scheduled_at: "2026-06-28T09:00:00.000Z",
      created_at: "2026-06-28T10:00:00.000Z",
    });

    const batch = selectStandupBatchTasks([olderTask, todayTask], NOW);
    expect(batch.map((t) => t.id)).toEqual(["today"]);
  });

  it("falls back to the most recent standup meeting batch", () => {
    const older = task({
      id: "older",
      source_id: "m-old",
      meeting_scheduled_at: "2026-06-25T09:00:00.000Z",
      created_at: "2026-06-25T10:00:00.000Z",
    });
    const recentA = task({
      id: "a1",
      source_id: "m-recent",
      meeting_scheduled_at: "2026-06-30T09:00:00.000Z",
      created_at: "2026-06-30T10:00:00.000Z",
    });
    const recentB = task({
      id: "a2",
      source_id: "m-recent",
      title: "Second action",
      meeting_scheduled_at: "2026-06-30T09:00:00.000Z",
      created_at: "2026-06-30T10:05:00.000Z",
    });

    const batch = selectStandupBatchTasks([older, recentA, recentB], NOW);
    expect(batch.map((t) => t.id).sort()).toEqual(["a1", "a2"]);
  });

  it("partitions standup tasks out of the kanban board", () => {
    const standupTask = task({ id: "s1" });
    const regular = task({
      id: "r1",
      source: null,
      source_id: null,
      meeting_ceremony_type: null,
    });
    const { standupTasks, kanbanTasks } = partitionStandupFromKanban(
      [standupTask, regular],
      [standupTask],
    );
    expect(standupTasks).toHaveLength(1);
    expect(kanbanTasks.map((t) => t.id)).toEqual(["r1"]);
  });

  it("filters by ?source=standup query", () => {
    const standupTask = task();
    const retro = task({ meeting_ceremony_type: "retro" });
    const manual = task({ source: null, source_id: null, meeting_ceremony_type: null });

    expect(filterByStandupSourceQuery([standupTask, retro, manual], "standup")).toHaveLength(1);
    expect(filterByStandupSourceQuery([standupTask, retro], undefined)).toHaveLength(2);
  });

  it("formats standup attribution copy", () => {
    const label = standupAttributionLabel(task());
    expect(label).toContain("Added by PM");
    expect(label).toContain("From daily standup");
  });
});
