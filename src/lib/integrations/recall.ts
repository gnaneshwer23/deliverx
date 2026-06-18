/**
 * Recall.ai meeting bot client — create bots, fetch transcripts, verify webhooks.
 */

import { createHmac } from "node:crypto";

export type RecallBotStatus =
  | "ready"
  | "joining_call"
  | "in_call_not_recording"
  | "in_call_recording"
  | "call_ended"
  | "done"
  | "fatal";

export type RecallBot = {
  id: string;
  meeting_url: string;
  status?: { code: RecallBotStatus; message?: string };
  video_url?: string | null;
  recording?: string | null;
};

export type RecallTranscriptSegment = {
  speaker?: string;
  text: string;
  start?: number;
  end?: number;
};

export type RecallWebhookHeaders = {
  "webhook-id"?: string;
  "webhook-timestamp"?: string;
  "webhook-signature"?: string;
};

function recallBaseUrl(): string {
  const region = process.env.RECALL_REGION?.trim() || "us-east-1";
  return `https://${region}.recall.ai/api/v1`;
}

function recallApiKey(): string | null {
  return process.env.RECALL_API_KEY?.trim() || null;
}

export function isRecallConfigured(): boolean {
  return Boolean(recallApiKey());
}

async function recallFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const key = recallApiKey();
  if (!key) {
    return { ok: false, status: 503, error: "RECALL_API_KEY is not configured" };
  }

  const res = await fetch(`${recallBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: key,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      error: text || `Recall API error (${res.status})`,
    };
  }

  const data = (await res.json()) as T;
  return { ok: true, data };
}

export async function createRecallBot(input: {
  meetingUrl: string;
  botName?: string;
  webhookUrl?: string;
}): Promise<{ ok: true; bot: RecallBot } | { ok: false; error: string }> {
  const body: Record<string, unknown> = {
    meeting_url: input.meetingUrl.trim(),
    bot_name: input.botName?.trim() || "DeliverX Notetaker",
  };

  if (input.webhookUrl) {
    body.recording_config = {
      transcript: {
        provider: {
          recallai_streaming: {
            mode: "prioritize_accuracy",
            language_code: "en",
          },
        },
      },
      realtime_endpoints: [
        {
          type: "webhook",
          url: input.webhookUrl,
          events: ["transcript.data"],
        },
      ],
    };
  }

  const result = await recallFetch<RecallBot>("/bot/", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, bot: result.data };
}

export async function getRecallBot(
  botId: string,
): Promise<{ ok: true; bot: RecallBot } | { ok: false; error: string }> {
  const result = await recallFetch<RecallBot>(`/bot/${encodeURIComponent(botId)}/`);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, bot: result.data };
}

export async function getRecallBotTranscript(
  botId: string,
): Promise<{ ok: true; text: string; segments: RecallTranscriptSegment[] } | { ok: false; error: string }> {
  const result = await recallFetch<{ transcript?: RecallTranscriptSegment[] | string }>(
    `/bot/${encodeURIComponent(botId)}/transcript/`,
  );
  if (!result.ok) return { ok: false, error: result.error };

  const raw = result.data.transcript;
  if (typeof raw === "string") {
    return { ok: true, text: raw.trim(), segments: [] };
  }

  const segments: RecallTranscriptSegment[] = (raw ?? []).map((s) => ({
    speaker: s.speaker,
    text: String(s.text ?? "").trim(),
    start: s.start,
    end: s.end,
  }));

  const text = segments
    .map((s) => (s.speaker ? `${s.speaker}: ${s.text}` : s.text))
    .filter(Boolean)
    .join("\n");

  return { ok: true, text, segments };
}

export function verifyRecallWebhook(
  payload: string,
  headers: RecallWebhookHeaders,
): boolean {
  const secret = process.env.RECALL_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  const msgId = headers["webhook-id"];
  const timestamp = headers["webhook-timestamp"];
  const signature = headers["webhook-signature"];
  if (!msgId || !timestamp || !signature) return false;

  const signed = `${msgId}.${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("base64");

  for (const part of signature.split(" ")) {
    const [version, sig] = part.split(",", 2);
    if (version === "v1" && sig === expected) return true;
  }

  return false;
}

export function buildRecallWebhookUrl(meetingId: string): string | null {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/api/integrations/recall/webhook?meeting=${encodeURIComponent(meetingId)}`;
}
