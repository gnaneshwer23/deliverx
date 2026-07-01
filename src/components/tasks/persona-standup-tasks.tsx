import { loadPersonaStandupTasks } from "@/lib/persona-standup-tasks";
import { StandupTasksSection } from "@/components/tasks/standup-tasks-section";

type PersonaStandupTasksProps = {
  /** When set, only standup tasks for this project are shown. */
  projectId?: string;
};

/** Server wrapper: standup batch for the signed-in assignee on persona mission pages. */
export async function PersonaStandupTasks({ projectId }: PersonaStandupTasksProps) {
  const tasks = await loadPersonaStandupTasks(projectId);
  return <StandupTasksSection tasks={tasks} compact />;
}
