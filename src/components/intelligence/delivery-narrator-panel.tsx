"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import type { NarratorBriefing } from "@/services/deliveryNarrator";

type NarratorResponse = { ok: true; briefing: NarratorBriefing };

export function DeliveryNarratorPanel({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [briefing, setBriefing] = useState<NarratorBriefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  function generate() {
    setError(null);
    startTransition(async () => {
      const res = await postAi<NarratorResponse>(`/api/project/${projectId}/narrator`, {});
      if (!res.ok) {
        setError(aiErrorMessage(res));
        return;
      }
      setBriefing(res.data.briefing);
    });
  }

  function speak() {
    if (!briefing?.script || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(briefing.script);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Delivery narrator</h3>
          <p className="mt-1 text-sm text-slate-500">
            Two-minute executive briefing from forecast, health, and blockers for{" "}
            {projectName}.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={generate}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-violet-600 px-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Mic size={14} />
          )}
          {briefing ? "Regenerate" : "Generate briefing"}
        </button>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {briefing ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            ~{briefing.estimatedMinutes} min · {briefing.wordCount} words
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {briefing.script}
          </p>
          <div className="flex flex-wrap gap-2">
            {speaking ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center gap-1 rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Square size={12} />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={speak}
                className="inline-flex items-center gap-1 rounded bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
              >
                <Volume2 size={12} />
                Listen
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          Generate a spoken briefing for sponsors — uses live delivery intelligence, not
          static dashboard copy.
        </p>
      )}
    </section>
  );
}
