import type { User } from "@supabase/supabase-js";
import { hasDeveloperAccess } from "@/lib/developer-access";
import { isOrgAdmin } from "@/lib/org-admin";

export const SETTINGS_PROFILE_PATH = "/settings/profile";
export const SETTINGS_WORKSPACE_PATH = "/settings/workspace";
export const SETTINGS_DEVELOPER_PATH = "/settings/developer";

/** Default settings landing path based on role and developer access. */
export function resolveSettingsHomePath(
  role: string | null | undefined,
  user?: User | null,
): string {
  if (isOrgAdmin(role)) return SETTINGS_WORKSPACE_PATH;
  if (hasDeveloperAccess(role, user)) return SETTINGS_DEVELOPER_PATH;
  return SETTINGS_PROFILE_PATH;
}

export function canAccessWorkspaceSettings(role: string | null | undefined): boolean {
  return isOrgAdmin(role);
}

export function canAccessDeveloperSettings(
  role: string | null | undefined,
  user?: User | null,
): boolean {
  return hasDeveloperAccess(role, user);
}
