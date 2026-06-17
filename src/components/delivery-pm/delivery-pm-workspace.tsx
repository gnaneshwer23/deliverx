"use client";

import { useState } from "react";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { PM_PROJECT_TYPES } from "@/lib/delivery-pm/constants";
import { dxClass } from "@/lib/dx-theme";

type Tab = "context" | "governance" | "assistant";

export function DeliveryPmWorkspace({
  projectId,
  projectName,
  projectType,
  extractionStatus,
}: {
  projectId: string;
  projectName: string;
  projectType?: string | null;
  extractionStatus?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("context");
  const [extracting, setExtracting] = useState(false);
  const [selectedType, setSelectedType] = useState(projectType ?? "saas");
  const [extraContent, setExtraContent] = useState("");
  const [assistantQ, setAssistantQ] = useState("");
  const [assistantA, setAssistantA] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [status, setStatus] = useState(extractionStatus ?? "pending");

  async function runAnalysis() {
    setExtracting(true);
    try {
      const res = await fetch(`/api/project/${projectId}/delivery/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectType: selectedType, content: extraContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      toast.success("Delivery analysis complete");
      setStatus("complete");
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
      const res = await fetch(`/api/project/${projectId}/pm-assistant`, {
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "context", label: "Upload context" },
    { id: "governance", label: "Governance pack" },
    { id: "assistant", label: "AI PM assistant" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-[#E4E4DC] pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-[#1C4A2E] text-white"
                : "bg-[#FAFAF7] text-[#6B6B64] hover:bg-[#EEF5F1]"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-[#A8A89E]">
          Status: {status === "complete" ? "Analysis complete" : "Pending analysis"}
        </span>
      </div>

      {tab === "context" ? (
        <div className={`${dxClass.card} space-y-4 p-6`}>
          <h3 className={`${dxClass.display} text-lg`}>Project context for {projectName}</h3>
          <p className="text-sm text-[#6B6B64]">
            Upload business case, PRD, SOW, or project plan content. AI generates charter, WBS,
            milestones, RAID, and governance artefacts.
          </p>
          <label className="block text-sm">
            <span className="font-medium">Project type</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
            >
              {PM_PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Additional context (optional)</span>
            <textarea
              value={extraContent}
              onChange={(e) => setExtraContent(e.target.value)}
              rows={8}
              placeholder="Paste business case, SOW, meeting notes, or project plan…"
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
            {extracting ? "Analysing delivery…" : "Run AI delivery analysis"}
          </button>
        </div>
      ) : null}

      {tab === "governance" ? (
        <div className={`${dxClass.card} p-6`}>
          <h3 className={`${dxClass.display} text-lg`}>Governance artefacts</h3>
          <p className="mt-2 text-sm text-[#6B6B64]">
            After analysis, DeliverX generates project charter, PID, communication plan, governance
            plan, RACI matrix, WBS, and sprint plan snapshots. View full artefacts in Documents and
            RAID.
          </p>
          <ul className="mt-4 list-inside list-disc text-sm text-[#6B6B64]">
            <li>Project Charter & PID</li>
            <li>Communication & Governance plans</li>
            <li>RACI Matrix</li>
            <li>Work Breakdown Structure & milestones</li>
            <li>RAID log & decision register</li>
            <li>Budget & benefits tracker</li>
          </ul>
        </div>
      ) : null}

      {tab === "assistant" ? (
        <div className={`${dxClass.card} space-y-4 p-6`}>
          <h3 className={`${dxClass.display} flex items-center gap-2 text-lg`}>
            <MessageSquare size={18} />
            AI PM assistant
          </h3>
          <p className="text-sm text-[#6B6B64]">
            Generate status reports, steering packs, risk summaries, delay predictions, RAID updates,
            sponsor updates, or RACI matrices.
          </p>
          <form onSubmit={askAssistant} className="space-y-3">
            <textarea
              value={assistantQ}
              onChange={(e) => setAssistantQ(e.target.value)}
              rows={3}
              placeholder="e.g. Generate a steering committee status report for this week"
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
      ) : null}
    </div>
  );
}
