"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import { dxClass } from "@/lib/dx-theme";

type ChatLine = { role: "user" | "assistant"; content: string };

type DiscoveryResponse = {
  ok: true;
  complete: boolean;
  summary: string;
  questions: string[];
};

export function ProjectDiscoveryChat({
  onComplete,
}: {
  onComplete: (payload: { brief: string; answers: Record<string, string> }) => void;
}) {
  const [messages, setMessages] = useState<ChatLine[]>([
    {
      role: "assistant",
      content:
        "Tell me about the programme you want to deliver — goals, scope, timeline, stakeholders, and constraints. I'll ask a few follow-up questions, then we'll review readiness and create your project.",
    },
  ]);
  const [input, setInput] = useState("");
  const [brief, setBrief] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pendingQuestions, setPendingQuestions] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function askDiscovery(nextBrief: string, nextAnswers: Record<string, string>) {
    startTransition(async () => {
      setError(null);
      const res = await postAi<DiscoveryResponse>("/api/ai/project-discovery", {
        brief: nextBrief,
        answers: nextAnswers,
      });
      if (!res.ok) {
        setError(aiErrorMessage(res));
        return;
      }
      if (res.data.complete || res.data.questions.length === 0) {
        const enriched = res.data.summary
          ? `${nextBrief}\n\nDiscovery summary: ${res.data.summary}`
          : nextBrief;
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "Thanks — I have enough context. Moving you to AI business-case review and project setup…",
          },
        ]);
        onComplete({ brief: enriched, answers: nextAnswers });
        return;
      }
      setPendingQuestions(res.data.questions);
      setQuestionIndex(0);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `I have ${res.data.questions.length} follow-up question(s). First: ${res.data.questions[0]}`,
        },
      ]);
    });
  }

  function submit() {
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");

    if (pendingQuestions.length > 0) {
      const q = pendingQuestions[questionIndex];
      const nextAnswers = { ...answers, [q]: trimmed };
      setAnswers(nextAnswers);

      const nextIndex = questionIndex + 1;
      if (nextIndex < pendingQuestions.length) {
        setQuestionIndex(nextIndex);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `Next question (${nextIndex + 1} of ${pendingQuestions.length}): ${pendingQuestions[nextIndex]}`,
          },
        ]);
        return;
      }

      setPendingQuestions([]);
      setQuestionIndex(0);
      askDiscovery(brief, nextAnswers);
      return;
    }

    const nextBrief = brief ? `${brief}\n\n${trimmed}` : trimmed;
    setBrief(nextBrief);
    askDiscovery(nextBrief, answers);
  }

  return (
    <div className="flex flex-col rounded-lg border border-[#E4E4DC] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E4E4DC] bg-[#F7F7F2] px-3 py-2">
        <Sparkles size={14} className="text-[#1C4A2E]" />
        <span className="text-sm font-medium text-[#1C4A2E]">Guided questionnaire</span>
      </div>

      <div ref={scrollRef} className="max-h-[320px] space-y-3 overflow-y-auto px-3 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[90%] px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[#1C4A2E] text-white"
                  : "border border-[#E4E4DC] bg-[#FAFAF5] text-[#2C2C28]"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {isPending ? (
          <p className="flex items-center gap-2 text-xs text-[#A8A89E]">
            <Loader2 size={12} className="animate-spin" /> Thinking…
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="border-t border-[#E4E4DC] px-3 py-2 text-sm text-[#C0392B]">{error}</p>
      ) : null}

      <div className="flex gap-2 border-t border-[#E4E4DC] p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder={
            pendingQuestions.length
              ? "Type your answer…"
              : "Describe your transformation or programme…"
          }
          className="min-h-0 flex-1 resize-none border border-[#E4E4DC] px-3 py-2 text-sm outline-none focus:border-[#1C4A2E]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          disabled={isPending || !input.trim()}
          onClick={submit}
          className={`${dxClass.btnSm} self-end disabled:opacity-40`}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
