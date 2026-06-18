"use client";

import { useState } from "react";
import { Loader2, Video } from "lucide-react";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import { dxClass } from "@/lib/dx-theme";

type JoinResponse = { ok: true; botId: string };
type SyncResponse = { ok: true; transcriptLength: number; queuedProposals: number };

const SYNC_LABELS: Record<string, string> = {
  idle: "Not connected",
  pending: "Bot joining…",
  syncing: "Syncing transcript…",
  synced: "Synced",
  failed: "Sync failed",
};

export function MeetingRecallPanel({
  projectId,
  meetingId,
  recallBotId,
  syncStatus = "idle",
  recordingUrl,
}: {
  projectId: string;
  meetingId: string;
  recallBotId?: string | null;
  syncStatus?: string | null;
  recordingUrl?: string | null;
}) {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [joining, setJoining] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botId, setBotId] = useState(recallBotId ?? "");
  const [status, setStatus] = useState(syncStatus ?? "idle");

  async function joinBot() {
    if (!meetingUrl.trim()) {
      setError("Paste a Zoom, Google Meet, or Teams link.");
      return;
    }

    setJoining(true);
    setError(null);

    const res = await postAi<JoinResponse>(`/api/project/${projectId}/meetings/recall/join`, {
      meetingId,
      meetingUrl: meetingUrl.trim(),
    });

    setJoining(false);
    if (!res.ok) {
      setError(aiErrorMessage(res));
      return;
    }

    setBotId(res.data.botId);
    setStatus("pending");
  }

  async function syncTranscript() {
    setSyncing(true);
    setError(null);

    const res = await postAi<SyncResponse>(`/api/project/${projectId}/meetings/recall/sync`, {
      meetingId,
      queueProposals: true,
    });

    setSyncing(false);
    if (!res.ok) {
      setError(aiErrorMessage(res));
      setStatus("failed");
      return;
    }

    setStatus("synced");
    window.location.reload();
  }

  const statusLabel = SYNC_LABELS[status] ?? status;

  return (
    <div className="mt-3 rounded-lg border border-[#E4E4DC] bg-[#FAFAF5] p-3">
      <div className="mb-2 flex items-center gap-2">
        <Video size={14} className="text-[#1C4A2E]" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
          Recall.ai
        </span>
        <span
          className={`ml-auto font-[family-name:var(--font-dx-mono)] text-[8px] uppercase ${
            status === "synced"
              ? "text-[#1C4A2E]"
              : status === "failed"
                ? "text-[#C0392B]"
                : "text-[#A8A89E]"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {!botId ? (
        <div className="space-y-2">
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/…"
            className="w-full border border-[#E4E4DC] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#1C4A2E]"
          />
          <button
            type="button"
            onClick={() => void joinBot()}
            disabled={joining}
            className={`${dxClass.btnSm} w-full justify-center`}
          >
            {joining ? <Loader2 size={12} className="animate-spin" /> : null}
            Send notetaker bot
          </button>
        </div>
      ) : (
        <div className="space-y-2 text-xs text-[#6B6B64]">
          <p>
            Bot ID:{" "}
            <span className="font-[family-name:var(--font-dx-mono)] text-[10px]">{botId}</span>
          </p>
          {recordingUrl ? (
            <a
              href={recordingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#1C4A2E] hover:underline"
            >
              View recording
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => void syncTranscript()}
            disabled={syncing}
            className={`${dxClass.btnGhost} w-full justify-center text-[10px]`}
          >
            {syncing ? <Loader2 size={12} className="animate-spin" /> : null}
            Sync transcript &amp; extract
          </button>
        </div>
      )}

      {error ? <p className="mt-2 text-xs text-[#C0392B]">{error}</p> : null}
    </div>
  );
}
