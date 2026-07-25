import type { SupabaseClient } from "@supabase/supabase-js";
import {
  experienceProjectRef,
  orgProjectRef,
  type WorkspaceProjectRef,
} from "@/lib/professional-workspace/project-context";

/** Lists org delivery projects + Experience enrolments for the shared shell. */
export async function listWorkspaceProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<WorkspaceProjectRef[]> {
  const [{ data: orgProjects }, { data: enrolments }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status")
      .order("updated_at", { ascending: false })
      .limit(40),
    supabase
      .from("xperience_enrolments")
      .select("id, company_name, day, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const org = (orgProjects ?? []).map((p) =>
    orgProjectRef({
      id: p.id as string,
      name: (p.name as string) || "Untitled project",
      status: p.status as string | null,
    }),
  );

  const xp = (enrolments ?? []).map((e) =>
    experienceProjectRef({
      id: e.id as string,
      companyName: (e.company_name as string) || "Experience",
      day: e.day as number | undefined,
      status: e.status as string | null,
    }),
  );

  return [...xp, ...org];
}

export function resolveActiveProject(
  projects: WorkspaceProjectRef[],
  kind: string | null,
  id: string | null,
): WorkspaceProjectRef | null {
  if (!kind || !id) return projects[0] ?? null;
  return projects.find((p) => p.kind === kind && p.id === id) ?? projects[0] ?? null;
}
