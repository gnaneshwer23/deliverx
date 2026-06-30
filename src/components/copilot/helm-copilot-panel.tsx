"use client";

import { useRef, useState, useTransition } from "react";
import { Compass, Loader2 } from "lucide-react";
import {
  HELM_DISCLAIMER,
  HELM_NAME,
  HELM_QUICK_CHIPS,
  helmWelcomeMessage,
} from "@/config/helm-copilot";
import { AiConfigBanner } from "@/components/ai/ai-config-banner";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";
import type { MissionPersonaId } from "@/lib/mission-nav";
import type { HelmChatMessage } from "@/services/helmCopilot";

type HelmCopilotPanelProps = {
  personaId: MissionPersonaId;
  projects: Array<{ id: string; name: string }>;
  defaultProjectId?: string | null;
  compact?: boolean;
  embedded?: boolean;
  showContextBar?: boolean;
};

export function HelmCopilotPanel({
  personaId,
  projects,
  defaultProjectId,
  compact = false,
  embedded = false,
  showContextBar = true,
}: HelmCopilotPanelProps) {
  const initialProjectId = defaultProjectId ?? projects[0]?.id ?? "";
  const initialProjectName =
    projects.find((p) => p.id === initialProjectId)?.name ?? projects[0]?.name ?? null;

  const [projectId, setProjectId] = useState(initialProjectId);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emptyHint, setEmptyHint] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<HelmChatMessage[]>(() => [
    {
      role: "assistant",
      content: helmWelcomeMessage(personaId, projects.length > 0, initialProjectName),
    },
  ]);

  const projectName = projects.find((p) => p.id === projectId)?.name ?? null;
  const quickChips = HELM_QUICK_CHIPS[personaId];

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const next: HelmChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/helm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next,
            personaId,
            projectId: projectId || undefined,
          }),
        });
        const data = (await res.json()) as {
          reply?: string;
          error?: string;
          code?: string;
          context?: { emptyHint?: string; hasLiveData?: boolean };
        };
        if (!res.ok) {
          const msg =
            data.code === "ai_not_configured"
              ? `${HELM_NAME} needs AI configured. Add OPENAI_API_KEY in Settings, then redeploy.`
              : (data.error ?? `${HELM_NAME} is unavailable`);
          setError(msg);
          return;
        }
        if (data.context?.emptyHint && !data.context.hasLiveData) {
          setEmptyHint(data.context.emptyHint);
        }
        const reply = data.reply?.trim();
        if (!reply) {
          setError(`${HELM_NAME} returned an empty response.`);
          return;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      } catch {
        setError(`Could not reach ${HELM_NAME}. Try again.`);
      }
    });
  }

  const contextLabel =
    projectName ?? (projects.length ? "Select a project" : "No projects in scope");

  const shellClass = embedded
    ? "min-h-[360px] max-h-[520px] rounded-xl shadow-sm"
    : compact
      ? "h-full"
      : "min-h-[420px] rounded-xl shadow-sm";

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden border border-[#E4E4DC] bg-white ${shellClass}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[#E4E4DC] bg-[#F7F7F2] px-4 py-3">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-[#1C4A2E]" aria-hidden />
          <div>
            <h3 className={`${dxClass.display} text-base text-[#0D0D0B]`}>{HELM_NAME}</h3>
            <p className="text-xs text-[#6B6B64]">Ask Helm — navigates your delivery signals</p>
          </div>
        </div>
        {showContextBar && projects.length > 0 ? (
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="max-w-[160px] border border-[#E4E4DC] bg-white px-2 py-1 text-xs outline-none focus:border-[#1C4A2E]"
            aria-label="Project context"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No projects in your scope yet. {emptyHint ?? "Join a workspace or ask your PM for access."}
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className={`flex-1 space-y-4 overflow-y-auto ${
          compact || embedded ? "px-4 py-4" : "px-5 py-5"
        }`}
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
              {m.role === "user" ? "U" : "H"}
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
            </div>
          </div>
        ))}
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-[#A8A89E]">
            <Loader2 size={14} className="animate-spin" />
            {HELM_NAME} is reading your signals…
          </div>
        ) : null}
        {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
      </div>

      <div
        className={`shrink-0 border-t border-[#E4E4DC] bg-white ${
          compact || embedded ? "p-3" : "p-4"
        }`}
      >
        <div className="mb-2 flex flex-wrap gap-1">
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => send(chip)}
              disabled={isPending || projects.length === 0}
              className="border border-[#C6DDD0] bg-[#EEF5F1] px-2.5 py-1 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.08em] text-[#1C4A2E] hover:bg-[#1C4A2E] hover:text-white disabled:opacity-40"
            >
              {chip.split(" ").slice(0, 3).join(" ")}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={compact || embedded ? 2 : 2}
            placeholder={
              projects.length
                ? `Ask ${HELM_NAME} about ${contextLabel}…`
                : `Ask ${HELM_NAME} — connect a project first`
            }
            disabled={isPending}
            className="min-h-0 flex-1 resize-none border border-[#E4E4DC] px-3 py-2 text-sm outline-none focus:border-[#1C4A2E]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <button
            type="button"
            disabled={isPending || !input.trim()}
            onClick={() => send(input)}
            className={`${dxClass.btnSm} self-end disabled:opacity-40`}
          >
            Ask →
          </button>
        </div>
        <DxCaps className="mt-1.5 block text-[7px] text-[#A8A89E]">{HELM_DISCLAIMER}</DxCaps>
      </div>
    </div>
  );
}
