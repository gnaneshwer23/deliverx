import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveAuthenticatedPath(
  supabase: SupabaseClient,
  next?: string | null,
): Promise<string> {
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .maybeSingle();

  if (!profile?.organisation_id) {
    return safeNext?.startsWith("/onboarding") ? safeNext : "/onboarding/organisation";
  }

  if (safeNext) return safeNext;

  if (profile.role === "ba") return "/workspace/ba";
  if (profile.role === "product_manager") return "/workspace/product";
  if (profile.role === "pm") return "/workspace/pm-mission";
  if (profile.role === "executive") return "/workspace/founder";

  return "/workspace/dashboard";
}
