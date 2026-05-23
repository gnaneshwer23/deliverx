import { createWorkstream, createTask } from "@/services/delivery";
import { createRaidItem, createDecision, createChangeRequest } from "@/services/governance";
import { createStakeholder } from "@/services/traceability";
import { createMilestone } from "@/services/milestones";
import { createBenefit } from "@/services/benefits";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";

export async function applyProjectStructure(
  projectId: string,
  draft: ProjectStructureDraft,
): Promise<{
  workstreams: number;
  tasks: number;
  raidItems: number;
  milestones: number;
  stakeholders: number;
  decisions: number;
  changes: number;
  benefits: number;
}> {
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

  let milestoneCount = 0;
  for (const m of draft.milestones) {
    try {
      await createMilestone({
        projectId,
        title: m.title,
        description: m.description,
        targetDate: m.targetDate ?? undefined,
        confidenceScore: m.confidenceScore ?? 80,
      });
      milestoneCount++;
    } catch {
      /* migration may not be applied */
    }
  }

  let stakeholderCount = 0;
  for (const s of draft.stakeholders) {
    try {
      await createStakeholder({
        projectId,
        name: s.name,
        roleLabel: s.roleLabel,
        influence: s.influence,
        interest: s.interest,
      });
      stakeholderCount++;
    } catch {
      /* skip */
    }
  }

  let decisionCount = 0;
  for (const d of draft.decisions) {
    try {
      await createDecision({
        projectId,
        title: d.title,
        context: d.context,
        status: "proposed",
      });
      decisionCount++;
    } catch {
      /* skip */
    }
  }

  let changeCount = 0;
  for (const c of draft.changeRequests) {
    try {
      await createChangeRequest({
        projectId,
        title: c.title,
        description: c.description,
        status: "draft",
      });
      changeCount++;
    } catch {
      /* skip */
    }
  }

  let benefitCount = 0;
  for (const b of draft.benefits) {
    try {
      await createBenefit({
        projectId,
        title: b.title,
        kpiName: b.kpiName,
        baselineValue: b.baselineValue ?? undefined,
        targetValue: b.targetValue ?? undefined,
        unit: b.unit,
      });
      benefitCount++;
    } catch {
      /* skip */
    }
  }

  return {
    workstreams: draft.workstreams.length,
    tasks: taskCount,
    raidItems: raidCount,
    milestones: milestoneCount,
    stakeholders: stakeholderCount,
    decisions: decisionCount,
    changes: changeCount,
    benefits: benefitCount,
  };
}
