/**
 * K1 — config-driven "Next up" actionable items per mission persona.
 */

import type { ArtifactEntityType } from "@/lib/approval/constants";
import { ARTIFACT_ENTITY_LABELS } from "@/lib/approval/constants";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";

export type NextUpTone = "amber" | "green" | "blue" | "slate";

export type NextUpItem = {
  id: string;
  label: string;
  detail?: string;
  href: string;
  tone: NextUpTone;
  priority: number;
};

export type NextUpSignals = {
  hasProject: boolean;
  pendingReviews?: {
    count: number;
    topTitle?: string;
    topEntityType?: ArtifactEntityType;
  };
  openClarifications?: number;
  blockedTasks?: { count: number; topTitle?: string };
  openDecisions?: { count: number; topTitle?: string };
  impediments?: { count: number; topTitle?: string };
  criticalDefects?: number;
  guidedTask?: { title: string; href?: string };
  pendingRoleInvites?: { count: number; needsLinkCount: number };
};

type PersonaNextUpConfig = {
  /** Lower index = higher priority when multiple signals are present. */
  signalOrder: Array<keyof Omit<NextUpSignals, "hasProject" | "guidedTask">>;
  fallbacks: Array<{ id: string; label: string; detail: string; href: string; tone: NextUpTone }>;
};

const PROPOSALS = (persona: MissionPersonaId) => `/workspace/proposals?persona=${persona}`;

const PERSONA_NEXT_UP: Record<MissionPersonaId, PersonaNextUpConfig> = {
  founder: {
    signalOrder: ["openDecisions", "pendingReviews", "blockedTasks"],
    fallbacks: [
      {
        id: "founder-portfolio",
        label: "Review portfolio health",
        detail: "Open Founder Mission Control for runway and delivery signals.",
        href: "/workspace/founder",
        tone: "green",
      },
      {
        id: "founder-new-project",
        label: "Start a new project",
        detail: "Upload a business case to populate your decision centre.",
        href: "/project/new",
        tone: "blue",
      },
    ],
  },
  "pm-mission": {
    signalOrder: ["blockedTasks", "pendingRoleInvites", "openDecisions", "pendingReviews", "openClarifications"],
    fallbacks: [
      {
        id: "pm-delivery",
        label: "Configure delivery plan",
        detail: "Create a project or open delivery workspace for milestones and RAID.",
        href: "/project/new",
        tone: "blue",
      },
      {
        id: "pm-proposals",
        label: "Review AI outputs",
        detail: "Accept or edit generated milestones, RAID, and structure bundles.",
        href: PROPOSALS("pm-mission"),
        tone: "amber",
      },
    ],
  },
  ba: {
    signalOrder: ["openClarifications", "pendingReviews", "blockedTasks"],
    fallbacks: [
      {
        id: "ba-upload",
        label: "Upload project documents",
        detail: "Run AI extraction to populate requirements and clarifications.",
        href: "/project/new",
        tone: "blue",
      },
      {
        id: "ba-proposals",
        label: "Review extracted requirements",
        detail: "Accept AI-generated requirements before sprint handoff.",
        href: PROPOSALS("ba"),
        tone: "amber",
      },
    ],
  },
  product: {
    signalOrder: ["pendingReviews", "openDecisions", "openClarifications"],
    fallbacks: [
      {
        id: "product-roadmap",
        label: "Review roadmap draft",
        detail: "Prioritise features with RICE and publish Now / Next / Later.",
        href: "/workspace/product",
        tone: "green",
      },
      {
        id: "product-proposals",
        label: "Review AI product analysis",
        detail: "Accept customer segments, backlog, and opportunity tree outputs.",
        href: PROPOSALS("product"),
        tone: "amber",
      },
    ],
  },
  engineer: {
    signalOrder: ["blockedTasks", "pendingReviews", "openClarifications"],
    fallbacks: [
      {
        id: "eng-sprint",
        label: "Review sprint stories",
        detail: "Connect a project to see assigned stories and dependencies.",
        href: "/workspace/engineer",
        tone: "green",
      },
      {
        id: "eng-proposals",
        label: "Review AI task proposals",
        detail: "Accept estimations and structure bundles before build.",
        href: PROPOSALS("engineer"),
        tone: "amber",
      },
    ],
  },
  scrum: {
    signalOrder: ["impediments", "blockedTasks", "pendingReviews"],
    fallbacks: [
      {
        id: "sm-impediments",
        label: "Set up sprint baseline",
        detail: "Connect a project to surface blockers and team health.",
        href: "/workspace/scrum-mission",
        tone: "green",
      },
      {
        id: "sm-proposals",
        label: "Review sprint artifacts",
        detail: "Accept user stories and RAID items from AI output review.",
        href: PROPOSALS("scrum"),
        tone: "amber",
      },
    ],
  },
  qa: {
    signalOrder: ["criticalDefects", "pendingReviews", "blockedTasks"],
    fallbacks: [
      {
        id: "qa-release",
        label: "Review release readiness",
        detail: "Connect requirements to generate test cases and defect board.",
        href: "/workspace/qa",
        tone: "green",
      },
      {
        id: "qa-proposals",
        label: "Review AI test artifacts",
        detail: "Accept generated test cases and requirement mappings.",
        href: PROPOSALS("qa"),
        tone: "amber",
      },
    ],
  },
};

