import type { PmDayOneKpi } from "@/lib/pm-day-one-panels";
import { buildPmControlRoomKpis } from "@/lib/pm-control-room-kpis";
import type { TaskWithMeta } from "@/services/delivery";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { StakeholderActionRow } from "@/services/deliveryPmEngine";

export type PmAttentionPill = {
  label: "Urgent" | "Decide" | "Clear";
  tone: "urgent" | "decide" | "clear";
};

export type PmAttentionItem = {
  id: string;
  avatarInitials: string;
  role: string;
  title: string;
  subtitle?: string;
  pills: PmAttentionPill[];
  waitLabel: string;
  waitSortDays: number;
  href?: string;
  escalateHref?: string;
};

export type PmTeamCapacityMember = {
  id: string;
  name: string;
  role: string;
  assignedCount: number;
  loadPct: number;
  tone: "healthy" | "watch" | "at-risk";
  placeholder?: boolean;
};

export type PmGovernanceTabId = "risks" | "decisions" | "changes" | "approvals";

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "PM").toUpperCase();
}

/** Map due labels to approximate wait days for attention-feed sorting. */
export function dueLabelToWaitDays(dueLabel: string, priority: string): number {
  const label = dueLabel.trim().toLowerCase();
  if (label.includes("today") || label.includes("now")) return 0;
  if (label.includes("this week")) return 3;
  if (label.includes("sprint")) return 5;
  if (label.includes("friday")) return 4;
  if (priority === "high") return 2;
  if (priority === "medium") return 5;
  return 7;
}

function waitLabelFromDays(days: number): string {
  if (days <= 0) return "Waiting today";
  if (days === 1) return "Waiting 1 day";
  return `Waiting ${days} days`;
}

function pillsForAction(action: StakeholderActionRow): PmAttentionPill[] {
  const pills: PmAttentionPill[] = [];
  if (action.tone === "red" || action.priority === "high") {
    pills.push({ label: "Urgent", tone: "urgent" });
  }
  if (action.action.toLowerCase().includes("decide") || action.stakeholder === "Sponsor") {
    pills.push({ label: "Decide", tone: "decide" });
  }
  if (action.action.toLowerCase().includes("clarif") || action.action.toLowerCase().includes("unblock")) {
    pills.push({ label: "Clear", tone: "clear" });
  }
  if (pills.length === 0) {
    pills.push({ label: "Decide", tone: "decide" });
  }
  return pills;
}

export type BuildPmAttentionFeedInput = {
  stakeholderActionQueue: StakeholderActionRow[];
  decisions: PmMissionControl["decisions"];
  blockedDependencies: number;
  projectId?: string;
  /** @deprecated Pending reviews live in governance Approvals tab — omit from feed to avoid triple-counting. */
  pendingReviewCount?: number;
  includePendingReviews?: boolean;
};

