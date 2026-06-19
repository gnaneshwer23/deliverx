/**
 * K1 — persona mission home routes after login / onboarding.
 * Source of truth aligned with docs/I4_STAKEHOLDER_MATRIX.md.
 */

import type { DbRole } from "@/config/persona-onboarding";

export const COMMAND_CENTRE_HOME = "/workspace/dashboard" as const;

const PERSONA_HOME_ROLES = [
  "executive",
  "pm",
  "ba",
  "product_manager",
  "engineer",
  "qa",
  "scrum_master",
] as const;

export type PersonaHomeRole = (typeof PERSONA_HOME_ROLES)[number];

export const ROLE_HOME_ROUTES: Record<PersonaHomeRole, string> = {
  executive: "/workspace/founder",
  pm: "/workspace/pm-mission",
  ba: "/workspace/ba",
  product_manager: "/workspace/product",
  engineer: "/workspace/engineer",
  qa: "/workspace/qa",
  scrum_master: "/workspace/scrum-mission",
};

export const ROLE_HOME_CTA: Record<PersonaHomeRole, string> = {
  executive: "Open Founder Mission Control →",
  pm: "Open PM Mission Control →",
  ba: "Open BA Mission Control →",
  product_manager: "Open Product Mission Control →",
  engineer: "Open Engineer Mission Control →",
  qa: "Open QA Mission Control →",
  scrum_master: "Open Scrum Mission Control →",
};

export function isPersonaHomeRole(role: string | null | undefined): role is PersonaHomeRole {
  if (!role) return false;
  return (PERSONA_HOME_ROLES as readonly string[]).includes(role);
}

/** Post-auth landing when no explicit `next` path is provided. */
export function resolveRoleHomePath(role: string | null | undefined): string {
  if (!role || role === "team_member") return COMMAND_CENTRE_HOME;
  if (isPersonaHomeRole(role)) return ROLE_HOME_ROUTES[role];
  return COMMAND_CENTRE_HOME;
}

export function roleHomeCta(role: string | null | undefined): string {
  if (!role || role === "team_member") return "Enter workspace →";
  if (isPersonaHomeRole(role)) return ROLE_HOME_CTA[role];
  return "Enter workspace →";
}

export function listPersonaHomeRoles(): PersonaHomeRole[] {
  return [...PERSONA_HOME_ROLES];
}

/** Map database role to mission route — used by gateway onboarding simulation. */
export function missionHrefForDbRole(role: string): string {
  return resolveRoleHomePath(role);
}
