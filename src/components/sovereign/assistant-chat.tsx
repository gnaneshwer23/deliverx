"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/services/assistant";
import { sovereignClass } from "@/lib/sovereign-theme";

const STARTERS = [
  "What needs attention across my portfolio this week?",
  "Summarise open risks and pending decisions.",
  "How should I structure a weekly status report?",
  "What governance gaps should I close first?",
];

export function AssistantChat({
  projects,
}: {
  projects: Array<{ id: string; name: string }>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next,
            projectId: projectId || undefined,
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Assistant unavailable");
          return;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "" }]);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      } catch {
        setError("Could not reach the assistant. Try again.");
      }
    });
  }

  return (
    <div className={`${sovereignClass.card} flex h-[calc(100vh-12rem)] flex-col overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a1a]/8 px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#6ee7c7]" />
          <span className={sovereignClass.sectionTitle}>Delivery assistant</span>
        </div>
        {projects.length > 0 ? (
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="h-9 rounded-full border border-[#1a1a1a]/12 bg-[#f5f2ed] px-4 text-xs text-[#4b5563] outline-none focus:border-[#6ee7c7]/50"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-lg text-center">
            <p className="text-sm text-[#4b5563]">
              Ask about delivery health, governance, reporting, or planning. Answers use your live
              workspace context — nothing is auto-applied without your approval.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-[#1a1a1a]/10 bg-[#f5f2ed] px-4 py-2 text-left text-xs text-[#4b5563] transition hover:border-[#6ee7c7]/40 hover:text-[#1a1a1a]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0a0e14] text-[#f8f6f2]"
                    : "border border-[#1a1a1a]/8 bg-[#f5f2ed] text-[#1a1a1a]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
            <Loader2 size={14} className="animate-spin" />
            Thinking…
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      <form
        className="border-t border-[#1a1a1a]/8 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about delivery, governance, or planning…"
            disabled={isPending}
            className="h-11 flex-1 rounded-full border border-[#1a1a1a]/12 bg-white px-5 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#6ee7c7]/50 focus:ring-2 focus:ring-[#6ee7c7]/15 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0a0e14] text-[#6ee7c7] transition hover:bg-[#111820] disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
