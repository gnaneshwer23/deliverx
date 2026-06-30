import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/auth";
import { isOrgAdmin } from "@/lib/org-admin";

export async function requireOrgAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new ApiError("Not authenticated", 401);

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new ApiError("No organisation", 403);
  if (!isOrgAdmin(profile.role)) {
    throw new ApiError("Organisation admin access required", 403);
  }

  return { supabase, user, profile };
}
