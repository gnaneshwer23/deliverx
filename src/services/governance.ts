/**
 * Governance façade — RAID, decisions, meetings, documents, changes, reports.
 */

import { createClient } from "@/lib/supabase/server";

export type RaidItemType = "risk" | "assumption" | "issue" | "dependency";
export type RaidStatus = "open" | "mitigated" | "closed" | "accepted";
export type RaidSeverity = "low" | "medium" | "high" | "critical";
export type DecisionStatus = "proposed" | "approved" | "rejected" | "superseded";
export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type ChangeStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "implemented";

export type RaidItemRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  type: RaidItemType;
  title: string;
  description: string | null;
  status: RaidStatus;
  severity: RaidSeverity;
  owner_id: string | null;
  due_date: string | null;
  mitigation: string | null;
  source_meeting_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DecisionRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  title: string;
  context: string | null;
  outcome: string | null;
  status: DecisionStatus;
  decided_by: string | null;
  decided_at: string | null;
  meeting_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MeetingRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  title: string;
  scheduled_at: string | null;
  notes: string | null;
  summary: string | null;
  ai_summary: string | null;
  status: MeetingStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  title: string;
  file_url: string | null;
  content_text: string | null;
  doc_type: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ChangeRequestRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  title: string;
  description: string | null;
  impact: string | null;
  status: ChangeStatus;
  requested_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportRow = {
  id: string;
  organisation_id: string;
  project_id: string;
  title: string;
  report_type: string;
  content: string;
  generated_at: string;
  generated_by: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
};

export type OrgGovernanceStats = {
  openRisks: number;
  openIssues: number;
  pendingDecisions: number;
  openChanges: number;
};

export type GovernanceRollup = {
  project_id: string;
  project_name: string;
  open_risks: number;
  open_issues: number;
  pending_decisions: number;
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
// Stats
// ---------------------------------------------------------------------------

export async function getOrgGovernanceStats(): Promise<OrgGovernanceStats> {
  const { supabase } = await getOrgContext();

  const [risks, issues, decisions, changes] = await Promise.all([
    supabase
      .from("raid_items")
      .select("id", { count: "exact", head: true })
      .eq("type", "risk")
      .eq("status", "open"),
    supabase
      .from("raid_items")
      .select("id", { count: "exact", head: true })
      .eq("type", "issue")
      .eq("status", "open"),
    supabase
      .from("decisions")
      .select("id", { count: "exact", head: true })
      .eq("status", "proposed"),
    supabase
      .from("change_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "submitted"]),
  ]);

  if (risks.error) throw risks.error;
  if (issues.error) throw issues.error;
  if (decisions.error) throw decisions.error;
  if (changes.error) throw changes.error;

  return {
    openRisks: risks.count ?? 0,
    openIssues: issues.count ?? 0,
    pendingDecisions: decisions.count ?? 0,
    openChanges: changes.count ?? 0,
  };
}

export async function getGovernanceRollup(): Promise<GovernanceRollup[]> {
  const { supabase } = await getOrgContext();

  const { data: projects, error: pErr } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");
  if (pErr) throw pErr;

  const { data: raid, error: rErr } = await supabase
    .from("raid_items")
    .select("project_id, type, status")
    .in("status", ["open", "mitigated"]);
  if (rErr) throw rErr;

  const { data: decisions, error: dErr } = await supabase
    .from("decisions")
    .select("project_id, status")
    .eq("status", "proposed");
  if (dErr) throw dErr;

  return (projects ?? []).map((p) => {
    const items = (raid ?? []).filter((r) => r.project_id === p.id);
    return {
      project_id: p.id,
      project_name: p.name,
      open_risks: items.filter((i) => i.type === "risk" && i.status === "open").length,
      open_issues: items.filter((i) => i.type === "issue" && i.status === "open").length,
      pending_decisions: (decisions ?? []).filter((d) => d.project_id === p.id).length,
    };
  });
}

// ---------------------------------------------------------------------------
// RAID
// ---------------------------------------------------------------------------

export async function listRaidItems(
  projectId: string,
  type?: RaidItemType,
): Promise<RaidItemRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("raid_items")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as RaidItemRow[];
}

export async function createRaidItem(input: {
  projectId: string;
  type: RaidItemType;
  title: string;
  description?: string;
  status?: RaidStatus;
  severity?: RaidSeverity;
  dueDate?: string;
  mitigation?: string;
}): Promise<RaidItemRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("raid_items")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      type: input.type,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status ?? "open",
      severity: input.severity ?? "medium",
      due_date: input.dueDate ?? null,
      mitigation: input.mitigation?.trim() || null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as RaidItemRow;
}