function projectWorkspaceHref(
  personaId: MissionPersonaId,
  projectId: string,
  panel?: string,
): string {
  const meta = getMissionPersonaMeta(personaId);
  const base = meta.workspacePath(projectId);
  return panel ? `${base}?tab=${panel}` : base;
}

function signalToItems(
  personaId: MissionPersonaId,
  signals: NextUpSignals,
  projectId?: string,
): NextUpItem[] {
  const items: NextUpItem[] = [];
  const proposalsHref = PROPOSALS(personaId);

  if (signals.pendingRoleInvites && signals.pendingRoleInvites.count > 0) {
    const { count, needsLinkCount } = signals.pendingRoleInvites;
    const label =
      needsLinkCount === count
        ? count === 1
          ? "Generate role invite link"
          : `${count} roles need invite links`
        : count === 1
          ? "1 teammate not joined"
          : `${count} teammates not joined`;
    items.push({
      id: "pending-role-invites",
      label,
      detail:
        needsLinkCount > 0
          ? "Share join links so each role lands in their mission workspace."
          : "Links are active — waiting for teammates to accept.",
      href: projectId
        ? `/workspace/pm-mission?project=${projectId}#pm-role-invites`
        : "/workspace/pm-mission#pm-role-invites",
      tone: "amber",
      priority: 18,
    });
  }

  if (signals.pendingReviews && signals.pendingReviews.count > 0) {
    const { count, topTitle, topEntityType } = signals.pendingReviews;
    const entityLabel = topEntityType ? ARTIFACT_ENTITY_LABELS[topEntityType] : "AI output";
    items.push({
      id: "pending-reviews",
      label:
        count === 1
          ? `Review ${entityLabel.toLowerCase()}`
          : `${count} AI outputs need review`,
      detail: topTitle,
      href: proposalsHref,
      tone: "amber",
      priority: 20,
    });
  }

  if (signals.openClarifications && signals.openClarifications > 0) {
    const count = signals.openClarifications;
    items.push({
      id: "clarifications",
      label: count === 1 ? "Answer clarification gap" : `${count} clarification gaps open`,
      detail: "Resolve before sprint planning or handoff.",
      href: projectId
        ? projectWorkspaceHref(personaId === "ba" ? "ba" : personaId, projectId, "clarifications")
        : personaId === "ba"
          ? "/workspace/ba"
          : getMissionPersonaMeta(personaId).routeBase,
      tone: "amber",
      priority: 10,
    });
  }

  if (signals.blockedTasks && signals.blockedTasks.count > 0) {
    const { count, topTitle } = signals.blockedTasks;
    items.push({
      id: "blocked-tasks",
      label: count === 1 ? "Unblock delivery task" : `${count} blocked tasks`,
      detail: topTitle,
      href: projectId ? projectWorkspaceHref(personaId, projectId) : getMissionPersonaMeta(personaId).routeBase,
      tone: "amber",
      priority: 15,
    });
  }

  if (signals.openDecisions && signals.openDecisions.count > 0) {
    const { count, topTitle } = signals.openDecisions;
    items.push({
      id: "open-decisions",
      label: count === 1 ? "Pending decision" : `${count} decisions need approval`,
      detail: topTitle,
      href:
        personaId === "founder"
          ? "/workspace/founder#decisions"
          : projectId
            ? `/project/${projectId}/governance`
            : "/workspace/governance",
      tone: "amber",
      priority: 12,
    });
  }

  if (signals.impediments && signals.impediments.count > 0) {
    const { count, topTitle } = signals.impediments;
    items.push({
      id: "impediments",
      label: count === 1 ? "Active impediment" : `${count} sprint impediments`,
      detail: topTitle,
      href: projectId ? projectWorkspaceHref("scrum", projectId) : "/workspace/scrum-mission",
      tone: "amber",
      priority: 8,
    });
  }

  if (signals.criticalDefects && signals.criticalDefects > 0) {
    const count = signals.criticalDefects;
    items.push({
      id: "critical-defects",
      label: count === 1 ? "Critical defect open" : `${count} critical defects`,
      detail: "Resolve before release sign-off.",
      href: projectId ? projectWorkspaceHref("qa", projectId) : "/workspace/qa",
      tone: "amber",
      priority: 5,
    });
  }

  if (signals.guidedTask?.title) {
    items.push({
      id: "guided-task",
      label: signals.guidedTask.title,
      href: signals.guidedTask.href ?? getMissionPersonaMeta(personaId).routeBase,
      tone: "blue",
      priority: 25,
    });
  }

  return items;
}

