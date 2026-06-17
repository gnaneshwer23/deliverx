"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SCRUM_FRAMEWORKS, SCRUM_TEAM_CONFIGS } from "@/lib/scrum/constants";
import { dxClass } from "@/lib/dx-theme";

export function ScrumWorkspace({
  projectId,
  projectName,
  agileFramework,
  teamConfig,
  extractionStatus,
}: {
  projectId: string;
  projectName: string;
  agileFramework?: string | null;
  teamConfig?: string | null;
  extractionStatus?: string;
}) {
  const [framework, setFramework] = useState(agileFramework ?? "scrum");
  const [team, setTeam] = useState(teamConfig ?? "cross_functional");
  const [content, setContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [status, setStatus] = useState(extractionStatus ?? "pending");
  const [assistantQ, setAssistantQ] = useState("");
  const [assistantA, setAssistantA] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  async function runAnalysis() {
    setExtracting(true);
    try {
      const res = await fetch(`/api/project/${projectId}/scrum/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agileFramework: framework, teamConfig: team, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      toast.success("Scrum workspace generated");
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
      const res = await fetch(`/api/project/${projectId}/scrum-assistant`, {
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
          <h3 className={`${dxClass.display} text-lg`}>Agile setup — {projectName}</h3>
          <span className="text-xs text-[#A8A89E]">
            {status === "complete" ? "Workspace ready" : "Pending generation"}
          </span>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Agile framework</span>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          >
            {SCRUM_FRAMEWORKS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Team configuration</span>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          >
            {SCRUM_TEAM_CONFIGS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Team context (optional)</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Paste team charter, sprint notes, or retro themes…"
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
          Generate AI agile workspace
        </button>
      </div>

      <div className={`${dxClass.card} space-y-4 p-6`}>
        <h3 className={`${dxClass.display} flex items-center gap-2 text-lg`}>
          <MessageSquare size={18} />
          AI agile coach
        </h3>
        <form onSubmit={askAssistant} className="space-y-3">
          <textarea
            value={assistantQ}
            onChange={(e) => setAssistantQ(e.target.value)}
            rows={3}
            placeholder="e.g. Facilitate sprint planning agenda or summarise standup blockers"
            className="w-full rounded-lg border border-[#E4E4DC] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={asking || !assistantQ.trim()}
            className={`${dxClass.btnPrimary} inline-flex items-center gap-2`}
          >
            {asking ? <Loader2 size={14} className="animate-spin" /> : null}
            Ask coach
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
