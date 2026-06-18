"use client";

import { useState, useTransition } from "react";
import { Loader2, MessageCircleQuestion } from "lucide-react";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";

type BriefingResponse = { ok: true; answer: string; projectName: string };

const STARTERS = [
  "What is blocking go-live?",
  "Are we on track to deliver?",
  "What needs a steering decision this week?",
];

export function DeliveryBriefingPanel({ projectId }: { projectId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setError(null);
    setQuestion(trimmed);
    startTransition(async () => {
      const res = await postAi<BriefingResponse>(`/api/project/${projectId}/briefing`, {
        question: trimmed,
      });
      if (!res.ok) {
        setError(aiErrorMessage(res));
        return;
      }
      setAnswer(res.data.answer);
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <MessageCircleQuestion size={16} className="text-teal-700" />
        <h3 className="font-semibold">Sponsor Q&amp;A</h3>
      </div>
          <p className="mb-3 text-sm text-slate-500">
            Read-only answers from project forecast, RAID, intelligence, and RAG memory — no
            actions are taken.
          </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={isPending}
            onClick={() => ask(s)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about delivery status, risks, or timeline…"
          className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending || !question.trim()}
          className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : "Ask"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-rose-600">{error}</p>
      ) : null}
      {answer ? (
        <div className="mt-4 rounded-lg bg-teal-50/80 p-4 text-sm text-slate-800">
          {answer}
        </div>
      ) : null}
    </section>
  );
}
