import { createClient } from "@/lib/supabase/server";
import { XPERIENCE_APP_PATH } from "@/lib/xperience/auth";
import { getXperienceSession } from "@/lib/xperience/store";
import { redirect } from "next/navigation";

/** Gate authenticated Xperience app routes (separate from Team Co-pilot onboarding). */
export async function requireXperienceAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(XPERIENCE_APP_PATH)}`);
  }

  const session = await getXperienceSession(supabase, user.id);
  return { user, supabase, ...session };
}
