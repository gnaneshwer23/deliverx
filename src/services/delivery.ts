/**
 * Delivery façade — workstreams + tasks CRUD.
 */

import { createClient } from "@/lib/supabase/server";

export type WorkstreamStatus = "planned" | "active" | "completed";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export type WorkstreamRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: WorkstreamStatus;
  owner_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TaskRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  workstream_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  blocked_reason: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

async function getOrgContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organisation_id) throw new Error("No organisation");

  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
  };
}

async function assertProjectInOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  projectId: string,
) {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Project not found");
}

// ---------------------------------------------------------------------------
// Workstreams
// ---------------------------------------------------------------------------

export async function listWorkstreams(projectId: string): Promise<WorkstreamRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("workstreams")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as WorkstreamRow[];
}

export async function createWorkstream(input: {
  projectId: string;
  name: string;
  description?: string;
  status?: WorkstreamStatus;
  ownerId?: string;
  sortOrder?: number;
}): Promise<WorkstreamRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("workstreams")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      status: input.status ?? "planned",
      owner_id: input.ownerId ?? userId,
      sort_order: input.sortOrder ?? 0,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as WorkstreamRow;
}

export async function updateWorkstream(
  id: string,
  patch: Partial<
    Pick<WorkstreamRow, "name" | "description" | "status" | "owner_id" | "sort_order">
  >,
): Promise<WorkstreamRow> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("workstreams")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as WorkstreamRow;
}

export async function deleteWorkstream(id: string) {
  const { supabase } = await getOrgContext();
  const { error } = await supabase.from("workstreams").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function listTasks(opts: {
  projectId?: string;
  workstreamId?: string;
  status?: TaskStatus | TaskStatus[];
  limit?: number;
} = {}): Promise<TaskRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts.projectId) q = q.eq("project_id", opts.projectId);
  if (opts.workstreamId) q = q.eq("workstream_id", opts.workstreamId);
  if (opts.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    q = q.in("status", statuses);
  }
  if (opts.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TaskRow[];
}

export async function getTask(id: string): Promise<TaskRow | null> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as TaskRow | null) ?? null;
}

export async function createTask(input: {
  projectId: string;
  workstreamId?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  blockedReason?: string;
}): Promise<TaskRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  if (input.workstreamId) {
    const { data: ws } = await supabase
      .from("workstreams")
      .select("id")
      .eq("id", input.workstreamId)
      .eq("project_id", input.projectId)
      .maybeSingle();
    if (!ws) throw new Error("Workstream not found on this project");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      workstream_id: input.workstreamId ?? null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      assignee_id: input.assigneeId ?? null,
      due_date: input.dueDate ?? null,
      blocked_reason: input.blockedReason?.trim() || null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as TaskRow;
}

export async function updateTask(
  id: string,
  patch: Partial<
    Pick<
      TaskRow,
      | "title"
      | "description"
      | "status"
      | "priority"
      | "assignee_id"
      | "due_date"
      | "blocked_reason"
      | "workstream_id"
    >
  >,
): Promise<TaskRow> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as TaskRow;
}

export async function deleteTask(id: string) {
  const { supabase } = await getOrgContext();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function countTasksByProject(projectId: string) {
  const { supabase } = await getOrgContext();
  const { count, error } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) throw error;
  return count ?? 0;
}

export type TaskWithMeta = TaskRow & {
  project_name: string;
  workstream_name: string | null;
};

export type OrgDeliveryStats = {
  tasksInProgress: number;
  openRisks: number;
  teamMembers: number;
};

export async function getOrgDeliveryStats(): Promise<OrgDeliveryStats> {
  const { supabase, orgId } = await getOrgContext();

  const [inProgress, openRisks, teamMembers] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["todo", "in_progress"]),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("priority", ["high", "critical"])
      .neq("status", "done"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("organisation_id", orgId),
  ]);

  if (inProgress.error) throw inProgress.error;
  if (openRisks.error) throw openRisks.error;
  if (teamMembers.error) throw teamMembers.error;

  return {
    tasksInProgress: inProgress.count ?? 0,
    openRisks: openRisks.count ?? 0,
    teamMembers: teamMembers.count ?? 0,
  };
}

export async function listOrgTasks(
  opts: {
    projectId?: string;
    status?: TaskStatus | TaskStatus[];
    limit?: number;
  } = {},
): Promise<TaskWithMeta[]> {
  const { supabase } = await getOrgContext();

  let q = supabase
    .from("tasks")
    .select("*, projects!inner(name), workstreams(name)")
    .order("updated_at", { ascending: false });

  if (opts.projectId) q = q.eq("project_id", opts.projectId);
  if (opts.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    q = q.in("status", statuses);
  }
  if (opts.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as TaskRow & {
      projects: { name: string };
      workstreams: { name: string } | null;
    };
    return {
      ...r,
      project_name: r.projects.name,
      workstream_name: r.workstreams?.name ?? null,
    };
  });
}

export async function listOrgMembers() {
  const { supabase, orgId } = await getOrgContext();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("organisation_id", orgId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listOrgProjects() {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
