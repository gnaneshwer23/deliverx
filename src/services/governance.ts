/**
 * Governance façade — RAID, decisions, meetings, documents, changes, reports.
 */

import { createClient } from "@/lib/supabase/server";
import { requestApproval } from "@/services/approvals";
import { emitReportPublishedEvent } from "@/services/platformWebhooks";

export type RaidItemType = "risk" | "assumption" | "issue" | "dependency";
export type RaidStatus = "open" | "mitigated" | "closed" | "accepted";
export type RaidSeverity = "low" | "medium" | "high" | "critical";
export type DecisionStatus = "proposed" | "approved" | "rejected" | "superseded";
export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type MeetingCeremonyType =
  | "general"
  | "standup"
  | "planning"
  | "retro"
  | "steering"
  | "workshop";
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
  transcript: string | null;
  recording_path: string | null;
  ai_summary: string | null;
  ceremony_type: MeetingCeremonyType;
  extraction_json: Record<string, unknown> | null;
  proposals_queued_at: string | null;
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

export type ReportReviewStatus = "draft" | "reviewed" | "published";

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
  review_status?: ReportReviewStatus;
  published_at?: string | null;
  stakeholder_emails?: string[] | null;
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

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.organisation_id) throw new Error("No organisation");

  return {
    supabase,
    userId: user.id,
    orgId: profile.organisation_id as string,
    role: profile.role as string | null,
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
  opts: { page?: number; pageSize?: number } = {},
): Promise<RaidItemRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("raid_items")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (type) q = q.eq("type", type);
  if (opts.page != null && opts.pageSize) {
    const from = opts.page * opts.pageSize;
    q = q.range(from, from + opts.pageSize - 1);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as RaidItemRow[];
}

export async function countRaidItems(
  projectId: string,
  type?: RaidItemType,
): Promise<number> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("raid_items")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (type) q = q.eq("type", type);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
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
  sourceMeetingId?: string;
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
      source_meeting_id: input.sourceMeetingId ?? null,
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

export async function listDecisions(
  projectId: string,
  opts: { page?: number; pageSize?: number } = {},
): Promise<DecisionRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("decisions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (opts.page != null && opts.pageSize) {
    const from = opts.page * opts.pageSize;
    q = q.range(from, from + opts.pageSize - 1);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DecisionRow[];
}

export async function countDecisions(projectId: string): Promise<number> {
  const { supabase } = await getOrgContext();
  const { count, error } = await supabase
    .from("decisions")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (error) throw error;
  return count ?? 0;
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
  const row = data as DecisionRow;

  if (row.status === "proposed") {
    await requestApproval({
      projectId: input.projectId,
      entityType: "decision",
      entityId: row.id,
      notes: `Decision proposed: ${row.title}`,
    }).catch(() => undefined);
  }

  return row;
}

