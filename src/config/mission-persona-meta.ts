/**
 * Mission Control persona identity — labels, taglines, and chrome aligned with workspace nav.
 */

import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Code2,
  Crown,
  Kanban,
  NotebookPen,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { roleToMissionPersona } from "@/lib/mission-nav";
import {
  DB_ROLE_TO_PERSONA,
  PERSONA_COMPLETION,
  type BadgeTone,
  type DbRole,
  type MarketingRoleId,
} from "@/config/persona-onboarding";

export type MissionBadgeTone = "green" | "amber" | "blue" | "accent" | "slate";

export type MissionPersonaMeta = {
  personaId: MissionPersonaId;
  roleLabel: string;
  breadcrumb: string;
  navLabel: string;
  icon: LucideIcon;
  badgeTone: MissionBadgeTone;
  badgeCls: BadgeTone;
  tagline: string;
  workspacePath: (projectId: string) => string;
  workspaceActionLabel: string;
  newProjectLabel: string;
  routeBase: string;
};

/** Display labels for database roles (breadcrumb ↔ nav ↔ title). */
export const DB_ROLE_DISPLAY_LABEL: Record<DbRole, string> = {
  executive: "Founder",
  product_manager: "Product",
  pm: "Delivery PM",
  ba: "BA",
  engineer: "Engineer",
  qa: "QA",
  scrum_master: "Scrum Master",
  team_member: "Team Member",
};

const TAGLINE_EXTENSIONS: Record<MarketingRoleId, string> = {
  sponsor: "AI Chief of Staff for vision, runway, and investor readiness.",
  pm: "AI Chief Project Officer for scope, timeline, budget, and governance.",
  ba: "Bridge business and delivery from case to benefits.",
  po: "AI Chief Product Officer from business problem to adoption.",
  eng: "Engineering copilot from requirements to deployment.",
  qa: "AI Quality Engineer for coverage, defects, and UAT.",
  sm: "AI Agile Coach for ceremonies, velocity, and wellbeing.",
};

function taglineForPersona(personaId: MissionPersonaId): string {
  const marketingId = personaToMarketingId(personaId);
  if (marketingId) {
    const base = PERSONA_COMPLETION[marketingId].description;
    const extension = TAGLINE_EXTENSIONS[marketingId];
    return `${base.replace(/\.$/, "")} — ${extension}`;
  }
  return "Your personalised mission dashboard.";
}

const PERSONA_ICONS: Record<MissionPersonaId, LucideIcon> = {
  founder: Crown,
  "pm-mission": CalendarClock,
  ba: NotebookPen,
  product: TrendingUp,
  engineer: Code2,
  scrum: Kanban,
  qa: ShieldCheck,
};

const PERSONA_BADGE_TONE: Record<MissionPersonaId, MissionBadgeTone> = {
  founder: "accent",
  "pm-mission": "blue",
  ba: "green",
  product: "accent",
  engineer: "blue",
  scrum: "green",
  qa: "amber",
};

const PERSONA_BADGE_CLS: Record<MissionPersonaId, BadgeTone> = {
  founder: "badge-g",
  "pm-mission": "badge-n",
  ba: "badge-g",
  product: "badge-g",
  engineer: "badge-n",
  scrum: "badge-g",
  qa: "badge-a",
};

const NAV_LABELS: Record<MissionPersonaId, string> = {
  founder: "Founder Mission Control",
  "pm-mission": "PM Mission Control",
  ba: "BA Mission Control",
  product: "Product Mission Control",
  engineer: "Engineer Mission Control",
  scrum: "Scrum Mission Control",
  qa: "QA Mission Control",
};

const BREADCRUMB_LABELS: Record<MissionPersonaId, string> = {
  founder: "DeliverX OS · Founder",
  "pm-mission": "DeliverX OS · Delivery PM",
  ba: "DeliverX OS · Business Analysis",
  product: "DeliverX OS · Product",
  engineer: "DeliverX OS · Engineering",
  scrum: "DeliverX OS · Scrum",
  qa: "DeliverX OS · QA",
};

const ROLE_LABELS: Record<MissionPersonaId, string> = {
  founder: "Founder",
  "pm-mission": "Delivery PM",
  ba: "BA",
  product: "Product",
  engineer: "Engineer",
  scrum: "Scrum Master",
  qa: "QA",
};

const WORKSPACE_ACTIONS: Record<
  MissionPersonaId,
  { path: (id: string) => string; label: string; newLabel: string; routeBase: string }
> = {
  founder: {
    path: () => "/workspace/portfolio",
    label: "Full portfolio →",
    newLabel: "New project →",
    routeBase: "/workspace/founder",
  },
  "pm-mission": {
    path: (id) => `/project/${id}/delivery`,
    label: "Delivery workspace →",
    newLabel: "New project →",
    routeBase: "/workspace/pm-mission",
  },
  ba: {
    path: (id) => `/project/${id}/requirements`,
    label: "Requirements workspace →",
    newLabel: "New project →",
    routeBase: "/workspace/ba",
  },
  product: {
    path: (id) => `/project/${id}/product`,
    label: "Product workspace →",
    newLabel: "New product →",
    routeBase: "/workspace/product",
  },
  engineer: {
    path: (id) => `/project/${id}/engineering`,
    label: "Engineering workspace →",
    newLabel: "New project →",
    routeBase: "/workspace/engineer",
  },
  scrum: {
    path: (id) => `/project/${id}/scrum`,
    label: "Scrum workspace →",
    newLabel: "New project →",
    routeBase: "/workspace/scrum-mission",
  },
  qa: {
    path: (id) => `/project/${id}/qa`,
    label: "QA workspace →",
    newLabel: "New project →",
    routeBase: "/workspace/qa",
  },
};

