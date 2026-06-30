import { DB_ROLE_DISPLAY_LABEL } from "@/config/mission-persona-meta";
import type { DbRole } from "@/config/persona-onboarding";

/** Human-readable role label for project-scoped JWT invite links. */
export function formatInviteRoleLabel(role: string | null | undefined): string {
  if (!role) return "Team member";
  if (role in DB_ROLE_DISPLAY_LABEL) {
    return DB_ROLE_DISPLAY_LABEL[role as DbRole];
  }
  return role.replace(/_/g, " ");
}

/** Post-auth redirect target after signup from a /join invite. */
export function buildJoinReturnPath(token: string, view?: string | null): string {
  const params = new URLSearchParams({ token });
  if (view === "sponsor") params.set("view", "sponsor");
  return `/join?${params.toString()}`;
}
