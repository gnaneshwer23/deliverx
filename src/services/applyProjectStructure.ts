import { createWorkstream, createTask } from "@/services/delivery";
import { createRaidItem } from "@/services/governance";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";

export async function applyProjectStructure(
  projectId: string,
  draft: ProjectStructureDraft,
): Promise<{ workstreams: number; tasks: number; raidItems: number }> {
  const wsByName = new Map<string, string>();

  for (let i = 0; i < draft.workstreams.length; i++) {
    const ws = draft.workstreams[i];
    const row = await createWorkstream({
      projectId,
      name: ws.name,
      description: ws.description,
      status: ws.status,
      sortOrder: i,
    });
    wsByName.set(ws.name.trim().toLowerCase(), row.id);
  }

  const fallbackWsId = [...wsByName.values()][0];

  let taskCount = 0;
  for (const task of draft.tasks) {
    const wsId =
      wsByName.get(task.workstreamName.trim().toLowerCase()) ?? fallbackWsId;
    await createTask({
      projectId,
      workstreamId: wsId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
    });
    taskCount++;
  }

  let raidCount = 0;
  for (const item of draft.raidItems) {
    await createRaidItem({
      projectId,
      type: item.type,
      title: item.title,
      description: item.description,
      severity: item.severity,
    });
    raidCount++;
  }

  return {
    workstreams: draft.workstreams.length,
    tasks: taskCount,
    raidItems: raidCount,
  };
}
