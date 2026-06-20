/**
 * R3 — PM Team Needs feed builder (vertical list, not 3-column stakeholder loop).
 */

import { dueLabelToWaitDays } from "@/lib/pm-steady-state-panels";
import type { PmMissionControl } from "@/services/deliveryPmDashboard";
import type { StakeholderActionRow } from "@/services/deliveryPmEngine";
import type { TeamNeedRow } from "@/services/collaborativeLoopEngine";

export type PmTeamNeedStatus = "Urgent" | "Waiting" | "Review" | "Clear";

export type PmTeamNeedFeedItem = {
  id: string;
  avatarInitials: string;
  name: string;
  role: string;
  need: string;
  waitLabel: string;
  waitSortDays: number;
  status: PmTeamNeedStatus;
  href?: string;
  escalateHref?: string;
};

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "PM").toUpperCase();
}

function waitLabelFromDays(days: number): string {
  if (days <= 0) return "Waiting today";
  if (days === 1) return "Waiting 1 day";
  return `Waiting ${days} days`;
}

function statusForAction(action: StakeholderActionRow): PmTeamNeedStatus {
  if (action.tone === "red" || action.priority === "high") return "Urgent";
  const lower = action.action.toLowerCase();
  if (lower.includes("review") || lower.includes("approve")) return "Review";
  if (lower.includes("clarif") || lower.includes("unblock")) return "Clear";
  return "Waiting";
}

function statusForTeamNeed(need: TeamNeedRow): PmTeamNeedStatus {
  if (need.priority === "high" || need.kind === "blocker") return "Urgent";
  if (need.kind === "decision" || need.kind === "defect") return "Review";
  if (need.kind === "clarification") return "Clear";
  return "Waiting";
}

function plainEnglishNeed(action: StakeholderActionRow): string {
  const text = action.action.trim();
  if (/^decide:/i.test(text)) {
    return text.replace(/^decide:\s*/i, "Needs your decision on ");
  }
  if (/^unblock/i.test(text)) {
    return text;
  }
  return `${action.stakeholder} needs you to ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function plainEnglishTeamNeed(need: TeamNeedRow): string {
  return need.title;
}

export type BuildPmTeamNeedsFeedInput = {
  stakeholderActionQueue: StakeholderActionRow[];
  teamNeeds: TeamNeedRow[];
  decisions: PmMissionControl["decisions"];
  blockedDependencies: number;
  projectId?: string;
};

/** Merge stakeholder queue and collaborative team needs into a sorted vertical feed. */
export function buildPmTeamNeedsFeed(input: BuildPmTeamNeedsFeedInput): PmTeamNeedFeedItem[] {
  const items: PmTeamNeedFeedItem[] = [];
  const seen = new Set<string>();

  for (const action of input.stakeholderActionQueue) {
    const waitDays = dueLabelToWaitDays(action.dueLabel, action.priority);
    items.push({
      id: `action-${action.id}`,
      avatarInitials: initialsFromLabel(action.stakeholder),
      name: action.stakeholder,
      role: action.stakeholder,
      need: plainEnglishNeed(action),
      waitLabel: waitLabelFromDays(waitDays),
      waitSortDays: waitDays,
      status: statusForAction(action),
      href: action.href,
      escalateHref: input.projectId
        ? `/project/${input.projectId}/governance`
        : "/workspace/governance",
    });
    seen.add(action.id);
  }

  for (const need of input.teamNeeds) {
    const id = `need-${need.id}`;
    if (seen.has(need.id)) continue;
    const waitDays = need.dueLabel ? dueLabelToWaitDays(need.dueLabel, need.priority) : 5;
    items.push({
      id,
      avatarInitials: initialsFromLabel(need.fromStakeholder),
      name: need.fromStakeholder,
      role: need.fromStakeholder,
      need: plainEnglishTeamNeed(need),
      waitLabel: need.dueLabel ? waitLabelFromDays(waitDays) : waitLabelFromDays(5),
      waitSortDays: waitDays,
      status: statusForTeamNeed(need),
      href: need.href,
      escalateHref: input.projectId
        ? `/project/${input.projectId}/governance`
        : "/workspace/governance",
    });
    seen.add(need.id);
  }

  for (const decision of input.decisions.filter((d) => d.status === "proposed")) {
    const id = `decision-${decision.title}`;
    if (seen.has(id)) continue;
    const waitDays = 4;
    items.push({
      id,
      avatarInitials: "SP",
      name: "Sponsor",
      role: "Sponsor",
      need: `Needs your decision on ${decision.title}`,
      waitLabel: waitLabelFromDays(waitDays),
      waitSortDays: waitDays,
      status: "Review",
      href: input.projectId ? `/project/${input.projectId}/decisions` : "/workspace/decisions",
      escalateHref: input.projectId
        ? `/project/${input.projectId}/governance`
        : "/workspace/governance",
    });
    seen.add(id);
  }

  if (input.blockedDependencies > 0 && !seen.has("blocked-deps-feed")) {
    const hasBlockerAction = items.some(
      (item) =>
        item.status === "Urgent" &&
        (item.need.toLowerCase().includes("block") || item.need.toLowerCase().includes("unblock")),
    );
    if (!hasBlockerAction) {
      items.push({
        id: "blocked-deps-feed",
        avatarInitials: "EN",
        name: "Engineering",
        role: "Engineering",
        need: `${input.blockedDependencies} blocked task${input.blockedDependencies === 1 ? "" : "s"} need your unblock`,
        waitLabel: "Waiting today",
        waitSortDays: 0,
        status: "Urgent",
        href: input.projectId ? `/project/${input.projectId}/delivery` : "/workspace/tasks",
        escalateHref: input.projectId
          ? `/project/${input.projectId}/delivery`
          : "/workspace/tasks",
      });
    }
  }

  return items.sort(
    (a, b) => a.waitSortDays - b.waitSortDays || a.name.localeCompare(b.name),
  );
}

export function countPmTeamNeedsFeed(items: PmTeamNeedFeedItem[]): number {
  return items.length;
}
