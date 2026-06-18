"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  FOUNDER_BUSINESS_GOALS,
  FOUNDER_COMPANY_TYPES,
} from "@/lib/founder/constants";
import { dxClass } from "@/lib/dx-theme";

export function FounderContextWorkspace({
  companyType,
  businessGoals,
  extractionStatus,
}: {
  companyType?: string | null;
  businessGoals?: string[];
  extractionStatus?: string;
}) {
  const [selectedType, setSelectedType] = useState(companyType ?? "saas_startup");
  const [goals, setGoals] = useState<string[]>(businessGoals ?? []);
  const [content, setContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [status, setStatus] = useState(extractionStatus ?? "pending");
  const [assistantQ, setAssistantQ] = useState("");
  const [assistantA, setAssistantA] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  function toggleGoal(value: string) {
    setGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value],
    );
  }

  async function runAnalysis() {
    setExtracting(true);
    try {
      const res = await fetch("/api/founder/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyType: selectedType,
          businessGoals: goals,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      toast.success("Founder analysis complete");
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
      const res = await fetch("/api/founder/assistant", {
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
          <h3 className={`${dxClass.display} text-lg`}>Company context</h3>
          <span className="text-xs text-[#A8A89E]">
            {status === "complete" ? "Analysis complete" : "Pending analysis"}
          </span>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Company type</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          >
            {FOUNDER_COMPANY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Business goals</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {FOUNDER_BUSINESS_GOALS.map((g) => {
              const active = goals.includes(g.value);
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => toggleGoal(g.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                      : "border-[#E4E4DC] text-[#6B6B64]"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="block text-sm">
          <span className="font-medium">Upload context</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Paste business case, pitch deck, financial model, or investor deck…"
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
          {extracting ? "Analysing…" : "Run AI founder analysis"}
        </button>
      </div>

      <div className={`${dxClass.card} space-y-4 p-6`}>
        <h3 className={`${dxClass.display} flex items-center gap-2 text-lg`}>
          <MessageSquare size={18} />
          AI founder assistant
        </h3>
        <form onSubmit={askAssistant} className="space-y-3">
          <textarea
            value={assistantQ}
            onChange={(e) => setAssistantQ(e.target.value)}
            rows={3}
            placeholder="e.g. What threatens our roadmap? Generate investor update."
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
          <div className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1]/40 p-4 text-sm whitespace-pre-wrap">
            {assistantA}
          </div>
        ) : null}
      </div>
    </div>
  );
}
