"use client";

import { useState } from "react";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { BA_PROJECT_TYPES } from "@/lib/ba/constants";
import type { RequirementRow, StoryRow, ClarificationRow } from "@/services/baRequirementEngine";
import type { TraceMatrixRow } from "@/services/baRequirementEngine";
import { BaTraceabilityPreview } from "@/components/ba/ba-traceability-preview";
import { dxClass } from "@/lib/dx-theme";

type Tab = "requirements" | "clarifications" | "stories" | "traceability" | "assistant";

export function BaRequirementsWorkspace({
  projectId,
  projectName,
  initialRequirements,
  initialStories,
  initialClarifications,
  initialMatrix,
  projectType,
}: {
  projectId: string;
  projectName: string;
  initialRequirements: RequirementRow[];
  initialStories: StoryRow[];
  initialClarifications: ClarificationRow[];
  initialMatrix: TraceMatrixRow[];
  projectType?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("requirements");
  const [requirements, setRequirements] = useState(initialRequirements);
  const [stories, setStories] = useState(initialStories);
  const [clarifications, setClarifications] = useState(initialClarifications);
  const [matrix, setMatrix] = useState(initialMatrix);
  const [extracting, setExtracting] = useState(false);
  const [selectedType, setSelectedType] = useState(projectType ?? "saas_product");
  const [extraContent, setExtraContent] = useState("");
  const [assistantQ, setAssistantQ] = useState("");
  const [assistantA, setAssistantA] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [generatingStory, setGeneratingStory] = useState<string | null>(null);

  async function runExtraction() {
    setExtracting(true);
    try {
      const res = await fetch(`/api/project/${projectId}/requirements/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectType: selectedType, content: extraContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");
      toast.success("Requirements extracted");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function refreshData() {
    const res = await fetch(`/api/project/${projectId}/requirements`);
    const data = await res.json();
    if (res.ok) {
      setRequirements(data.requirements ?? []);
      setStories(data.stories ?? []);
      setClarifications(data.clarifications ?? []);
      setMatrix(data.matrix ?? []);
    }
  }

  async function generateStory(requirementId: string) {
    setGeneratingStory(requirementId);
    try {
      const res = await fetch(`/api/project/${projectId}/requirements/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Story generation failed");
      toast.success("User story generated");
      await refreshData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setGeneratingStory(null);
    }
  }

  async function askAssistant(e: React.FormEvent) {
    e.preventDefault();
    if (!assistantQ.trim()) return;
    setAsking(true);
    try {
      const res = await fetch(`/api/project/${projectId}/ba-assistant`, {
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

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "requirements", label: "Requirements", count: requirements.length },
    { id: "clarifications", label: "Clarification hub", count: clarifications.filter((c) => c.status === "open").length },
    { id: "stories", label: "User stories", count: stories.length },
    { id: "traceability", label: "Traceability" },
    { id: "assistant", label: "AI BA assistant" },
  ];

  return (
    <div className="space-y-6">
      <div className={`${dxClass.card} p-6`}>
        <h3 className={`${dxClass.display} text-lg`}>AI requirement extraction</h3>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Upload context for {projectName} — uses charter plus pasted notes.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[#6B6B64]">Project type</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
            >
              {BA_PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-medium text-[#6B6B64]">
              Additional context (PRD, meeting notes, emails)
            </span>
            <textarea
              value={extraContent}
              onChange={(e) => setExtraContent(e.target.value)}
              rows={4}
              placeholder="Paste business case excerpts, PRD sections, or meeting notes…"
              className="w-full border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={runExtraction}
          disabled={extracting}
          className={`${dxClass.btnPrimary} mt-4 inline-flex items-center gap-2`}
        >
          {extracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {extracting ? "Extracting…" : "Run AI extraction"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E4E4DC] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-[#1C4A2E] text-white"
                : "bg-[#F0F0E8] text-[#6B6B64] hover:bg-[#E4E4DC]"
            }`}
          >
            {t.label}
            {t.count != null ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {tab === "requirements" ? (
        <RequirementsList
          requirements={requirements}
          onGenerateStory={generateStory}
          generatingStory={generatingStory}
        />
      ) : null}

      {tab === "clarifications" ? <ClarificationsList items={clarifications} /> : null}
      {tab === "stories" ? <StoriesList stories={stories} /> : null}
      {tab === "traceability" ? (
        <BaTraceabilityPreview rows={matrix} projectId={projectId} />
      ) : null}

      {tab === "assistant" ? (
        <div className={`${dxClass.card} p-6`}>
          <h3 className={`${dxClass.display} mb-3 flex items-center gap-2 text-lg`}>
            <MessageSquare size={18} /> AI BA assistant
          </h3>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Generate BRDs, find gaps, create stories, identify conflicts, or draft stakeholder questions.
          </p>
          <form onSubmit={askAssistant} className="flex gap-2">
            <input
              value={assistantQ}
              onChange={(e) => setAssistantQ(e.target.value)}
              placeholder="e.g. Find missing requirements for payment approval workflow"
              className="flex-1 border border-[#E4E4DC] px-3 py-2 text-sm"
            />
            <button type="submit" disabled={asking} className={dxClass.btnPrimary}>
              {asking ? "…" : "Ask"}
            </button>
          </form>
          {assistantA ? (
            <div className="mt-4 rounded-lg border border-[#C6DDD0] bg-[#EEF5F1]/50 p-4 text-sm whitespace-pre-wrap">
              {assistantA}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function RequirementsList({
  requirements,
  onGenerateStory,
  generatingStory,
}: {
  requirements: RequirementRow[];
  onGenerateStory: (id: string) => void;
  generatingStory: string | null;
}) {
  if (requirements.length === 0) {
    return (
      <p className="text-sm text-[#6B6B64]">No requirements yet. Run AI extraction above.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {requirements.map((req) => (
        <li key={req.id} className={`${dxClass.card} p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] text-[#A8A89E]">{req.req_code}</span>
              <h4 className="font-semibold text-[#0D0D0B]">{req.title}</h4>
              <p className="mt-1 text-sm text-[#6B6B64]">{req.description}</p>
            </div>
            <span className="rounded-full bg-[#F0F0E8] px-2 py-0.5 text-[10px] uppercase">
              {req.type.replace(/_/g, " ")}
            </span>
          </div>
          <QualityBar quality={req.quality} flags={req.flags} status={req.status} />
          <button
            type="button"
            onClick={() => onGenerateStory(req.id)}
            disabled={generatingStory === req.id}
            className="mt-3 text-xs font-medium text-[#1C4A2E] hover:underline"
          >
            {generatingStory === req.id ? "Generating story…" : "Generate user story →"}
          </button>
        </li>
      ))}
    </ul>
  );
}

function QualityBar({
  quality,
  flags,
  status,
}: {
  quality: RequirementRow["quality"];
  flags: string[];
  status: string;
}) {
  const metrics = [
    { label: "Clarity", value: quality.clarity },
    { label: "Complete", value: quality.completeness },
    { label: "Testable", value: quality.testability },
    { label: "Aligned", value: quality.alignment },
  ];

  return (
    <div className="mt-3 flex flex-wrap gap-3 text-[10px]">
      {metrics.map((m) => (
        <span key={m.label} className="text-[#6B6B64]">
          {m.label}:{" "}
          <strong className="text-[#0D0D0B]">{m.value != null ? `${m.value}%` : "—"}</strong>
        </span>
      ))}
      <span className="text-[#6B6B64]">
        Risk: <strong>{String(quality.riskLevel ?? "medium")}</strong>
      </span>
      <span className="text-[#6B6B64]">
        Status: <strong>{status.replace(/_/g, " ")}</strong>
      </span>
      {flags.length > 0 ? (
        <span className="text-amber-700">Flags: {flags.join(", ")}</span>
      ) : null}
    </div>
  );
}

function ClarificationsList({ items }: { items: ClarificationRow[] }) {
  const open = items.filter((c) => c.status === "open");
  if (open.length === 0) {
    return <p className="text-sm text-[#6B6B64]">No open clarification items.</p>;
  }
  return (
    <ul className="space-y-2">
      {open.map((c) => (
        <li key={c.id} className={`${dxClass.card} p-4 text-sm`}>
          <p className="font-medium text-[#0D0D0B]">{c.question}</p>
          <p className="mt-1 text-xs text-[#6B6B64]">
            {c.stakeholder_role ?? "Stakeholder"} · {c.priority} priority
            {c.blocks ? ` · Blocks: ${c.blocks}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

function StoriesList({ stories }: { stories: StoryRow[] }) {
  if (stories.length === 0) {
    return <p className="text-sm text-[#6B6B64]">Generate stories from requirements.</p>;
  }
  return (
    <ul className="space-y-3">
      {stories.map((s) => (
        <li key={s.id} className={`${dxClass.card} p-4`}>
          <span className="font-mono text-[10px] text-[#A8A89E]">{s.story_code}</span>
          <h4 className="font-semibold">{s.title}</h4>
          <p className="mt-1 text-sm italic text-[#6B6B64]">{s.story}</p>
        </li>
      ))}
    </ul>
  );
}