function personaToMarketingId(personaId: MissionPersonaId): MarketingRoleId | null {
  const entry = Object.entries(DB_ROLE_TO_PERSONA).find(
    ([, marketingId]) => marketingId && missionPersonaFromMarketing(marketingId) === personaId,
  );
  return (entry?.[1] as MarketingRoleId | null) ?? null;
}

function missionPersonaFromMarketing(id: MarketingRoleId): MissionPersonaId {
  const map: Record<MarketingRoleId, MissionPersonaId> = {
    sponsor: "founder",
    pm: "pm-mission",
    ba: "ba",
    po: "product",
    eng: "engineer",
    qa: "qa",
    sm: "scrum",
  };
  return map[id];
}

function buildMeta(personaId: MissionPersonaId): MissionPersonaMeta {
  const actions = WORKSPACE_ACTIONS[personaId];
  return {
    personaId,
    roleLabel: ROLE_LABELS[personaId],
    breadcrumb: BREADCRUMB_LABELS[personaId],
    navLabel: NAV_LABELS[personaId],
    icon: PERSONA_ICONS[personaId],
    badgeTone: PERSONA_BADGE_TONE[personaId],
    badgeCls: PERSONA_BADGE_CLS[personaId],
    tagline: taglineForPersona(personaId),
    workspacePath: actions.path,
    workspaceActionLabel: actions.label,
    newProjectLabel: actions.newLabel,
    routeBase: actions.routeBase,
  };
}

export const MISSION_PERSONA_META: Record<MissionPersonaId, MissionPersonaMeta> = {
  founder: buildMeta("founder"),
  "pm-mission": buildMeta("pm-mission"),
  ba: buildMeta("ba"),
  product: buildMeta("product"),
  engineer: buildMeta("engineer"),
  scrum: buildMeta("scrum"),
  qa: buildMeta("qa"),
};

export function getMissionPersonaMeta(personaId: MissionPersonaId): MissionPersonaMeta {
  return MISSION_PERSONA_META[personaId];
}

export function getMissionPersonaMetaForRole(role: string | null | undefined): MissionPersonaMeta | null {
  const personaId = roleToMissionPersona(role);
  if (!personaId) return null;
  return MISSION_PERSONA_META[personaId];
}

export function getDbRoleDisplayLabel(role: string | null | undefined): string {
  if (!role) return "Team Member";
  return DB_ROLE_DISPLAY_LABEL[role as DbRole] ?? "Team Member";
}

export function missionControlTitle(roleLabel: string): { title: string; titleEm: string } {
  return {
    title: `Your ${roleLabel} Mission`,
    titleEm: "Control",
  };
}

/** Command Centre identity copy keyed by database role. */
export const COMMAND_CENTRE_TAGLINES: Record<string, string> = {
  executive: `${PERSONA_COMPLETION.sponsor.description.replace(/\.$/, "")} — Open Founder Mission Control for portfolio decisions and runway.`,
  pm: `${PERSONA_COMPLETION.pm.description.replace(/\.$/, "")} — Open PM Mission Control for guided delivery execution.`,
  ba: `${PERSONA_COMPLETION.ba.description.replace(/\.$/, "")} — Open BA Mission Control for guided requirement tasks.`,
  product_manager: `${PERSONA_COMPLETION.po.description.replace(/\.$/, "")} — Open Product Mission Control for roadmap and RICE prioritisation.`,
  engineer: `${PERSONA_COMPLETION.eng.description.replace(/\.$/, "")} — Open Engineer Mission Control for stories and traceability.`,
  qa: `${PERSONA_COMPLETION.qa.description.replace(/\.$/, "")} — Open QA Mission Control for release readiness.`,
  scrum_master: `${PERSONA_COMPLETION.sm.description.replace(/\.$/, "")} — Open Scrum Mission Control for sprint health and impediments.`,
  team_member: "Your tasks, standups, and project updates in one place.",
};

export function commandCentreTitle(role: string | null | undefined, userName: string | null): string {
  const label = getDbRoleDisplayLabel(role);
  const greeting = userName ? `, ${userName.split(/\s+/)[0]}` : "";
  if (role === "team_member") return `My workspace${greeting}`;
  return `Your ${label} Command Centre${greeting}`;
}

export function commandCentreTagline(role: string | null | undefined, orgName: string | null): string {
  const org = orgName ? `${orgName} · ` : "";
  const base = COMMAND_CENTRE_TAGLINES[role ?? ""] ?? COMMAND_CENTRE_TAGLINES.team_member;
  return `${org}${base}`;
}

/** Expose completion descriptions for tests and parity checks. */
export function completionDescriptionForDbRole(role: DbRole): string | null {
  const marketingId = DB_ROLE_TO_PERSONA[role];
  if (!marketingId) return null;
  return PERSONA_COMPLETION[marketingId].description;
}

export function userInitials(userName: string | null | undefined): string {
  if (!userName?.trim()) return "?";
  const parts = userName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }
  return userName.slice(0, 2).toUpperCase();
}
