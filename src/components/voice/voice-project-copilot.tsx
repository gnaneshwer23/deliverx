"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Mic, MicOff, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import type { ProjectMemoryHit } from "@/services/projectMemoryRag";
import type { VoiceProjectLogRow, VoiceUpdateExtract } from "@/services/voiceProjectUpdate";
import { dxClass } from "@/lib/dx-theme";

type AskResponse = {
  ok: true;
  answer: string;
  projectName: string;
  ragSources: ProjectMemoryHit[];
};

type UpdateResponse = {
  ok: true;
  extract: VoiceUpdateExtract;
  projectName: string;
};

type Mode = "ask" | "update";

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceProjectCopilot({
  projectId,
  projectName,
  recentLogs,
}: {
  projectId: string;
  projectName: string;
  recentLogs: VoiceProjectLogRow[];
}) {
  const [mode, setMode] = useState<Mode>("ask");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [extract, setExtract] = useState<VoiceUpdateExtract | null>(null);
  const [ragSources, setRagSources] = useState<ProjectMemoryHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  function speak(text: string) {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  async function transcribeBlob(blob: Blob) {
    setError(null);
    const body = new FormData();
    body.append("file", blob, "voice.webm");
    const res = await fetch(`/api/project/${projectId}/voice/transcribe`, {
      method: "POST",
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Transcription failed");
    }
    return String(data.transcript ?? "");
  }

  function startBrowserListen() {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      toast.error("Browser speech recognition not supported — type or record audio instead.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(text);
      setListening(false);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Could not capture speech");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopBrowserListen() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        try {
          const text = await transcribeBlob(blob);
          setTranscript(text);
          toast.success("Transcribed");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Transcription failed");
        }
      };
      mediaRef.current = recorder;
      recorder.start();
      setListening(true);
    } catch {
      toast.error("Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setListening(false);
  }

  function submit() {
    const text = transcript.trim();
    if (!text) return;
    setError(null);
    setAnswer(null);
    setExtract(null);
    setRagSources([]);

    startTransition(async () => {
      if (mode === "ask") {
        const res = await postAi<AskResponse>(`/api/project/${projectId}/voice/ask`, {
          question: text,
        });
        if (!res.ok) {
          setError(aiErrorMessage(res));
          return;
        }
        setAnswer(res.data.answer);
        setRagSources(res.data.ragSources ?? []);
        toast.success("Answer ready");
      } else {
        const res = await postAi<UpdateResponse>(`/api/project/${projectId}/voice/update`, {
          transcript: text,
        });
        if (!res.ok) {
          setError(aiErrorMessage(res));
          return;
        }
        setExtract(res.data.extract);
        toast.success("Update recorded");
      }
    });
  }

  return (
    <section className={`${dxClass.card} p-6`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Voice project copilot</h3>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Ask delivery questions or record a spoken status update for {projectName}. Answers
            use live intelligence plus RAG project memory.
          </p>
        </div>
        <div className="flex rounded-lg border border-[#E4E4DC] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("ask")}
            className={`rounded-md px-3 py-1.5 font-medium ${
              mode === "ask" ? "bg-[#EEF5F1] text-[#1C4A2E]" : "text-[#6B6B64]"
            }`}
          >
            Ask
          </button>
          <button
            type="button"
            onClick={() => setMode("update")}
            className={`rounded-md px-3 py-1.5 font-medium ${
              mode === "update" ? "bg-[#EEF5F1] text-[#1C4A2E]" : "text-[#6B6B64]"
            }`}
          >
            Record update
          </button>
        </div>
      </div>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={3}
        placeholder={
          mode === "ask"
            ? "Ask: Are we on track for go-live?"
            : "Speak or paste your weekly status update…"
        }
        className="w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={listening ? stopBrowserListen : startBrowserListen}
          className={`${dxClass.btnGhost} inline-flex items-center gap-1.5 text-xs`}
        >
          {listening ? <MicOff size={14} /> : <Mic size={14} />}
          {listening ? "Stop listen" : "Listen"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={listening ? stopRecording : startRecording}
          className={`${dxClass.btnGhost} inline-flex items-center gap-1.5 text-xs`}
        >
          <Mic size={14} />
          {listening ? "Stop record" : "Record (Whisper)"}
        </button>
        <button
          type="button"
          disabled={isPending || !transcript.trim()}
          onClick={submit}
          className={`${dxClass.btnPrimary} inline-flex items-center gap-1.5 text-xs`}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          {mode === "ask" ? "Get answer" : "Save update"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

      {answer ? (
        <div className="mt-4 space-y-3 rounded-lg border border-[#C6DDD0] bg-[#EEF5F1]/40 p-4">
          <p className="text-sm leading-relaxed">{answer}</p>
          <div className="flex flex-wrap gap-2">
            {speaking ? (
              <button
                type="button"
                onClick={stopSpeaking}
                className="inline-flex items-center gap-1 rounded border border-[#E4E4DC] px-3 py-1.5 text-xs"
              >
                <Square size={12} />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => speak(answer)}
                className="inline-flex items-center gap-1 rounded bg-[#0F766E] px-3 py-1.5 text-xs font-medium text-white"
              >
                <Volume2 size={12} />
                Listen
              </button>
            )}
          </div>
          {ragSources.length > 0 ? (
            <div className="border-t border-[#C6DDD0]/60 pt-3">
              <p className="mb-2 text-xs font-medium text-[#6B6B64]">RAG sources</p>
              <ul className="space-y-1 text-xs text-[#6B6B64]">
                {ragSources.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    {s.sourceType}
                    {s.title ? `: ${s.title}` : ""}
                    {s.similarity != null
                      ? ` (${Math.round(s.similarity * 100)}%)`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {extract ? (
        <div className="mt-4 space-y-2 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] p-4 text-sm">
          <p className="font-medium">{extract.summary}</p>
          {extract.highlights.length > 0 ? (
            <p className="text-[#6B6B64]">
              Highlights: {extract.highlights.join(" · ")}
            </p>
          ) : null}
          {extract.blockers.length > 0 ? (
            <p className="text-[#6B6B64]">Blockers: {extract.blockers.join(" · ")}</p>
          ) : null}
          {extract.decisionsNeeded.length > 0 ? (
            <p className="text-[#6B6B64]">
              Decisions: {extract.decisionsNeeded.join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}

      {recentLogs.length > 0 ? (
        <div className="mt-6 border-t border-[#F0F0E8] pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#A8A89E]">
            Recent voice activity
          </p>
          <ul className="space-y-2 text-xs text-[#6B6B64]">
            {recentLogs.slice(0, 5).map((log) => (
              <li key={log.id} className="rounded border border-[#F0F0E8] px-3 py-2">
                <span className="font-medium capitalize text-[#0D0D0B]">{log.kind}</span>
                {" · "}
                {new Date(log.created_at).toLocaleString()}
                <p className="mt-1 line-clamp-2">{log.transcript}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
