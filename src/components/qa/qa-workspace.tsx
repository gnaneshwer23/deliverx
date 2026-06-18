"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { QA_SPECIALISATIONS, QA_TESTING_TOOLS } from "@/lib/qa/constants";
import { dxClass } from "@/lib/dx-theme";

export function QaWorkspace({
  projectId,
  projectName,
  specialisation,
  testingTools,
  extractionStatus,
}: {
  projectId: string;
  projectName: string;
  specialisation?: string | null;
  testingTools?: string[];
  extractionStatus?: string;
}) {
  const [spec, setSpec] = useState(specialisation ?? "manual");
  const [tools, setTools] = useState<string[]>(testingTools ?? ["playwright"]);
  const [content, setContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [status, setStatus] = useState(extractionStatus ?? "pending");
  const [assistantQ, setAssistantQ] = useState("");
  const [assistantA, setAssistantA] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  function toggleTool(value: string) {
    setTools((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
  }

  async function runAnalysis() {
    setExtracting(true);
    try {
      const res = await fetch(`/api/project/${projectId}/qa/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialisation: spec, testingTools: tools, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      toast.success("QA workspace generated");
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
      const res = await fetch(`/api/project/${projectId}/qa-assistant`, {
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
          <h3 className={`${dxClass.display} text-lg`}>QA setup — {projectName}</h3>
          <span className="text-xs text-[#A8A89E]">
            {status === "complete" ? "Workspace ready" : "Pending generation"}
          </span>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Testing specialisation</span>
          <select
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          >
            {QA_SPECIALISATIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div className="text-sm">
          <span className="font-medium">Testing tools</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {QA_TESTING_TOOLS.map((tool) => (
              <button
                key={tool.value}
                type="button"
                onClick={() => toggleTool(tool.value)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  tools.includes(tool.value)
                    ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
                    : "border-[#E4E4DC] text-[#6B6B64]"
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Test context (optional)</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Paste test plans, API contracts, acceptance criteria, or release notes…"
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
          Generate AI quality workspace
        </button>
      </div>

      <div className={`${dxClass.card} space-y-4 p-6`}>
        <h3 className={`${dxClass.display} flex items-center gap-2 text-lg`}>
          <MessageSquare size={18} />
          AI quality engineer
        </h3>
        <form onSubmit={askAssistant} className="space-y-3">
          <textarea
            value={assistantQ}
            onChange={(e) => setAssistantQ(e.target.value)}
            rows={3}
            placeholder="e.g. What should I retest after the auth API changes?"
            className="w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={asking || !assistantQ.trim()}
            className={`${dxClass.btnPrimary} inline-flex items-center gap-2`}
          >
            {asking ? <Loader2 size={14} className="animate-spin" /> : null}
            Ask quality engineer
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
