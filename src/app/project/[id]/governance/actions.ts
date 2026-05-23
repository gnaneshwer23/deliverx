"use server";

import { revalidatePath } from "next/cache";
import {
  createRaidItem,
  createDecision,
  createMeeting,
  createDocument,
  createChangeRequest,
  createReport,
  updateReportReviewStatus,
  publishReport,
  type RaidItemType,
  type RaidSeverity,
  type DecisionStatus,
  type MeetingStatus,
  type ChangeStatus,
} from "@/services/governance";

export type ActionState = { ok: boolean; error?: string };

function revalidateGovernance(projectId: string) {
  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/project/${projectId}/raid`);
  revalidatePath(`/project/${projectId}/decisions`);
  revalidatePath(`/project/${projectId}/meetings`);
  revalidatePath(`/project/${projectId}/documents`);
  revalidatePath(`/project/${projectId}/changes`);
  revalidatePath(`/project/${projectId}/reports`);
  revalidatePath("/workspace/governance");
  revalidatePath("/workspace/reports");
  revalidatePath("/workspace/dashboard");
}

export async function createRaidAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const type = String(formData.get("type") ?? "risk") as RaidItemType;
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const severity = String(formData.get("severity") ?? "medium") as RaidSeverity;
  const mitigation = String(formData.get("mitigation") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "") || undefined;

  try {
    await createRaidItem({
      projectId,
      type,
      title,
      description,
      severity,
      mitigation,
      dueDate,
    });
    revalidateGovernance(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create RAID item",
    };
  }
}

export async function createDecisionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  const context = String(formData.get("context") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const status = String(formData.get("status") ?? "proposed") as DecisionStatus;
  const meetingId = String(formData.get("meetingId") ?? "") || undefined;

  try {
    await createDecision({
      projectId,
      title,
      context,
      outcome,
      status,
      meetingId,
    });
    revalidateGovernance(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create decision",
    };
  }
}

export async function createMeetingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  const scheduledAt = String(formData.get("scheduledAt") ?? "") || undefined;
  const notes = String(formData.get("notes") ?? "");
  const summary = String(formData.get("summary") ?? "");
  const status = String(formData.get("status") ?? "scheduled") as MeetingStatus;

  try {
    await createMeeting({
      projectId,
      title,
      scheduledAt,
      notes,
      summary,
      status,
    });
    revalidateGovernance(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create meeting",
    };
  }
}

export async function createDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  const docType = String(formData.get("docType") ?? "general");
  const contentText = String(formData.get("contentText") ?? "");
  const fileUrl = String(formData.get("fileUrl") ?? "") || undefined;

  try {
    await createDocument({ projectId, title, docType, contentText, fileUrl });
    revalidateGovernance(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to add document",
    };
  }
}

export async function createChangeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const impact = String(formData.get("impact") ?? "");
  const status = String(formData.get("status") ?? "draft") as ChangeStatus;

  try {
    await createChangeRequest({
      projectId,
      title,
      description,
      impact,
      status,
    });
    revalidateGovernance(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create change request",
    };
  }
}

export async function createReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  const reportType = String(formData.get("reportType") ?? "status");
  const content = String(formData.get("content") ?? "");

  try {
    await createReport({ projectId, title, reportType, content });
    revalidateGovernance(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create report",
    };
  }
}

export async function markReportReviewedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const reportId = String(formData.get("reportId") ?? "");

  try {
    await updateReportReviewStatus(reportId, "reviewed");
    revalidateGovernance(projectId);
    revalidatePath(`/project/${projectId}/reports/${reportId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to mark report reviewed",
    };
  }
}

export async function publishReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const reportId = String(formData.get("reportId") ?? "");
  const emailsRaw = String(formData.get("stakeholderEmails") ?? "");
  const stakeholderEmails = emailsRaw
    .split(/[,;\n]/)
    .map((e) => e.trim())
    .filter(Boolean);

  try {
    await publishReport(reportId, stakeholderEmails);
    revalidateGovernance(projectId);
    revalidatePath(`/project/${projectId}/reports/${reportId}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to publish report",
    };
  }
}
