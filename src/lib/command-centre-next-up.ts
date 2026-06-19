/**
 * K3 — Command Centre next-up strip (deferred from K1).
 */

import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { buildMissionNextUpItems } from "@/lib/mission-next-up";
import type { NextUpItem } from "@/lib/next-up-items";

export type CommandCentreNextUpInput = {
  userRole: string | null;
  persona: MissionPersonaId | null;
  primaryProject: { id: string; name: string } | null;
  hasProjects: boolean;
  pendingReviews: (ArtifactReviewRow & { project_name?: string })[];
  approvalTotal: number;
  overdueTasks: number;
  blockedTasks: number;
  blockedTaskTitle?: string;
};

export function buildCommandCentreNextUpItems(
  input: CommandCentreNextUpInput,
  maxItems = 3,
): NextUpItem[] {
  if (input.persona) {
    return buildMissionNextUpItems({
      personaId: input.persona,
      primaryProject: input.primaryProject,
      hasProjects: input.hasProjects,
      pendingReviews: input.pendingReviews,
      blockedTasks: input.blockedTasks,
      blockedTaskTitle: input.blockedTaskTitle,
    }).slice(0, maxItems);
  }

  const items: NextUpItem[] = [];

  if (input.approvalTotal > 0) {
    items.push({
      id: "cc-approvals",
      label: `Review ${input.approvalTotal} pending approval${input.approvalTotal === 1 ? "" : "s"}`,
      detail: "AI outputs and proposals awaiting your decision.",
      href: "/workspace/proposals",
      tone: "amber",
      priority: 10,
    });
  }

  if (input.overdueTasks > 0) {
    items.push({
      id: "cc-overdue",
      label: `Clear ${input.overdueTasks} overdue task${input.overdueTasks === 1 ? "" : "s"}`,
      detail: "Tasks past due across active projects.",
      href: "/workspace/tasks",
      tone: "amber",
      priority: 20,
    });
  }

  if (input.blockedTasks > 0) {
    items.push({
      id: "cc-blocked",
      label: `Unblock ${input.blockedTasks} task${input.blockedTasks === 1 ? "" : "s"}`,
      detail: input.blockedTaskTitle ?? "Resolve blockers in the task inbox.",
      href: "/workspace/tasks",
      tone: "amber",
      priority: 30,
    });
  }

  if (items.length > 0) {
    return items.slice(0, maxItems);
  }

  if (!input.hasProjects) {
    const fallbacks: NextUpItem[] = [
      {
        id: "cc-new-project",
        label: "Create your first project",
        detail: "Start guided setup or upload a business case.",
        href: "/project/new",
        tone: "blue",
        priority: 100,
      },
      {
        id: "cc-tasks",
        label: "Open task inbox",
        detail: "See assigned work once projects are live.",
        href: "/workspace/tasks",
        tone: "slate",
        priority: 101,
      },
    ];
    return fallbacks.slice(0, maxItems);
  }

  const defaults: NextUpItem[] = [
    {
      id: "cc-tasks",
      label: "Review task inbox",
      detail: "Active work across your projects.",
      href: "/workspace/tasks",
      tone: "green",
      priority: 50,
    },
    {
      id: "cc-projects",
      label: "Browse projects",
      detail: "Open a project workspace for delivery detail.",
      href: "/workspace/projects",
      tone: "slate",
      priority: 51,
    },
  ];
  return defaults.slice(0, maxItems);
}
