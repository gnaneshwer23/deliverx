"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Loader2, Plus, Send } from "lucide-react";
import type { ChatMessage } from "@/services/assistant";
import { AiConfigBanner } from "@/components/ai/ai-config-banner";
import { DxBadge } from "@/components/dx/dx-badge";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

const STARTERS = [
  "Generate RAID log with all detected risks",
  "Update milestone confidence scores",
  "Create full stakeholder map",
  "Generate governance framework",
  "Write executive summary report",
];

export function AiWorkspace({
  projects,
}: {
  projects: Array<{ id: string; name: string }>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
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
            messages: next.filter((m) => m.role === "user" || m.role === "assistant"),
            projectId: projectId || undefined,
          }),
        });
        const data = (await res.json()) as {
          reply?: string;
          error?: string;
          code?: string;
        };
        if (!res.ok) {
          const msg =
            data.code === "ai_not_configured"
              ? "AI is not configured. Add MINIMAX_API_KEY or ANTHROPIC_API_KEY in Settings, then redeploy."
              : (data.error ?? "Assistant unavailable");
          setError(msg);
          return;
        }
        const reply = data.reply?.trim();
        if (!reply) {
          setError("Assistant returned an empty response. Check API keys in Settings.");
          return;
        }
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      } catch {
        setError("Could not reach the assistant. Try again.");
      }
    });
  }

  const contextLabel =
    projects.find((p) => p.id === projectId)?.name ??
    (projects[0]?.name ? `${projects[0].name} — Active context` : "All projects — Active context");

  return (
    <div className="grid h-[calc(100vh-var(--dx-navh))] grid-cols-1 overflow-hidden lg:grid-cols-[210px_1fr_290px]">
      {/* Left — workspaces */}
      <aside className="hidden border-r border-[#E4E4DC] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[#E4E4DC] p-3">
          <DxCaps className="mb-2 block">AI Workspaces</DxCaps>
          <Link
            href="/project/new?mode=chat"
            className={`${dxClass.btnSm} w-full justify-center text-[8px]`}
          >
            <Plus size={12} /> New programme (guided)
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5">
          <DxCaps className="px-2 py-1.5 text-[7px]">Recent</DxCaps>
          {projects.length === 0 ? (
            <div className="space-y-2 px-3 py-2">
              <p className="text-xs text-[#A8A89E]">No projects yet.</p>
              <Link
                href="/project/new?mode=chat"
                className="block text-xs font-medium text-[#1C4A2E] underline"
              >
                Start guided questionnaire →
              </Link>
            </div>
          ) : (
            projects.slice(0, 8).map((p) => {
              const active = p.id === projectId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProjectId(p.id)}
                  className={`w-full border-t-2 px-3 py-2.5 text-left ${active ? "border-[#1C4A2E] bg-[#EEF5F1]" : "border-transparent hover:bg-[#F7F7F2]"}`}
                >
                  <DxCaps className="text-[7px]">Project</DxCaps>
                  <div className={`text-[13px] font-medium ${active ? "text-[#1C4A2E]" : "text-[#0D0D0B]"}`}>
                    {p.name}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Centre — chat */}
      <div className="flex min-w-0 flex-col bg-[#FAFAF5]">
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

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6">
          <AiConfigBanner />
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-dx-display)] text-[11px] text-white ${
                  m.role === "user" ? "bg-[#0D0D0B]" : "bg-[#1C4A2E]"
                }`}
              >
                {m.role === "user" ? "U" : "D"}
              </div>
              <div className={`max-w-[85%] ${m.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`px-3.5 py-2.5 text-sm font-light leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1C4A2E] text-white"
                      : "border border-[#E4E4DC] bg-white text-[#2C2C28]"
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
              Thinking…
            </div>
          ) : null}
          {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}
        </div>

        <div className="shrink-0 border-t border-[#E4E4DC] bg-white p-3.5">
          <div className="mb-2 flex flex-wrap gap-1">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
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
                className="hidden max-w-[140px] border border-[#E4E4DC] bg-[#F7F7F2] px-2 py-2 text-xs outline-none sm:block"
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
              rows={2}
              placeholder="Describe your programme or ask about your project…"
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
              Send →
            </button>
          </div>
          <DxCaps className="mt-1.5 block text-[7px] text-[#A8A89E]">
            Enter to send · AI has workspace context · Nothing auto-applies without approval
          </DxCaps>
        </div>
      </div>

      {/* Right — system panel */}
      <aside className="hidden border-l border-[#E4E4DC] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[#E4E4DC] px-3 pt-1">
          <div className="flex gap-0">
            <button type="button" className="border-b-2 border-[#1C4A2E] px-3 py-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#1C4A2E]">
              System
            </button>
            <button type="button" className="px-3 py-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#A8A89E]">
              Risks
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <DxCaps className="mb-2 block">Projects</DxCaps>
          {projects.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-[#A8A89E]">No projects yet.</p>
              <Link href="/project/new" className="text-xs font-medium text-[#1C4A2E] underline">
                Create project →
              </Link>
            </div>
          ) : (
            projects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="mb-1.5 border border-[#E4E4DC] border-l-[3px] border-l-[#2D7048] px-2.5 py-2"
              >
                <div className="text-[13px] font-medium">{p.name}</div>
                <DxCaps className="text-[7px]">Active</DxCaps>
              </div>
            ))
          )}
          <DxCaps className="mb-2 mt-4 block">Guardrails</DxCaps>
          <div className="border border-[#C6DDD0] bg-[#EEF5F1] p-2.5 text-xs leading-relaxed text-[#2C2C28]">
            Preview → approve → persist. AI suggests; your team decides.
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            <DxBadge tone="accent">RAID</DxBadge>
            <DxBadge tone="green">Reports</DxBadge>
            <DxBadge tone="blue">Decisions</DxBadge>
          </div>
        </div>
      </aside>
    </div>
  );
}
