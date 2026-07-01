import type { DbRole, MarketingRoleId } from "@/config/persona-onboarding";
import { DB_ROLE_TO_PERSONA } from "@/config/persona-onboarding";
import { ROLE_PILL_LABELS, type RoleId } from "@/lib/marketing/landing-data";

const MARKETING_ROLE_TO_DB: Record<MarketingRoleId, DbRole> = {
  sponsor: "executive",
  pm: "pm",
  ba: "ba",
  po: "product_manager",
  eng: "engineer",
  qa: "qa",
  sm: "scrum_master",
};

const DB_ROLE_ALIASES: Record<string, DbRole> = {
  executive: "executive",
  sponsor: "executive",
  pm: "pm",
  ba: "ba",
  product_manager: "product_manager",
  po: "product_manager",
  engineer: "engineer",
  eng: "engineer",
  qa: "qa",
  scrum_master: "scrum_master",
  sm: "scrum_master",
};

const ONBOARDING_ROLES = new Set<string>([
  "executive",
  "pm",
  "ba",
  "product_manager",
  "engineer",
  "qa",
  "scrum_master",
  "team_member",
]);

/** Normalise landing or signup `?role=` values to a database onboarding role. */
export function parseSignupRoleParam(value: string | null | undefined): DbRole | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  const resolved = DB_ROLE_ALIASES[key];
  return resolved && ONBOARDING_ROLES.has(resolved) ? resolved : null;
}

export function marketingRoleToDbRole(roleId: RoleId): DbRole {
  return MARKETING_ROLE_TO_DB[roleId];
}

export function dbRoleToMarketingRole(role: DbRole): MarketingRoleId | null {
  return DB_ROLE_TO_PERSONA[role];
}

/** Canonical marketing id used in `/signup?role=` deep links. */
export function signupRoleQueryValue(roleId: RoleId): MarketingRoleId {
  return roleId;
}

export function signupHrefForRole(
  roleId: RoleId,
  extraParams?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  params.set("role", signupRoleQueryValue(roleId));
  for (const [key, val] of Object.entries(extraParams ?? {})) {
    if (val) params.set(key, val);
  }
  const qs = params.toString();
  return qs ? `/signup?${qs}` : "/signup";
}

export function appendRoleToPath(path: string, role: DbRole | null | undefined): string {
  if (!role) return path;
  const url = new URL(path, "http://local");
  url.searchParams.set("role", role);
  return `${url.pathname}${url.search}`;
}

export function roleSignupLabel(roleId: RoleId): string {
  return `Start as ${ROLE_PILL_LABELS[roleId]}`;
}

const MISSION_CONTROL_CTA: Partial<Record<RoleId, string>> = {
  sponsor: "See Founder mission control →",
  pm: "See PM mission control →",
  ba: "See BA mission control →",
  po: "See Product mission control →",
  eng: "See Engineer mission control →",
  qa: "See QA mission control →",
  sm: "See Scrum mission control →",
};

export function roleMissionControlCta(roleId: RoleId): string {
  return MISSION_CONTROL_CTA[roleId] ?? `Start as ${ROLE_PILL_LABELS[roleId]} →`;
}