function sortByPersonaPriority(
  personaId: MissionPersonaId,
  items: NextUpItem[],
): NextUpItem[] {
  const order = PERSONA_NEXT_UP[personaId].signalOrder;
  const rank = new Map(order.map((key, index) => [key, index]));

  type SortableSignal = (typeof order)[number];

  const idToSignal: Record<string, SortableSignal | undefined> = {
    "pending-reviews": "pendingReviews",
    "pending-role-invites": "pendingRoleInvites",
    clarifications: "openClarifications",
    "blocked-tasks": "blockedTasks",
    "open-decisions": "openDecisions",
    impediments: "impediments",
    "critical-defects": "criticalDefects",
  };

  return [...items].sort((a, b) => {
    const aKey = idToSignal[a.id];
    const bKey = idToSignal[b.id];
    const aRank = aKey ? (rank.get(aKey) ?? 99) : 50;
    const bRank = bKey ? (rank.get(bKey) ?? 99) : 50;
    if (aRank !== bRank) return aRank - bRank;
    return a.priority - b.priority;
  });
}

function fallbackItems(personaId: MissionPersonaId): NextUpItem[] {
  return PERSONA_NEXT_UP[personaId].fallbacks.map((fb, index) => ({
    id: fb.id,
    label: fb.label,
    detail: fb.detail,
    href: fb.href,
    tone: fb.tone as NextUpTone,
    priority: 100 + index,
  }));
}

export function buildNextUpItems(
  personaId: MissionPersonaId,
  signals: NextUpSignals,
  projectId?: string,
  maxItems = 3,
): NextUpItem[] {
  const fromSignals = sortByPersonaPriority(
    personaId,
    signalToItems(personaId, signals, projectId),
  );

  if (fromSignals.length > 0) {
    return fromSignals.slice(0, maxItems);
  }

  if (!signals.hasProject) {
    return fallbackItems(personaId).slice(0, maxItems);
  }

  const meta = getMissionPersonaMeta(personaId);
  const defaultItem: NextUpItem = {
    id: "workspace-default",
    label: `Open ${meta.roleLabel} workspace`,
    detail: meta.tagline.split(" — ")[0],
    href: projectId ? meta.workspacePath(projectId) : meta.routeBase,
    tone: "green",
    priority: 50,
  };
  return [defaultItem].slice(0, maxItems);
}

export function listPersonaNextUpFallbacks(personaId: MissionPersonaId): number {
  return PERSONA_NEXT_UP[personaId].fallbacks.length;
}
