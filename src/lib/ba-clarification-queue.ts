/**
 * R5 — BA clarification queue (replaces generic collaborative loop for BA).
 */

import type { ClarificationRow } from "@/services/baRequirementEngine";

export type BaClarificationQueueItem = {
  id: string;
  question: string;
  stakeholder: string;
  priority: string;
  blocks: string | null;
  waitLabel: string;
  status: "Urgent" | "Waiting" | "Review";
  href?: string;
};

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function waitLabelFromDue(dueDate: string | null): string {
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return `Overdue ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

function statusForClarification(c: ClarificationRow): BaClarificationQueueItem["status"] {
  if (c.priority === "high" || c.blocks?.toLowerCase().includes("engineer")) return "Urgent";
  if (c.stakeholder_role) return "Review";
  return "Waiting";
}

export function buildBaClarificationQueue(
  clarifications: ClarificationRow[],
  projectId?: string,
): BaClarificationQueueItem[] {
  const href = projectId ? `/project/${projectId}/requirements?tab=clarifications` : undefined;

  return clarifications
    .filter((c) => c.status === "open")
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9),
    )
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      question: c.question,
      stakeholder: c.stakeholder_role ?? "Stakeholder",
      priority: c.priority,
      blocks: c.blocks,
      waitLabel: waitLabelFromDue(c.due_date),
      status: statusForClarification(c),
      href,
    }));
}
