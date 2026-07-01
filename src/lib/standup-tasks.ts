import type { TaskStatus } from "@/services/delivery";

export type StandupTaskRecord = {
  id: string;
  title: string;
  project_id: string;
  project_name?: string;
  status: TaskStatus | string;
  priority?: string;
  due_date?: string | null;
  source: string | null;
  source_id: string | null;
  created_at: string;
  meeting_title?: string | null;
  meeting_ceremony_type?: string | null;
  meeting_scheduled_at?: string | null;
  meeting_has_transcript?: boolean;
};

export function isMeetingSourcedTask(task: StandupTaskRecord): boolean {
  return task.source === "meeting" && Boolean(task.source_id);
}

export function isStandupCeremonyTask(task: StandupTaskRecord): boolean {
  return isMeetingSourcedTask(task) && task.meeting_ceremony_type === "standup";
}

export function meetingDisplayDate(task: StandupTaskRecord): Date | null {
  if (task.meeting_scheduled_at) return new Date(task.meeting_scheduled_at);
  if (task.created_at) return new Date(task.created_at);
  return null;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Prefer today's standup batch; otherwise the most recent approved standup meeting. */
export function selectStandupBatchTasks<T extends StandupTaskRecord>(
  tasks: T[],
  now = new Date(),
): T[] {
  const standup = tasks.filter(isStandupCeremonyTask);
  if (!standup.length) return [];

  const today = standup.filter((task) => {
    const displayDate = meetingDisplayDate(task);
    if (displayDate) return isSameCalendarDay(displayDate, now);
    return isSameCalendarDay(new Date(task.created_at), now);
  });
  if (today.length) return today;

  const byMeeting = new Map<string, T[]>();
  for (const task of standup) {
    const key = task.source_id!;
    const group = byMeeting.get(key) ?? [];
    group.push(task);
    byMeeting.set(key, group);
  }

  let latestMeetingId: string | null = null;
  let latestTime = -Infinity;
  for (const [meetingId, group] of byMeeting) {
    const sample = group[0]!;
    const displayDate = meetingDisplayDate(sample);
    const ts = displayDate?.getTime() ?? new Date(sample.created_at).getTime();
    if (ts > latestTime) {
      latestTime = ts;
      latestMeetingId = meetingId;
    }
  }

  return latestMeetingId ? (byMeeting.get(latestMeetingId) ?? []) : [];
}

export function partitionStandupFromKanban<T extends StandupTaskRecord>(
  allTasks: T[],
  standupBatch: T[],
): { standupTasks: T[]; kanbanTasks: T[] } {
  const standupIds = new Set(standupBatch.map((task) => task.id));
  return {
    standupTasks: standupBatch,
    kanbanTasks: allTasks.filter((task) => !standupIds.has(task.id)),
  };
}

export function filterByStandupSourceQuery<T extends StandupTaskRecord>(
  tasks: T[],
  sourceQuery: string | undefined,
): T[] {
  if (sourceQuery !== "standup") return tasks;
  return tasks.filter(isStandupCeremonyTask);
}

export function standupAttributionLabel(task: StandupTaskRecord): string {
  const displayDate = meetingDisplayDate(task);
  const dateStr = displayDate
    ? displayDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "recent standup";
  return `Added by PM · From daily standup ${dateStr}`;
}

export function meetingTranscriptUrl(projectId: string, meetingId: string | null): string {
  if (!meetingId) return `/project/${projectId}/meetings`;
  return `/project/${projectId}/meetings?meeting=${encodeURIComponent(meetingId)}`;
}
