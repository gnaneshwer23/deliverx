import { createClient } from "@/lib/supabase/server";
import { LAUNCHPAD_APP_PATH } from "@/lib/launchpad/auth";
import { getLaunchpadSession } from "@/lib/launchpad/store";
import { redirect } from "next/navigation";

/** Gate authenticated Launchpad app routes (separate from Professional Workspace onboarding). */
export async function requireLaunchpadAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(LAUNCHPAD_APP_PATH)}`);
  }

  const session = await getLaunchpadSession(supabase, user.id);
  return { user, supabase, ...session };
}
