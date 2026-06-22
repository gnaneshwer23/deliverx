import type { User } from "@supabase/supabase-js";
import { isOrgAdmin } from "@/lib/org-admin";

/** Developer settings: org admins or users flagged via auth metadata. */
export function hasDeveloperAccess(
  role: string | null | undefined,
  user?: User | null,
): boolean {
  if (isOrgAdmin(role)) return true;
  if (!user) return false;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const appMeta = user.app_metadata as Record<string, unknown> | undefined;
  return meta?.developer === true || appMeta?.developer === true;
}