export async function resolveOrgDecision(
  id: string,
  status: "approved" | "rejected",
  outcome?: string,
): Promise<DecisionRow> {
  const { supabase, orgId, userId, role } = await getOrgContext();

  if (role !== "executive" && role !== "pm") {
    throw new Error("Only PMs and executives can resolve decisions.");
  }

  const { data: existing, error: fetchError } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Decision not found.");
  }

  const { data, error } = await supabase
    .from("decisions")
    .update({
      status,
      outcome: outcome?.trim() || (status === "approved" ? "Approved" : "Rejected"),
      decided_by: userId,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  await supabase
    .from("governance_approvals")
    .update({
      status,
      decided_by: userId,
      decided_at: new Date().toISOString(),
    })
    .eq("entity_type", "decision")
    .eq("entity_id", id)
    .eq("status", "pending");

  return data as DecisionRow;
}

export async function escalateOrgDecision(id: string, notes?: string): Promise<void> {
  const { supabase, orgId, userId, role } = await getOrgContext();

  if (role !== "executive" && role !== "pm") {
    throw new Error("Only PMs and executives can escalate decisions.");
  }

  const { data: decision, error } = await supabase
    .from("decisions")
    .select("id, project_id, title, context")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (error || !decision) throw new Error("Decision not found.");

  const escalationNote = notes?.trim() || "Escalated to steering committee for review.";
  const context = [decision.context, `[Escalated] ${escalationNote}`]
    .filter(Boolean)
    .join("\n\n");

  await supabase
    .from("decisions")
    .update({ context, updated_at: new Date().toISOString() })
    .eq("id", id);

  await requestApproval({
    projectId: decision.project_id as string,
    entityType: "decision",
    entityId: decision.id as string,
    approvalLevel: "steering",
    notes: escalationNote,
  }).catch(() => undefined);

  void userId;
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export async function listMeetings(
  projectId: string,
  opts: { page?: number; pageSize?: number } = {},
): Promise<MeetingRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("meetings")
    .select("*")
    .eq("project_id", projectId)
    .order("scheduled_at", { ascending: false, nullsFirst: false });
  if (opts.page != null && opts.pageSize) {
    const from = opts.page * opts.pageSize;
    q = q.range(from, from + opts.pageSize - 1);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as MeetingRow[];
}

export async function countMeetings(projectId: string): Promise<number> {
  const { supabase } = await getOrgContext();
  const { count, error } = await supabase
    .from("meetings")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (error) throw error;
  return count ?? 0;
}

export async function getMeeting(id: string): Promise<MeetingRow | null> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as MeetingRow | null) ?? null;
}

export async function createMeeting(input: {
  projectId: string;
  title: string;
  scheduledAt?: string;
  notes?: string;
  summary?: string;
  status?: MeetingStatus;
  ceremonyType?: MeetingCeremonyType;
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
      ceremony_type: input.ceremonyType ?? "general",
      status: input.status ?? "scheduled",
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as MeetingRow;
}

export async function updateMeeting(
  id: string,
  patch: Partial<
    Pick<
      MeetingRow,
      | "title"
      | "scheduled_at"
      | "notes"
      | "summary"
      | "status"
      | "transcript"
      | "recording_path"
      | "ceremony_type"
      | "extraction_json"
      | "ai_summary"
      | "proposals_queued_at"
    >
  >,
): Promise<MeetingRow> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("meetings")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as MeetingRow;
}

