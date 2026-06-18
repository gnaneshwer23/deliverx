import { createClient } from "@/lib/supabase/server";

export type OrgBootstrapProject = {
  id: string;
  bootstrap_status: string;
  bootstrap_summary: Record<string, unknown>;
};

const ACTIVE_BOOTSTRAP_STATUSES = ["pending", "running", "partial"] as const;

export async function getOrgActiveBootstrapProject(): Promise<OrgBootstrapProject | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.organisation_id) return null;

  const { data } = await supabase
    .from("projects")
    .select("id, bootstrap_status, bootstrap_summary")
    .eq("organisation_id", profile.organisation_id)
    .in("bootstrap_status", [...ACTIVE_BOOTSTRAP_STATUSES])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.id) return null;

  return {
    id: String(data.id),
    bootstrap_status: String(data.bootstrap_status ?? "pending"),
    bootstrap_summary: (data.bootstrap_summary as Record<string, unknown>) ?? {},
  };
}
