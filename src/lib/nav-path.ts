/**
 * K3 — navigation path helpers for persona wayfinding.
 */

import { COMMAND_CENTRE_HOME, resolveRoleHomePath } from "@/config/role-home-routing";
import {
  getDbRoleDisplayLabel,
  getMissionPersonaMeta,
} from "@/config/mission-persona-meta";
import {
  MISSION_CONTROL_IDS,
  roleToMissionPersona,
  type MissionPersonaId,
} from "@/lib/mission-nav";
import {
  workspaceCoreNav,
  workspaceDeliveryNav,
  workspaceEcosystemNav,
  workspaceGovernanceNav,
  workspaceIntelligenceNav,
  type WorkspaceNavItem,
} from "@/config/workspace-nav";

export type NavPathSegment = {
  label: string;
  href?: string;
};

export type NavPathContext = {
  pathname: string;
  userRole: string | null | undefined;
  /** Mission persona for the current route, if any. */
  routePersonaId: MissionPersonaId | null;
  /** User's primary mission persona from role. */
  homePersonaId: MissionPersonaId | null;
  homeHref: string;
  homeLabel: string;
  sectionLabel: string;
  isMissionHome: boolean;
  isCommandCentre: boolean;
};

const MISSION_ROUTE_TO_PERSONA: Record<string, MissionPersonaId> = {
  "/workspace/founder": "founder",
  "/workspace/pm-mission": "pm-mission",
  "/workspace/ba": "ba",
  "/workspace/product": "product",
  "/workspace/engineer": "engineer",
  "/workspace/scrum-mission": "scrum",
  "/workspace/qa": "qa",
};

const ALL_WORKSPACE_NAV: WorkspaceNavItem[] = [
  ...workspaceCoreNav,
  ...workspaceDeliveryNav,
  ...workspaceIntelligenceNav,
  ...workspaceEcosystemNav,
  ...workspaceGovernanceNav,
];

export function missionRouteBaseForPersona(personaId: MissionPersonaId): string {
  return getMissionPersonaMeta(personaId).routeBase;
}

export function pathnameToMissionPersona(pathname: string): MissionPersonaId | null {
  for (const [routeBase, personaId] of Object.entries(MISSION_ROUTE_TO_PERSONA)) {
    if (pathname === routeBase || pathname.startsWith(`${routeBase}/`)) {
      return personaId;
    }
  }
  return null;
}

export function normalizeNavHref(href: string): string {
  return href.split("?")[0] ?? href;
}

export function isPathActive(pathname: string, href: string): boolean {
  const base = normalizeNavHref(href);
  if (pathname === href || pathname === base) return true;
  if (base === COMMAND_CENTRE_HOME) {
    return pathname === COMMAND_CENTRE_HOME;
  }
  return pathname.startsWith(`${base}/`);
}

export function isWorkspaceNavItemActive(
  item: WorkspaceNavItem,
  pathname: string,
  userRole?: string | null,
): boolean {
  if (isPathActive(pathname, item.href)) return true;

  const homePersonaId = roleToMissionPersona(userRole);
  if (
    homePersonaId &&
    item.id === homePersonaId &&
    MISSION_CONTROL_IDS.has(item.id) &&
    !pathnameToMissionPersona(pathname) &&
    pathname.startsWith("/workspace/") &&
    pathname !== COMMAND_CENTRE_HOME
  ) {
    const matched = findWorkspaceNavItem(pathname);
    if (matched && matched.id !== "dash" && !MISSION_CONTROL_IDS.has(matched.id)) {
      return false;
    }
  }

  return false;
}

export function isPersonaHomeNavActive(
  pathname: string,
  homeHref: string,
  userRole?: string | null,
): boolean {
  const homePersonaId = roleToMissionPersona(userRole);
  if (!homePersonaId) return false;

  const routePersona = pathnameToMissionPersona(pathname);
  if (routePersona === homePersonaId) return true;

  if (pathname === homeHref || pathname.startsWith(`${homeHref}/`)) return true;

  return false;
}

export function findWorkspaceNavItem(pathname: string): WorkspaceNavItem | null {
  let best: WorkspaceNavItem | null = null;
  let bestLen = -1;

  for (const item of ALL_WORKSPACE_NAV) {
    const base = normalizeNavHref(item.href);
    const matches =
      pathname === item.href ||
      pathname === base ||
      (base !== COMMAND_CENTRE_HOME && pathname.startsWith(`${base}/`));
    if (matches && base.length > bestLen) {
      best = item;
      bestLen = base.length;
    }
  }

  return best;
}

export function resolveNavPathContext(
  pathname: string,
  userRole?: string | null,
): NavPathContext {
  const homePersonaId =
    userRole && userRole !== "team_member" ? roleToMissionPersona(userRole) : null;
  const homeHref = resolveRoleHomePath(userRole);
  const routePersonaId = pathnameToMissionPersona(pathname);
  const isCommandCentre = pathname === COMMAND_CENTRE_HOME;
  const isMissionHome = routePersonaId != null && pathname === missionRouteBaseForPersona(routePersonaId);

  const navItem = findWorkspaceNavItem(pathname);
  let sectionLabel = navItem?.label ?? "Workspace";
  if (isMissionHome && routePersonaId) {
    sectionLabel = "Mission Control";
  } else if (isCommandCentre) {
    sectionLabel = "Command Centre";
  }

  const homeLabel =
    homePersonaId != null
      ? getMissionPersonaMeta(homePersonaId).roleLabel
      : getDbRoleDisplayLabel(userRole);

  return {
    pathname,
    userRole,
    routePersonaId,
    homePersonaId,
    homeHref,
    homeLabel,
    sectionLabel,
    isMissionHome,
    isCommandCentre,
  };
}

export function buildNavPathSegments(context: NavPathContext): NavPathSegment[] {
  const segments: NavPathSegment[] = [{ label: "DeliverX", href: COMMAND_CENTRE_HOME }];

  const personaId = context.routePersonaId ?? context.homePersonaId;
  if (personaId) {
    const meta = getMissionPersonaMeta(personaId);
    segments.push({
      label: meta.roleLabel,
      href: meta.routeBase,
    });
  } else if (context.userRole && context.userRole !== "team_member") {
    segments.push({
      label: getDbRoleDisplayLabel(context.userRole),
      href: context.homeHref,
    });
  }

  if (context.isMissionHome) {
    segments.push({ label: "Mission Control" });
  } else if (context.isCommandCentre) {
    segments.push({ label: "Command Centre" });
  } else if (context.sectionLabel !== "Command Centre" && context.sectionLabel !== "Mission Control") {
    const navItem = findWorkspaceNavItem(context.pathname);
    segments.push({
      label: context.sectionLabel,
      href: navItem?.href,
    });
  }

  return segments;
}

export function buildMissionHomePathSegments(personaId: MissionPersonaId): NavPathSegment[] {
  const meta = getMissionPersonaMeta(personaId);
  return [
    { label: "DeliverX", href: COMMAND_CENTRE_HOME },
    { label: meta.roleLabel, href: meta.routeBase },
    { label: "Mission Control" },
  ];
}

export function missionNavPathLabel(context: NavPathContext): string {
  return buildNavPathSegments(context)
    .map((segment) => segment.label)
    .join(" · ");
}

export function shouldExpandOtherMissions(
  pathname: string,
  otherMissionIds: string[],
): boolean {
  const routePersona = pathnameToMissionPersona(pathname);
  if (routePersona && otherMissionIds.includes(routePersona)) return true;
  return false;
}

export function listMissionRouteBases(): string[] {
  return Object.keys(MISSION_ROUTE_TO_PERSONA);
}
