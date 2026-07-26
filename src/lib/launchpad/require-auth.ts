import { createClient } from "@/lib/supabase/server";
import { LAUNCHPAD_APP_PATH } from "@/lib/launchpad/auth";
import { getLaunchpadSession } from "@/lib/launchpad/store";
import { requireProductEntitlement } from "@/lib/billing/require-entitlement";

/** Gate authenticated Launchpad app routes (separate from Professional Workspace onboarding). */
export async function requireLaunchpadAuth() {
  const { user } = await requireProductEntitlement("launchpad", {
    loginNext: LAUNCHPAD_APP_PATH,
  });

  const supabase = await createClient();
  const session = await getLaunchpadSession(supabase, user.id);
  return { user, supabase, ...session };
}
