/**
 * Admin gate for PI review queue.
 * Developer metadata or org admin (pm/executive).
 */

import type { User } from "@supabase/supabase-js";
import { hasDeveloperAccess } from "@/lib/developer-access";
import { isOrgAdmin } from "@/lib/org-admin";

export function canAccessPiReviewAdmin(
  role: string | null | undefined,
  user?: User | null,
): boolean {
  return hasDeveloperAccess(role, user) || isOrgAdmin(role);
}
