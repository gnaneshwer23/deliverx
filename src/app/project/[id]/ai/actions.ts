"use server";

import { revalidatePath } from "next/cache";
import {
  applyMeetingAiResult,
  createReport,
  createRaidItem,
  type RaidItemType,
  type RaidSeverity,
} from "@/services/governance";
import type { MeetingSummaryResult, RaidSuggestion } from "@/services/aiGovernance";
import { computeProjectAlignment } from "@/services/alignment";
import { meetingResultToProposals } from "@/services/meetingProposals";
import { queueProposals } from "@/services/proposedActions";

export type ActionState = {
  ok: boolean;
  error?: string;
  alignmentScore?: number;
  alignmentDelta?: number | null;
  queuedProposals?: number;
};

function revalidateProject(projectId: string) {
  revalidatePath(`/project/${projectId}/meetings`);
  revalidatePath(`/project/${projectId}/decisions`);
  revalidatePath(`/project/${projectId}/raid`);
  revalidatePath(`/project/${projectId}/reports`);
  revalidatePath(`/project/${projectId}/charter`);
  revalidatePath(`/project/${projectId}/traceability`);
  revalidatePath(`/project/${projectId}`);
  revalidatePath("/workspace/dashboard");
  revalidatePath("/workspace/proposals");
}

export async function saveMeetingSummaryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const meetingId = String(formData.get("meetingId") ?? "");
  const summary = String(formData.get("summary") ?? "");
  const createDecisions = formData.get("createDecisions") === "on";
  const createRisks = formData.get("createRisks") === "on";
  const queueToApproval = formData.get("queueToApproval") !== "off";
  const payloadRaw = String(formData.get("payload") ?? "");
  const meetingTitle = String(formData.get("meetingTitle") ?? "Meeting");

  if (!projectId || !meetingId || !summary.trim()) {
    return { ok: false, error: "Missing meeting summary data." };
  }

  let payload: MeetingSummaryResult;
  try {
    payload = JSON.parse(payloadRaw) as MeetingSummaryResult;
  } catch {
    return { ok: false, error: "Invalid summary payload." };
  }

  try {
    await applyMeetingAiResult({
      projectId,
      meetingId,
      summary,
      createDecisions: queueToApproval ? false : createDecisions,
      createRisks: queueToApproval ? false : createRisks,
      decisions: payload.decisions ?? [],
      risks: payload.risks ?? [],
    });

    let queuedProposals = 0;
    if (queueToApproval) {
      const proposals = meetingResultToProposals(payload, meetingTitle);
      const queued = await queueProposals({
        projectId,
        source: "meeting",
        sourceId: meetingId,
        proposals,
      });
      queuedProposals = queued.length;
    }

    const alignment = await computeProjectAlignment(projectId, {
      meetingId,
      meetingContext: summary.trim(),
      source: "meeting",
    });

    revalidateProject(projectId);
    return {
      ok: true,
      alignmentScore: alignment.score,
      alignmentDelta: alignment.delta,
      queuedProposals,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save summary",
    };
  }
}

export async function saveAiReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const reportType = String(formData.get("reportType") ?? "status");

  if (!projectId || !title.trim() || !content.trim()) {
    return { ok: false, error: "Title and content are required." };
  }

  try {
    await createReport({
      projectId,
      title,
      content,
      reportType,
      aiGenerated: true,
    });
    revalidateProject(projectId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save report",
    };
  }
}

export async function applyRaidSuggestionsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const itemsRaw = String(formData.get("items") ?? "");

  if (!projectId || !itemsRaw) {
    return { ok: false, error: "No RAID suggestions to apply." };
  }

  let items: RaidSuggestion[];
  try {
    items = JSON.parse(itemsRaw) as RaidSuggestion[];
  } catch {
    return { ok: false, error: "Invalid RAID payload." };
  }

  try {
    for (const item of items) {
      await createRaidItem({
        projectId,
        type: item.type as RaidItemType,
        title: item.title,
        description: item.description,
        severity: item.severity as RaidSeverity,
        mitigation: item.mitigation,
      });
    }
    revalidatePath(`/project/${projectId}/raid`);
    revalidatePath("/workspace/governance");
    revalidatePath("/workspace/dashboard");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to apply RAID items",
    };
  }
}
