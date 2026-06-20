import { createClient } from "@/lib/supabase/server";
import { normalizeProjectBootstrapSummary } from "@/services/projectBootstrap";
import { hasBootstrapParitySummary } from "@/lib/bootstrap-checklist";

export type OrgBootstrapProject = {
  id: string;
  bootstrap_status: string;
  bootstrap_summary: Record<string, unknown>;
  bootstrapped_at?: string | null;
};

const ACTIVE_BOOTSTRAP_STATUSES = ["pending", "running", "partial"] as const;
const COMPLETE_BOOTSTRAP_STATUSES = ["complete", "partial"] as const;

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
    .select("id, bootstrap_status, bootstrap_summary, bootstrapped_at")
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
    bootstrapped_at: (data.bootstrapped_at as string | null) ?? null,
  };
}

export async function getOrgRecentBootstrapProject(
  projectId?: string,
): Promise<OrgBootstrapProject | null> {
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

  let query = supabase
    .from("projects")
    .select("id, bootstrap_status, bootstrap_summary, bootstrapped_at")
    .eq("organisation_id", profile.organisation_id)
    .in("bootstrap_status", [...COMPLETE_BOOTSTRAP_STATUSES])
    .order("bootstrapped_at", { ascending: false })
    .limit(1);

  if (projectId) {
    query = query.eq("id", projectId);
  }

  const { data } = await query.maybeSingle();
  if (!data?.id) return null;

  return {
    id: String(data.id),
    bootstrap_status: String(data.bootstrap_status ?? "complete"),
    bootstrap_summary: (data.bootstrap_summary as Record<string, unknown>) ?? {},
    bootstrapped_at: (data.bootstrapped_at as string | null) ?? null,
  };
}

export function projectHasBootstrapParity(project: OrgBootstrapProject | null): project is OrgBootstrapProject {
  if (!project) return false;
  return hasBootstrapParitySummary(
    normalizeProjectBootstrapSummary(project.bootstrap_summary),
  );
}
