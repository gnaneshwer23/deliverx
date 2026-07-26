import { createClient } from "@/lib/supabase/server";
import { XPERIENCE_APP_PATH } from "@/lib/xperience/auth";
import { getXperienceSession } from "@/lib/xperience/store";
import { requireProductEntitlement } from "@/lib/billing/require-entitlement";
import { redirect } from "next/navigation";

/** Gate authenticated Experience app routes (separate from Professional Workspace onboarding). */
export async function requireXperienceAuth() {
  const { user } = await requireProductEntitlement("experience", {
    loginNext: XPERIENCE_APP_PATH,
  });

  const supabase = await createClient();
  const session = await getXperienceSession(supabase, user.id);
  return { user, supabase, ...session };
}