/** Merge stakeholder queue, blockers, and pending decisions into a sorted attention feed. */
export function buildPmAttentionFeed(input: BuildPmAttentionFeedInput): PmAttentionItem[] {
  const items: PmAttentionItem[] = [];
  const seen = new Set<string>();

  for (const action of input.stakeholderActionQueue) {
    const waitDays = dueLabelToWaitDays(action.dueLabel, action.priority);
    items.push({
      id: action.id,
      avatarInitials: initialsFromLabel(action.stakeholder),
      role: action.stakeholder,
      title: action.action,
      subtitle: `Priority ${action.priority}`,
      pills: pillsForAction(action),
      waitLabel: waitLabelFromDays(waitDays),
      waitSortDays: waitDays,
      href: action.href,
      escalateHref: input.projectId
        ? `/project/${input.projectId}/governance`
        : "/workspace/governance",
    });
    seen.add(action.id);
  }

  for (const decision of input.decisions.filter((d) => d.status === "proposed")) {
    const id = `decision-feed-${decision.title}`;
    if (seen.has(id)) continue;
    const waitDays = 4;
    items.push({
      id,
      avatarInitials: "SP",
      role: "Sponsor",
      title: `Decision pending: ${decision.title}`,
      subtitle: decision.impact ? `Impact: ${decision.impact}` : undefined,
      pills: [{ label: "Decide", tone: "decide" }],
      waitLabel: waitLabelFromDays(waitDays),
      waitSortDays: waitDays,
      href: input.projectId ? `/project/${input.projectId}/decisions` : "/workspace/decisions",
      escalateHref: input.projectId
        ? `/project/${input.projectId}/governance`
        : "/workspace/governance",
    });
  }

  if (input.blockedDependencies > 0 && !seen.has("blocked-tasks")) {
    items.push({
      id: "blocked-deps-feed",
      avatarInitials: "EN",
      role: "Engineering",
      title: `${input.blockedDependencies} blocked task${input.blockedDependencies === 1 ? "" : "s"} or dependencies`,
      subtitle: "Delivery velocity at risk",
      pills: [{ label: "Urgent", tone: "urgent" }, { label: "Clear", tone: "clear" }],
      waitLabel: "Waiting today",
      waitSortDays: 0,
      href: input.projectId ? `/project/${input.projectId}/delivery` : undefined,
      escalateHref: input.projectId
        ? `/project/${input.projectId}/delivery`
        : "/workspace/dashboard",
    });
  }

  if (input.includePendingReviews && (input.pendingReviewCount ?? 0) > 0) {
    const params = new URLSearchParams({ persona: "pm-mission" });
    if (input.projectId) params.set("project", input.projectId);
    items.push({
      id: "pending-reviews-feed",
      avatarInitials: "AI",
      role: "DeliverX AI",
      title: `${input.pendingReviewCount} AI proposal${input.pendingReviewCount === 1 ? "" : "s"} awaiting approval`,
      pills: [{ label: "Decide", tone: "decide" }],
      waitLabel: waitLabelFromDays(2),
      waitSortDays: 2,
      href: `/workspace/proposals?${params.toString()}`,
    });
  }

  return items.sort((a, b) => a.waitSortDays - b.waitSortDays || a.title.localeCompare(b.title));
}

export type BuildPmSteadyStateKpisInput = {
  overview: PmMissionControl["overview"];
  raid: PmMissionControl["raid"];
  pendingApprovalCount: number;
  teamCapacityPct: number | null;
  tasks: TaskWithMeta[];
  projectId?: string;
  /** @deprecated Kept for subtitle builders — not shown in KPI strip after R3. */
  waitingOnYouCount?: number;
  /** @deprecated */
  dataSources?: PmMissionControl["dataSources"];
};

/** Five KPIs for PM control room strip (delegates to R3 builder). */
export function buildPmSteadyStateKpis(input: BuildPmSteadyStateKpisInput): PmDayOneKpi[] {
  return buildPmControlRoomKpis(input).map(({ href: _href, ...kpi }) => kpi);
}

export type BuildPmTeamCapacityInput = {
  tasks: TaskWithMeta[];
  members: Array<{ id: string; name: string | null; email: string | null; role: string | null }>;
};

const ROLE_LABELS: Record<string, string> = {
  pm: "Delivery PM",
  executive: "Executive",
  ba: "Business Analyst",
  product_manager: "Product",
  engineer: "Engineering",
  scrum_master: "Scrum Master",
  qa: "QA",
  team_member: "Team member",
};

const ACTIVE_TASK_STATUSES = new Set(["todo", "in_progress", "in_review", "blocked"]);

