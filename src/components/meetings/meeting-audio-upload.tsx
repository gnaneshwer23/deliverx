"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic } from "lucide-react";
import { toast } from "sonner";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";

type TranscribeResponse = {
  ok: true;
  transcript: string;
};

export function MeetingAudioUpload({
  projectId,
  meetingId,
}: {
  projectId: string;
  meetingId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setLoading(true);
    setError(null);

    const body = new FormData();
    body.append("projectId", projectId);
    body.append("meetingId", meetingId);
    body.append("file", file);

    let res: Response;
    try {
      res = await fetch("/api/ai/meetings/transcribe", { method: "POST", body });
    } catch {
      setLoading(false);
      setError("Network error. Try again.");
      return;
    }

    setLoading(false);

    let payload: Record<string, unknown> = {};
    try {
      payload = (await res.json()) as Record<string, unknown>;
    } catch {
      setError("Invalid response from server.");
      return;
    }

    if (!res.ok) {
      const code = payload.code as string | undefined;
      if (code === "openai_not_configured") {
        setError("Transcription requires OPENAI_API_KEY on the server.");
      } else {
        setError(String(payload.error ?? "Transcription failed"));
      }
      return;
    }

    const data = payload as TranscribeResponse;
    toast.success("Recording transcribed — notes updated");
    router.refresh();
    return data.transcript;
  }

  return (
    <div className="mt-2">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/mp4,.mp3,.m4a,.wav,.webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" /> Transcribing…
          </>
        ) : (
          <>
            <Mic size={12} /> Upload recording
          </>
        )}
      </button>
      <p className="mt-1 text-[10px] text-slate-400">MP3, M4A, WAV, WebM, or MP4 · max 50 MB</p>
      {error ? (
        <div className="mt-2">
          <AiStatusBanner message={error} />
        </div>
      ) : null}
    </div>
  );
}
