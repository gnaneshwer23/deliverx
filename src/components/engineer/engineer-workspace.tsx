"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ENGINEER_SPECIALISATIONS,
  ENGINEER_TECH_STACK,
} from "@/lib/engineer/constants";
import { dxClass } from "@/lib/dx-theme";

export function EngineerWorkspace({
  projectId,
  projectName,
  specialisation,
  techStack,
  extractionStatus,
}: {
  projectId: string;
  projectName: string;
  specialisation?: string | null;
  techStack?: Record<string, string[]>;
  extractionStatus?: string;
}) {
  const [selectedSpec, setSelectedSpec] = useState(specialisation ?? "fullstack");
  const [stack, setStack] = useState<Record<string, string[]>>({
    frontend: techStack?.frontend ?? ["Next.js"],
    backend: techStack?.backend ?? ["Node.js"],
    cloud: techStack?.cloud ?? ["AWS"],
  });
  const [extraContent, setExtraContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [status, setStatus] = useState(extractionStatus ?? "pending");
  const [assistantQ, setAssistantQ] = useState("");
  const [assistantA, setAssistantA] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  function toggleStack(category: keyof typeof ENGINEER_TECH_STACK, value: string) {
    setStack((prev) => {
      const current = prev[category] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: next.length ? next : [value] };
    });
  }

  async function runAnalysis() {
    setExtracting(true);
    try {
      const res = await fetch(`/api/project/${projectId}/engineering/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialisation: selectedSpec,
          techStack: stack,
          content: extraContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      toast.success("Engineering workspace generated");
      setStatus("complete");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setExtracting(false);
    }
  }

  async function askAssistant(e: React.FormEvent) {
    e.preventDefault();
    if (!assistantQ.trim()) return;
    setAsking(true);
    try {
      const res = await fetch(`/api/project/${projectId}/engineering-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: assistantQ }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Assistant failed");
      setAssistantA(data.answer);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assistant failed");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className={`${dxClass.card} space-y-4 p-6`}>
        <div className="flex items-center justify-between">
          <h3 className={`${dxClass.display} text-lg`}>Engineering setup — {projectName}</h3>
          <span className="text-xs text-[#A8A89E]">
            {status === "complete" ? "Workspace ready" : "Pending generation"}
          </span>
        </div>

        <label className="block text-sm">
          <span className="font-medium">Specialisation</span>
          <select
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          >
            {ENGINEER_SPECIALISATIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {(Object.keys(ENGINEER_TECH_STACK) as Array<keyof typeof ENGINEER_TECH_STACK>).map(
          (category) => (
            <fieldset key={category}>
              <legend className="text-sm font-medium capitalize">{category}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ENGINEER_TECH_STACK[category].map((tech) => {
                  const active = (stack[category] ?? []).includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleStack(category, tech)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        active
                          ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                          : "border-[#E4E4DC] text-[#6B6B64]"
                      }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ),
        )}

        <label className="block text-sm">
          <span className="font-medium">Additional context (optional)</span>
          <textarea
            value={extraContent}
            onChange={(e) => setExtraContent(e.target.value)}
            rows={4}
            placeholder="Paste technical notes, ADRs, or architecture docs…"
            className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          onClick={runAnalysis}
          disabled={extracting}
          className={`${dxClass.btnPrimary} inline-flex items-center gap-2`}
        >
          {extracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {extracting ? "Generating workspace…" : "Generate AI engineering workspace"}
        </button>
      </div>

      <div className={`${dxClass.card} space-y-4 p-6`}>
        <h3 className={`${dxClass.display} flex items-center gap-2 text-lg`}>
          <MessageSquare size={18} />
          AI engineering assistant
        </h3>
        <form onSubmit={askAssistant} className="space-y-3">
          <textarea
            value={assistantQ}
            onChange={(e) => setAssistantQ(e.target.value)}
            rows={3}
            placeholder="e.g. Generate API contract for reports endpoint, or explain requirement US-45"
            className="w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={asking || !assistantQ.trim()}
            className={`${dxClass.btnPrimary} inline-flex items-center gap-2`}
          >
            {asking ? <Loader2 size={14} className="animate-spin" /> : null}
            Ask assistant
          </button>
        </form>
        {assistantA ? (
          <div className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1]/40 p-4 text-sm whitespace-pre-wrap font-mono">
            {assistantA}
          </div>
        ) : null}
      </div>
    </div>
  );
}
