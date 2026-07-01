import type { StandupTaskCard } from "@/components/tasks/standup-tasks-section";
import { selectStandupBatchTasks } from "@/lib/standup-tasks";
import { listUserMeetingSourcedTasks, type TaskWithMeta } from "@/services/delivery";

export function toStandupTaskCard(task: TaskWithMeta): StandupTaskCard {
  return {
    id: task.id,
    title: task.title,
    project_id: task.project_id,
    project_name: task.project_name,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
    source: task.source,
    source_id: task.source_id,
    created_at: task.created_at,
    meeting_title: task.meeting_title,
    meeting_ceremony_type: task.meeting_ceremony_type,
    meeting_scheduled_at: task.meeting_scheduled_at,
    meeting_has_transcript: task.meeting_has_transcript,
  };
}

/** Assignee's current standup batch, optionally scoped to a mission project. */
export async function loadPersonaStandupTasks(
  projectId?: string,
): Promise<StandupTaskCard[]> {
  const meetingTasks = await listUserMeetingSourcedTasks({
    projectId: projectId || undefined,
  }).catch(() => []);

  return selectStandupBatchTasks(meetingTasks).map(toStandupTaskCard);
}