export async function applyMeetingAiResult(input: {
  projectId: string;
  meetingId: string;
  summary: string;
  createDecisions: boolean;
  createRisks: boolean;
  decisions: Array<{ title: string; context: string }>;
  risks: Array<{
    type: "risk" | "issue" | "dependency";
    title: string;
    description: string;
  }>;
}): Promise<{ decisions: number; risks: number }> {
  const meeting = await getMeeting(input.meetingId);
  if (!meeting || meeting.project_id !== input.projectId) {
    throw new Error("Meeting not found for this project");
  }

  await updateMeeting(input.meetingId, { summary: input.summary.trim() });

  let decisionCount = 0;
  if (input.createDecisions) {
    for (const d of input.decisions) {
      await createDecision({
        projectId: input.projectId,
        title: d.title,
        context: d.context,
        meetingId: input.meetingId,
      });
      decisionCount++;
    }
  }

  let riskCount = 0;
  if (input.createRisks) {
    for (const r of input.risks) {
      await createRaidItem({
        projectId: input.projectId,
        type: r.type,
        title: r.title,
        description: r.description,
        severity: "medium",
        sourceMeetingId: input.meetingId,
      });
      riskCount++;
    }
  }

  return { decisions: decisionCount, risks: riskCount };
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function listDocuments(
  projectId: string,
  opts: { page?: number; pageSize?: number } = {},
): Promise<DocumentRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (opts.page != null && opts.pageSize) {
    const from = opts.page * opts.pageSize;
    q = q.range(from, from + opts.pageSize - 1);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function countDocuments(projectId: string): Promise<number> {
  const { supabase } = await getOrgContext();
  const { count, error } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (error) throw error;
  return count ?? 0;
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
  const row = data as ChangeRequestRow;

  if (row.status === "submitted") {
    await requestApproval({
      projectId: input.projectId,
      entityType: "change",
      entityId: row.id,
      notes: `Change request submitted: ${row.title}`,
    }).catch(() => undefined);
  }

  return row;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function listReports(
  projectId: string,
  opts: { page?: number; pageSize?: number } = {},
): Promise<ReportRow[]> {
  const { supabase } = await getOrgContext();
  let q = supabase
    .from("reports")
    .select("*")
    .eq("project_id", projectId)
    .order("generated_at", { ascending: false });
  if (opts.page != null && opts.pageSize) {
    const from = opts.page * opts.pageSize;
    q = q.range(from, from + opts.pageSize - 1);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ReportRow[];
}

export async function countReports(projectId: string): Promise<number> {
  const { supabase } = await getOrgContext();
  const { count, error } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (error) throw error;
  return count ?? 0;
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

export async function updateReportReviewStatus(
  reportId: string,
  reviewStatus: ReportReviewStatus,
): Promise<ReportRow> {
  const { supabase, orgId } = await getOrgContext();

  const { data: existing, error: existingError } = await supabase
    .from("reports")
    .select("review_status, project_id, title")
    .eq("id", reportId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (!existing) throw new Error("Report not found");

  const patch: Record<string, unknown> = { review_status: reviewStatus };
  if (reviewStatus === "published") {
    patch.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("reports")
    .update(patch)
    .eq("id", reportId)
    .select("*")
    .single();

  if (error) throw error;
  const report = data as ReportRow;

  if (reviewStatus === "published" && existing.review_status !== "published") {
    void emitReportPublishedEvent(orgId, {
      reportId: report.id,
      projectId: report.project_id,
      title: report.title,
      reviewStatus: report.review_status ?? "published",
      source: "workflow",
    }).catch(() => undefined);
  }

  return report;
}

export async function publishReport(
  reportId: string,
  stakeholderEmails: string[],
): Promise<ReportRow & { emailSent?: boolean; emailError?: string }> {
  const { supabase, orgId } = await getOrgContext();
  const emails = stakeholderEmails.map((e) => e.trim()).filter(Boolean);

  const { data, error } = await supabase
    .from("reports")
    .update({
      review_status: "published",
      published_at: new Date().toISOString(),
      stakeholder_emails: emails,
    })
    .eq("id", reportId)
    .select("*")
    .single();

  if (error) throw error;
  const report = data as ReportRow;

  let emailSent: boolean | undefined;
  let emailError: string | undefined;

  if (emails.length > 0) {
    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", report.project_id)
      .single();

    const { sendReportPublishedEmail } = await import("@/lib/email/resend");
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
    const result = await sendReportPublishedEmail({
      reportTitle: report.title,
      projectName: (project?.name as string) ?? "Project",
      content: report.content,
      recipients: emails,
      appUrl: `${appUrl}/project/${report.project_id}/reports/${report.id}`,
    });
    emailSent = result.sent;
    if (!result.sent) emailError = result.reason;
  }

  void emitReportPublishedEvent(orgId, {
    reportId: report.id,
    projectId: report.project_id,
    title: report.title,
    reviewStatus: report.review_status ?? "published",
    stakeholderCount: emails.length,
    emailSent: emailSent ?? false,
    source: "workflow",
  }).catch(() => undefined);

  return { ...report, emailSent, emailError };
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

export async function listOrgMeetingsRecent(limit = 6): Promise<
  Array<Pick<MeetingRow, "id" | "title" | "status" | "scheduled_at" | "project_id" | "created_at"> & {
    project_name: string;
  }>
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("meetings")
    .select("id, title, status, scheduled_at, project_id, created_at, projects!inner(name)")
    .order("scheduled_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      title: string;
      status: MeetingStatus;
      scheduled_at: string | null;
      project_id: string;
      created_at: string;
      projects: { name: string };
    };
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      scheduled_at: r.scheduled_at,
      project_id: r.project_id,
      created_at: r.created_at,
      project_name: r.projects.name,
    };
  });
}

export async function listOrgDecisionsPending(limit = 6): Promise<
  Array<Pick<DecisionRow, "id" | "title" | "status" | "project_id" | "created_at"> & {
    project_name: string;
  }>
> {
  return listOrgDecisions({ status: "proposed", limit });
}

export async function listOrgDecisions(opts: {
  status?: DecisionStatus;
  limit?: number;
} = {}): Promise<
  Array<Pick<DecisionRow, "id" | "title" | "status" | "project_id" | "created_at"> & {
    project_name: string;
  }>
> {
  const { supabase } = await getOrgContext();
  const limit = opts.limit ?? 100;
  let q = supabase
    .from("decisions")
    .select("id, title, status, project_id, created_at, projects!inner(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (opts.status) q = q.eq("status", opts.status);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      title: string;
      status: DecisionStatus;
      project_id: string;
      created_at: string;
      projects: { name: string };
    };
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      project_id: r.project_id,
      created_at: r.created_at,
      project_name: r.projects.name,
    };
  });
}

export async function listOrgRaidItems(opts: {
  type?: RaidItemType;
  status?: RaidStatus[];
  limit?: number;
} = {}): Promise<
  Array<
    Pick<
      RaidItemRow,
      "id" | "title" | "type" | "status" | "severity" | "project_id" | "created_at" | "due_date"
    > & { project_name: string }
  >
> {
  const { supabase } = await getOrgContext();
  const limit = opts.limit ?? 100;
  let q = supabase
    .from("raid_items")
    .select(
      "id, title, type, status, severity, project_id, created_at, due_date, projects!inner(name)",
    )
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (opts.type) q = q.eq("type", opts.type);
  if (opts.status?.length) q = q.in("status", opts.status);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      title: string;
      type: RaidItemType;
      status: RaidStatus;
      severity: RaidSeverity;
      project_id: string;
      created_at: string;
      due_date: string | null;
      projects: { name: string };
    };
    return {
      id: r.id,
      title: r.title,
      type: r.type,
      status: r.status,
      severity: r.severity,
      project_id: r.project_id,
      created_at: r.created_at,
      due_date: r.due_date,
      project_name: r.projects.name,
    };
  });
}