/** MVP team load from task assignees; honest placeholder when no assignments exist. */
export function buildPmTeamCapacityRows(input: BuildPmTeamCapacityInput): {
  members: PmTeamCapacityMember[];
  avgLoadPct: number | null;
} {
  const activeTasks = input.tasks.filter((t) => ACTIVE_TASK_STATUSES.has(t.status));
  const byAssignee = new Map<string, number>();

  for (const task of activeTasks) {
    if (!task.assignee_id) continue;
    byAssignee.set(task.assignee_id, (byAssignee.get(task.assignee_id) ?? 0) + 1);
  }

  const memberById = new Map(input.members.map((m) => [m.id, m]));
  const assignedIds = [...byAssignee.keys()];

  if (assignedIds.length === 0) {
    const placeholderCount = Math.min(input.members.length, 4);
    if (placeholderCount === 0) {
      return { members: [], avgLoadPct: null };
    }

    const members: PmTeamCapacityMember[] = input.members.slice(0, placeholderCount).map((m) => ({
      id: m.id,
      name: m.name ?? m.email ?? "Teammate",
      role: ROLE_LABELS[m.role ?? ""] ?? m.role ?? "Team",
      assignedCount: 0,
      loadPct: 0,
      tone: "healthy",
      placeholder: true,
    }));

    return { members, avgLoadPct: null };
  }

  const maxTasks = Math.max(...assignedIds.map((id) => byAssignee.get(id) ?? 0), 1);
  const members: PmTeamCapacityMember[] = assignedIds
    .map((id) => {
      const member = memberById.get(id);
      const count = byAssignee.get(id) ?? 0;
      const loadPct = Math.round((count / Math.max(maxTasks, 3)) * 100);
      return {
        id,
        name: member?.name ?? member?.email ?? "Assignee",
        role: ROLE_LABELS[member?.role ?? ""] ?? member?.role ?? "Team",
        assignedCount: count,
        loadPct: Math.min(loadPct, 100),
        tone: (loadPct >= 90 ? "at-risk" : loadPct >= 70 ? "watch" : "healthy") as PmTeamCapacityMember["tone"],
      };
    })
    .sort((a, b) => b.assignedCount - a.assignedCount);

  const avgLoadPct =
    members.length > 0
      ? Math.round(members.reduce((sum, m) => sum + m.loadPct, 0) / members.length)
      : null;

  return { members: members.slice(0, 8), avgLoadPct };
}

export type BuildPmSteadyStateSubtitleInput = {
  projectName?: string;
  waitingOnYouCount: number;
  blockerCount: number;
  openDecisions: number;
};

/** Greeting subtitle for steady-state PM header from live counts. */
export function buildPmSteadyStateSubtitle(input: BuildPmSteadyStateSubtitleInput): string {
  const project = input.projectName ? `${input.projectName} — ` : "";
  const parts: string[] = [];

  if (input.waitingOnYouCount > 0) {
    parts.push(
      `${input.waitingOnYouCount} item${input.waitingOnYouCount === 1 ? "" : "s"} waiting on you`,
    );
  }
  if (input.blockerCount > 0) {
    parts.push(`${input.blockerCount} blocker${input.blockerCount === 1 ? "" : "s"}`);
  }
  if (input.openDecisions > 0) {
    parts.push(`${input.openDecisions} open decision${input.openDecisions === 1 ? "" : "s"}`);
  }

  if (parts.length === 0) {
    return `${project}Delivery steady-state — team on track, no urgent escalations.`;
  }

  return `${project}${parts.join(" · ")}.`;
}

export function countWaitingOnPm(attentionFeed: PmAttentionItem[]): number {
  return attentionFeed.length;
}

export type PmGovernanceTabCounts = {
  risks: number;
  decisions: number;
  changes: number;
  approvals: number;
};

export function buildPmGovernanceTabCounts(input: {
  raid: PmMissionControl["raid"];
  openDecisions: number;
  openChanges: number;
  pendingReviews: ArtifactReviewRow[];
}): PmGovernanceTabCounts {
  return {
    risks: input.raid.risks.length + input.raid.issues.length,
    decisions: input.openDecisions,
    changes: input.openChanges,
    approvals: input.pendingReviews.length,
  };
}
