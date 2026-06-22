import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveSettingsHomePath } from "@/lib/settings-routing";

export default async function SettingsIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("users").select("role").single();

  redirect(resolveSettingsHomePath(profile?.role ?? null, user));
}