export async function updateRaidItem(
  id: string,
  patch: Partial<
    Pick<
      RaidItemRow,
      "title" | "description" | "status" | "severity" | "due_date" | "mitigation"
    >
  >,
): Promise<RaidItemRow> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("raid_items")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as RaidItemRow;
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export async function listDecisions(projectId: string): Promise<DecisionRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DecisionRow[];
}

export async function createDecision(input: {
  projectId: string;
  title: string;
  context?: string;
  outcome?: string;
  status?: DecisionStatus;
  meetingId?: string;
}): Promise<DecisionRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("decisions")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title: input.title.trim(),
      context: input.context?.trim() || null,
      outcome: input.outcome?.trim() || null,
      status: input.status ?? "proposed",
      meeting_id: input.meetingId ?? null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as DecisionRow;
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export async function listMeetings(projectId: string): Promise<MeetingRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("project_id", projectId)
    .order("scheduled_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as MeetingRow[];
}

export async function createMeeting(input: {
  projectId: string;
  title: string;
  scheduledAt?: string;
  notes?: string;
  summary?: string;
  status?: MeetingStatus;
}): Promise<MeetingRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title: input.title.trim(),
      scheduled_at: input.scheduledAt ?? null,
      notes: input.notes?.trim() || null,
      summary: input.summary?.trim() || null,
      status: input.status ?? "scheduled",
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as MeetingRow;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function listDocuments(projectId: string): Promise<DocumentRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function createDocument(input: {
  projectId: string;
  title: string;
  docType?: string;
  contentText?: string;
  fileUrl?: string;
}): Promise<DocumentRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title: input.title.trim(),
      doc_type: input.docType?.trim() || "general",
      content_text: input.contentText?.trim() || null,
      file_url: input.fileUrl?.trim() || null,
      uploaded_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as DocumentRow;
}

// ---------------------------------------------------------------------------
// Changes
// ---------------------------------------------------------------------------

export async function listChangeRequests(
  projectId: string,
): Promise<ChangeRequestRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("change_requests")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChangeRequestRow[];
}

export async function createChangeRequest(input: {
  projectId: string;
  title: string;
  description?: string;
  impact?: string;
  status?: ChangeStatus;
}): Promise<ChangeRequestRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("change_requests")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      impact: input.impact?.trim() || null,
      status: input.status ?? "draft",
      requested_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ChangeRequestRow;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function listReports(projectId: string): Promise<ReportRow[]> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("project_id", projectId)
    .order("generated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReportRow[];
}

export async function listOrgReports(limit = 50): Promise<
  Array<ReportRow & { project_name: string }>
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("reports")
    .select("*, projects!inner(name)")
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as ReportRow & { projects: { name: string } };
    return { ...r, project_name: r.projects.name };
  });
}

export async function createReport(input: {
  projectId: string;
  title: string;
  reportType?: string;
  content: string;
  aiGenerated?: boolean;
}): Promise<ReportRow> {
  const { supabase, orgId, userId } = await getOrgContext();
  await assertProjectInOrg(supabase, orgId, input.projectId);

  const { data, error } = await supabase
    .from("reports")
    .insert({
      organisation_id: orgId,
      project_id: input.projectId,
      title: input.title.trim(),
      report_type: input.reportType?.trim() || "status",
      content: input.content.trim(),
      generated_by: userId,
      ai_generated: input.aiGenerated ?? false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ReportRow;
}

export async function listOpenRaidForProject(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("raid_items")
    .select("type, title, status, severity")
    .eq("project_id", projectId)
    .in("status", ["open", "mitigated"]);

  if (error) throw error;
  return (data ?? []) as Array<{
    type: RaidItemType;
    title: string;
    status: RaidStatus;
    severity: RaidSeverity;
  }>;
}

export async function listOpenRaidOrg(limit = 8) {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("raid_items")
    .select("id, title, type, severity, status, project_id, projects!inner(name)")
    .eq("type", "risk")
    .eq("status", "open")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      title: string;
      type: RaidItemType;
      severity: RaidSeverity;
      project_id: string;
      projects: { name: string };
    };
    return {
      id: r.id,
      title: r.title,
      type: r.type,
      severity: r.severity,
      project_id: r.project_id,
      project_name: r.projects.name,
    };
  });
}
