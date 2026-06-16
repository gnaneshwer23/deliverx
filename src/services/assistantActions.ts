import { generateJSON } from "@/lib/ai/anthropic";
import { requireAuth } from "@/lib/api/auth";
import { createTask } from "@/services/delivery";
import { createRaidItem, type RaidItemType, type RaidSeverity } from "@/services/governance";
import type { ChatMessage } from "@/services/assistant";

export type ProposedAction =
  | {
      id: string;
      type: "create_raid";
      projectId: string;
      title: string;
      description?: string;
      raidType?: RaidItemType;
      severity?: RaidSeverity;
      summary: string;
    }
  | {
      id: string;
      type: "create_task";
      projectId: string;
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high" | "critical";
      summary: string;
    };

type RawProposal = {
  actions?: Array<{
    type?: string;
    title?: string;
    description?: string;
    raidType?: string;
    severity?: string;
    priority?: string;
    summary?: string;
  }>;
};

export async function proposeAssistantActions(
  messages: ChatMessage[],
  projectId: string,
  assistantReply: string,
): Promise<ProposedAction[]> {
  if (!projectId) return [];

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const lower = `${lastUser} ${assistantReply}`.toLowerCase();
  const actionSignals = ["create", "add", "log", "register", "raise", "new risk", "new task"];
  if (!actionSignals.some((s) => lower.includes(s))) {
    return [];
  }

  const raw = await generateJSON<RawProposal>({
    system: `You extract concrete workspace actions from a delivery assistant conversation.
Return JSON: { "actions": [ ... ] }
Each action must be one of:
- create_raid: { type, title, description?, raidType?: risk|issue|assumption|dependency, severity?: low|medium|high|critical, summary }
- create_task: { type, title, description?, priority?: low|medium|high|critical, summary }
Only propose actions the user clearly requested. Max 3 actions. If none, return { "actions": [] }.`,
    prompt: `Project ID: ${projectId}
User: ${lastUser}
Assistant: ${assistantReply}

Extract actionable items to create in the workspace.`,
    maxTokens: 1024,
  });

  const actions = raw.actions ?? [];
  return actions
    .map((a, i) => normalizeAction(a, projectId, i))
    .filter((a): a is ProposedAction => a !== null)
    .slice(0, 3);
}

function normalizeAction(
  raw: NonNullable<RawProposal["actions"]>[number],
  projectId: string,
  index: number,
): ProposedAction | null {
  const title = raw.title?.trim();
  if (!title) return null;
  const id = `action-${index}-${Date.now()}`;
  const summary = raw.summary?.trim() || title;

  if (raw.type === "create_raid") {
    const raidType = (["risk", "issue", "assumption", "dependency"] as const).includes(
      raw.raidType as RaidItemType,
    )
      ? (raw.raidType as RaidItemType)
      : "risk";
    const severity = (["low", "medium", "high", "critical"] as const).includes(
      raw.severity as RaidSeverity,
    )
      ? (raw.severity as RaidSeverity)
      : "medium";
    return {
      id,
      type: "create_raid",
      projectId,
      title,
      description: raw.description?.trim(),
      raidType,
      severity,
      summary,
    };
  }

  if (raw.type === "create_task") {
    const pri = raw.priority as "low" | "medium" | "high" | "critical";
    const priority = (["low", "medium", "high", "critical"] as const).includes(pri)
      ? pri
      : "medium";
    return {
      id,
      type: "create_task",
      projectId,
      title,
      description: raw.description?.trim(),
      priority,
      summary,
    };
  }

  return null;
}

export async function applyAssistantAction(
  action: ProposedAction,
): Promise<{ entityType: string; entityId: string }> {
  await requireAuth();

  if (action.type === "create_raid") {
    const row = await createRaidItem({
      projectId: action.projectId,
      type: action.raidType ?? "risk",
      title: action.title,
      description: action.description,
      severity: action.severity ?? "medium",
    });
    return { entityType: "raid", entityId: row.id };
  }

  const row = await createTask({
    projectId: action.projectId,
    title: action.title,
    description: action.description,
    priority: action.priority ?? "medium",
  });
  return { entityType: "task", entityId: row.id };
}
