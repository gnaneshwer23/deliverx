/**
 * Recall.ai sync — attach bots, pull transcripts, run meeting extraction.
 */

import {
  buildRecallWebhookUrl,
  createRecallBot,
  getRecallBot,
  getRecallBotTranscript,
  isRecallConfigured,
} from "@/lib/integrations/recall";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";
import { getMeeting, updateMeeting } from "./governance";
import { runMeetingIntelPipeline } from "./meetingIntelPipeline";

export type MeetingRecallSyncStatus = "idle" | "pending" | "syncing" | "synced" | "failed";

export async function attachRecallBotToMeeting(input: {
  projectId: string;
  meetingId: string;
  meetingUrl: string;
}): Promise<{ ok: true; botId: string } | { ok: false; error: string }> {
  if (!isRecallConfigured()) {
    return { ok: false, error: "Recall.ai is not configured (set RECALL_API_KEY)" };
  }

  const meeting = await getMeeting(input.meetingId);
  if (!meeting || meeting.project_id !== input.projectId) {
    return { ok: false, error: "Meeting not found" };
  }

  const webhookUrl = buildRecallWebhookUrl(input.meetingId);
  const created = await createRecallBot({
    meetingUrl: input.meetingUrl,
    botName: `DeliverX — ${meeting.title}`,
    webhookUrl: webhookUrl ?? undefined,
  });

  if (!created.ok) return created;

  await updateMeeting(input.meetingId, {
    recall_bot_id: created.bot.id,
    sync_status: "pending",
  } as Parameters<typeof updateMeeting>[1]);

  return { ok: true, botId: created.bot.id };
}

export async function syncRecallTranscriptForMeeting(input: {
  projectId: string;
  meetingId: string;
  queueProposals?: boolean;
}): Promise<
  | { ok: true; transcriptLength: number; queuedProposals: number }
  | { ok: false; error: string }
> {
  const meeting = await getMeeting(input.meetingId);
  if (!meeting || meeting.project_id !== input.projectId) {
    return { ok: false, error: "Meeting not found" };
  }

  if (!meeting.recall_bot_id) {
    return { ok: false, error: "No Recall bot attached to this meeting" };
  }

  await updateMeeting(input.meetingId, { sync_status: "syncing" } as Parameters<
    typeof updateMeeting
  >[1]);

  const botResult = await getRecallBot(meeting.recall_bot_id);
  if (!botResult.ok) {
    await updateMeeting(input.meetingId, { sync_status: "failed" } as Parameters<
      typeof updateMeeting
    >[1]);
    return { ok: false, error: botResult.error };
  }

  const transcriptResult = await getRecallBotTranscript(meeting.recall_bot_id);
  if (!transcriptResult.ok || !transcriptResult.text.trim()) {
    await updateMeeting(input.meetingId, { sync_status: "failed" } as Parameters<
      typeof updateMeeting
    >[1]);
    return {
      ok: false,
      error: transcriptResult.ok
        ? "Transcript is empty — meeting may still be in progress"
        : transcriptResult.error,
    };
  }

  const recordingUrl =
    botResult.bot.video_url ??
    (typeof botResult.bot.recording === "string" ? botResult.bot.recording : null);

  await updateMeeting(input.meetingId, {
    recording_url: recordingUrl,
    sync_status: "synced",
  } as Parameters<typeof updateMeeting>[1]);

  const pipeline = await runMeetingIntelPipeline({
    projectId: input.projectId,
    meetingId: input.meetingId,
    title: meeting.title,
    transcript: transcriptResult.text,
    ceremonyType: (meeting.ceremony_type ?? "general") as MeetingCeremonyType,
    queueProposals: input.queueProposals !== false,
    transcriptSourceLabel: "Recall transcript",
  });

  return {
    ok: true,
    transcriptLength: transcriptResult.text.length,
    queuedProposals: pipeline.queuedProposals,
  };
}

export async function handleRecallWebhookEvent(input: {
  meetingId: string;
  event: string;
  payload: Record<string, unknown>;
}): Promise<{ ok: boolean; action?: string }> {
  if (input.event === "transcript.done" || input.event === "bot.done") {
    const meeting = await getMeeting(input.meetingId);
    if (!meeting) return { ok: false };

    void syncRecallTranscriptForMeeting({
      projectId: meeting.project_id,
      meetingId: input.meetingId,
    }).catch(() => undefined);

    return { ok: true, action: "sync_scheduled" };
  }

  if (input.event === "transcript.data") {
    const data = input.payload.data as { words?: Array<{ text?: string }> } | undefined;
    const chunk = data?.words?.map((w) => w.text ?? "").join(" ").trim();
    if (chunk) {
      const meeting = await getMeeting(input.meetingId);
      if (meeting) {
        const next = meeting.transcript ? `${meeting.transcript}\n${chunk}` : chunk;
        await updateMeeting(input.meetingId, {
          transcript: next,
          sync_status: "syncing",
        } as Parameters<typeof updateMeeting>[1]);
      }
    }
    return { ok: true, action: "transcript_chunk" };
  }

  return { ok: true, action: "ignored" };
}
