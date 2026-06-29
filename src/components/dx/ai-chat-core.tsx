"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { ChatMessage } from "@/services/assistant";
import type { ProposedAction } from "@/services/assistantActions";
import { AssistantActionCards } from "@/components/assistant/assistant-action-cards";
import { AiConfigBanner } from "@/components/ai/ai-config-banner";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

export const AI_QUICK_CHIPS = [
  "Generate RAID log with all detected risks",
  "Update milestone confidence scores",
  "Create full stakeholder map",
  "Generate governance framework",
  "Write executive summary report",
];

type UiMessage = ChatMessage & { proposedActions?: ProposedAction[] };

export function AiChatCore({
  projects,
  compact = false,
  onSent,
}: {
  projects: Array<{ id: string; name: string }>;
  compact?: boolean;
  onSent?: () => void;
}) {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      role: "assistant",
      content:
        "AI Delivery Workspace ready. Describe any programme, project, or transformation — I will generate operational architecture grounded in your workspace. All outputs require PM review before applying.",
    },
  ]);
  const [input, setInput] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function dsend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const next: UiMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);
    onSent?.();

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.filter((m) => m.role === "user" || m.role === "assistant"),
            projectId: projectId || undefined,
          }),
        });
        const data = (await res.json()) as {
          reply?: string;
          proposedActions?: ProposedAction[];
          error?: string;
          code?: string;
        };
        if (!res.ok) {
          const msg =
            data.code === "ai_not_configured"
              ? "AI is not configured. Add OPENAI_API_KEY in Settings, then redeploy."
              : (data.error ?? "Assistant unavailable");
          setError(msg);
          return;
        }
        const reply = data.reply?.trim();
        if (!reply) {
          setError("Assistant returned an empty response. Check API keys in Settings.");
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply,
            proposedActions: data.proposedActions ?? [],
          },
        ]);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      } catch {
        setError("Could not reach the assistant. Try again.");
      }
    });
  }

  function dquick(label: string) {
    dsend(label);
  }

  const contextLabel =
    projects.find((p) => p.id === projectId)?.name ??
    (projects[0]?.name ? `${projects[0].name} — Active context` : "All projects — Active context");

  return (
    <div className={`flex min-h-0 flex-col ${compact ? "h-full" : "min-h-[480px]"}`}>
      {!compact ? (
        <div className="flex shrink-0 items-center justify-between border-b border-[#E4E4DC] bg-white px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full bg-[#1A6B3A]"
              style={{ animation: "dx-pulse 2s ease-in-out infinite" }}
            />
            <DxCaps>AI Delivery Architect</DxCaps>
          </div>
          <DxCaps accent className="hidden text-[7px] sm:block">
            {contextLabel}
          </DxCaps>
        </div>
      ) : (
        <div className="shrink-0 border-b border-[#E4E4DC] bg-[#F7F7F2] px-4 py-2">
          <DxCaps accent className="text-[7px]">
            {contextLabel}
          </DxCaps>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`flex-1 space-y-4 overflow-y-auto ${compact ? "bg-white px-4 py-4" : "bg-[var(--dx-page)] px-5 py-5 md:px-6"}`}
      >
        <AiConfigBanner />
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-dx-display)] text-[11px] ${
                m.role === "user"
                  ? "bg-[#EEF5F1] text-[#1C4A2E]"
                  : "bg-[#1C4A2E] text-white"
              }`}
            >
              {m.role === "user" ? "U" : "D"}
            </div>
            <div className={`max-w-[85%] ${m.role === "user" ? "text-right" : ""}`}>
              <div
                className={`rounded-xl px-3.5 py-2.5 text-sm font-light leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#EEF5F1] text-[#0D0D0B]"
                    : "border border-[var(--dx-rul)] bg-white text-[#2C2C28] shadow-[var(--dx-shadow-sm)]"
                }`}
              >
                {m.content}
              </div>
              {m.role === "assistant" && m.proposedActions?.length ? (
                <AssistantActionCards actions={m.proposedActions} />
              ) : null}
            </div>
          </div>
        ))}
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-[#A8A89E]">
            <Loader2 size={14} className="animate-spin" />
            Thinking…
          </div>
        ) : null}
        {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
      </div>

      <div className={`shrink-0 border-t border-[#E4E4DC] bg-white ${compact ? "p-3" : "p-3.5"}`}>
        <div className="mb-2 flex flex-wrap gap-1">
          {AI_QUICK_CHIPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => dquick(s)}
              className="border border-[#C6DDD0] bg-[#EEF5F1] px-2.5 py-1 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.08em] text-[#1C4A2E] hover:bg-[#1C4A2E] hover:text-white"
            >
              {s.split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {projects.length > 0 ? (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={`hidden max-w-[140px] border border-[#E4E4DC] bg-[#F7F7F2] px-2 py-2 text-xs outline-none ${compact ? "sm:max-w-[120px]" : "sm:block"}`}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : null}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={compact ? 2 : 2}
            placeholder="Describe your programme or ask about your project…"
            className="min-h-0 flex-1 resize-none border border-[#E4E4DC] px-3 py-2 text-sm outline-none focus:border-[#1C4A2E]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                dsend(input);
              }
            }}
          />
          <button
            type="button"
            disabled={isPending || !input.trim()}
            onClick={() => dsend(input)}
            className={`${dxClass.btnSm} self-end disabled:opacity-40`}
          >
            Send →
          </button>
        </div>
        <DxCaps className="mt-1.5 block text-[7px] text-[#A8A89E]">
          Enter to send · AI has workspace context · Nothing auto-applies without approval
        </DxCaps>
        {compact ? (
          <Link
            href="/workspace/assistant"
            className="mt-2 inline-block text-xs font-medium text-[#1C4A2E] hover:underline"
          >
            Open full AI workspace →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