export async function listOrgChangeRequests(opts: {
  status?: ChangeStatus[];
  limit?: number;
} = {}): Promise<
  Array<
    Pick<ChangeRequestRow, "id" | "title" | "status" | "project_id" | "created_at" | "impact"> & {
      project_name: string;
    }
  >
> {
  const { supabase } = await getOrgContext();
  const limit = opts.limit ?? 100;
  let q = supabase
    .from("change_requests")
    .select("id, title, status, project_id, created_at, impact, projects!inner(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (opts.status?.length) q = q.in("status", opts.status);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      title: string;
      status: ChangeStatus;
      project_id: string;
      created_at: string;
      impact: string | null;
      projects: { name: string };
    };
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      project_id: r.project_id,
      created_at: r.created_at,
      impact: r.impact,
      project_name: r.projects.name,
    };
  });
}

export async function listOrgDocuments(limit = 100): Promise<
  Array<
    Pick<DocumentRow, "id" | "title" | "doc_type" | "project_id" | "created_at" | "file_url"> & {
      project_name: string;
    }
  >
> {
  const { supabase } = await getOrgContext();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, doc_type, project_id, created_at, file_url, projects!inner(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      title: string;
      doc_type: string;
      project_id: string;
      created_at: string;
      file_url: string | null;
      projects: { name: string };
    };
    return {
      id: r.id,
      title: r.title,
      doc_type: r.doc_type,
      project_id: r.project_id,
      created_at: r.created_at,
      file_url: r.file_url,
      project_name: r.projects.name,
    };
  });
}
