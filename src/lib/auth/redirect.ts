import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveAuthenticatedPath(
  supabase: SupabaseClient,
  next?: string | null,
): Promise<string> {
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .maybeSingle();

  if (!profile?.organisation_id) {
    return safeNext?.startsWith("/onboarding") ? safeNext : "/onboarding/organisation";
  }

  return safeNext ?? "/workspace/dashboard";
}
