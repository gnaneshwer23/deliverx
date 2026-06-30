"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";

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
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ingest() {
    if (!transcript.trim()) {
      setError("Paste a transcript with speaker labels (e.g. Alice: …) or plain notes.");
      return;
    }

    setLoading(true);
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
      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        queuedProposals?: number;
        speakerCount?: number;
        mode?: string;
      };

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Ingest failed");
        return;
      }

      setMessage(
        `Processed ${payload.speakerCount ?? 0} speaker segment(s) (${payload.mode ?? "auto"}) — ${payload.queuedProposals ?? 0} proposal(s) queued for PM review.`,
      );
      setTranscript("");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs font-semibold uppercase text-slate-400">Quick ingest</p>
      <p className="mt-1 text-[11px] text-slate-500">
        Paste transcript lines with speakers (Engineer: …) to extract per-speaker actions without
        Recall.
      </p>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={4}
        placeholder={"PM: Sprint is on track.\nEngineer: Blocked on auth API.\nQA: Need test plan by Friday."}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
      />
      <button
        type="button"
        disabled={loading || !transcript.trim()}
        onClick={ingest}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {loading ? (
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
