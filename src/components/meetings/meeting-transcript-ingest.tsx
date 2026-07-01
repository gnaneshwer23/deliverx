"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";
import { MEETING_AUDIO_ACCEPT } from "@/lib/meetings/audio-upload";
import {
  pmMeetingReviewUrl,
  shouldRedirectAfterMeetingIngest,
} from "@/lib/meeting-flow";

type IngestResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  queuedProposals?: number;
  speakerCount?: number;
  mode?: string;
};

export function MeetingTranscriptIngest({
  projectId,
  meetingId,
  ceremonyType = "general",
}: {
  projectId: string;
  meetingId?: string;
  ceremonyType?: MeetingCeremonyType;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transcript, setTranscript] = useState("");
  const [pasteLoading, setPasteLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whisperAvailable, setWhisperAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/ai/status")
      .then((res) => res.json())
      .then((payload: { configured?: boolean }) => {
        if (!cancelled) setWhisperAvailable(Boolean(payload.configured));
      })
      .catch(() => {
        if (!cancelled) setWhisperAvailable(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleIngestResult(payload: IngestResponse) {
    const queuedProposals = payload.queuedProposals ?? 0;
    setMessage(
      `Processed ${payload.speakerCount ?? 0} speaker segment(s) (${payload.mode ?? "auto"}) — ${queuedProposals} proposal(s) queued for PM review.`,
    );
    setTranscript("");

    if (shouldRedirectAfterMeetingIngest(queuedProposals)) {
      router.push(pmMeetingReviewUrl(projectId));
      return;
    }

    router.refresh();
  }

  async function ingestTranscript() {
    if (!transcript.trim()) {
      setError("Paste a transcript with speaker labels (e.g. Alice: …) or plain notes.");
      return;
    }

    setPasteLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/project/${projectId}/meetings/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          title: "Meeting transcript ingest",
          transcript,
          ceremonyType,
          mode: "auto",
        }),
      });
      const payload = (await res.json()) as IngestResponse;

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Ingest failed");
        return;
      }

      handleIngestResult(payload);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPasteLoading(false);
    }
  }

  async function ingestAudio(file: File) {
    setAudioLoading(true);
    setError(null);
    setMessage(null);

    const body = new FormData();
    body.append("file", file);
    if (meetingId) body.append("meetingId", meetingId);
    body.append("ceremonyType", ceremonyType);

    try {
      const res = await fetch(`/api/project/${projectId}/meetings/transcribe`, {
        method: "POST",
        body,
      });
      const payload = (await res.json()) as IngestResponse;

      if (!res.ok || !payload.ok) {
        if (payload.code === "openai_not_configured") {
          setError(
            "Audio transcription needs OPENAI_API_KEY on the server. Paste a transcript below instead.",
          );
        } else {
          setError(payload.error ?? "Transcription failed");
        }
        return;
      }

      toast.success("Audio transcribed — running meeting intel pipeline");
      handleIngestResult(payload);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setAudioLoading(false);
    }
  }

  const loading = pasteLoading || audioLoading;

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs font-semibold uppercase text-slate-400">Quick ingest (no Recall)</p>
      <p className="mt-1 text-[11px] text-slate-500">
        Upload a recording or paste transcript lines with speakers (Engineer: …) to extract
        per-speaker actions.
      </p>

      <div className="mt-3 rounded-md border border-dashed border-slate-300 bg-white p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={MEETING_AUDIO_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void ingestAudio(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {audioLoading ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Transcribing…
            </>
          ) : (
            <>
              <Mic size={12} /> Upload audio
            </>
          )}
        </button>
        <p className="mt-1 text-[10px] text-slate-400">MP3, MP4, M4A, or WAV · max 25 MB</p>
        {whisperAvailable === false ? (
          <p className="mt-1 text-[10px] text-amber-700">
            OPENAI_API_KEY is not configured — upload is disabled; paste transcript still works.
          </p>
        ) : null}
      </div>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={4}
        placeholder={"PM: Sprint is on track.\nEngineer: Blocked on auth API.\nQA: Need test plan by Friday."}
        className="mt-3 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
      />
      <button
        type="button"
        disabled={loading || !transcript.trim()}
        onClick={ingestTranscript}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {pasteLoading ? (
          <>
            <Loader2 size={12} className="animate-spin" /> Processing…
          </>
        ) : (
          <>
            <Sparkles size={12} /> Run meeting intel pipeline
          </>
        )}
      </button>
      {message ? <p className="mt-2 text-xs font-medium text-[#0F766E]">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
