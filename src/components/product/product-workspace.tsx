"use client";

import { useState, useRef } from "react";
import { Loader2, Sparkles, MessageSquare, Upload } from "lucide-react";
import { toast } from "sonner";
import { PRODUCT_TYPES } from "@/lib/product/constants";
import type { ProductFeatureRow, CustomerInsightRow, CustomerSegmentRow } from "@/services/pmProductEngine";
import { dxClass } from "@/lib/dx-theme";

type Tab = "discovery" | "features" | "roadmap" | "segments" | "assistant";

export function ProductWorkspace({
  projectId,
  projectName,
  initialFeatures,
  initialInsights,
  initialSegments,
  productType,
}: {
  projectId: string;
  projectName: string;
  initialFeatures: ProductFeatureRow[];
  initialInsights: CustomerInsightRow[];
  initialSegments: CustomerSegmentRow[];
  productType?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("discovery");
  const [features, setFeatures] = useState(initialFeatures);
  const [insights, setInsights] = useState(initialInsights);
  const [segments, setSegments] = useState(initialSegments);
  const [extracting, setExtracting] = useState(false);
  const [selectedType, setSelectedType] = useState(productType ?? "saas");
  const [extraContent, setExtraContent] = useState("");
  const [assistantQ, setAssistantQ] = useState("");
  const [assistantA, setAssistantA] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [discoverySummary, setDiscoverySummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function runAnalysis() {
    setExtracting(true);
    try {
      const res = await fetch(`/api/project/${projectId}/product/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: selectedType, content: extraContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      toast.success("Product analysis complete");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setExtracting(false);
    }
  }

  async function refresh() {
    const res = await fetch(`/api/project/${projectId}/product`);
    const data = await res.json();
    if (res.ok) {
      setFeatures(data.features ?? []);
      setInsights(data.insights ?? []);
      setSegments(data.segments ?? []);
    }
  }

  async function uploadDiscovery(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const extractRes = await fetch("/api/documents/extract-text", {
        method: "POST",
        body: form,
      });
      const extracted = await extractRes.json();
      if (!extractRes.ok) throw new Error(extracted.error ?? "Could not read file");

      const res = await fetch(`/api/project/${projectId}/product/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: extracted.text,
          source: extracted.filename,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Discovery extraction failed");

      setDiscoverySummary(data.summary ?? null);
      toast.success(`${data.insightCount} pain point${data.insightCount === 1 ? "" : "s"} extracted`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function askAssistant(e: React.FormEvent) {
    e.preventDefault();
    if (!assistantQ.trim()) return;
    setAsking(true);
    try {
      const res = await fetch(`/api/project/${projectId}/product-assistant`, {
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
    { id: "discovery", label: "Customer discovery" },
    { id: "features", label: "Features & RICE" },
    { id: "roadmap", label: "Roadmap" },
    { id: "segments", label: "Segments" },
    { id: "assistant", label: "AI product assistant" },
  ];

  const roadmap = {
    now: features.filter((f) => f.horizon === "now"),
    next: features.filter((f) => f.horizon === "next"),
    later: features.filter((f) => f.horizon === "later"),
  };

  return (
    <div className="space-y-6">
      <div className={`${dxClass.card} p-6`}>
        <h3 className={`${dxClass.display} text-lg`}>AI product analysis</h3>
        <p className="mt-1 text-sm text-[#6B6B64]">
          Ingest business case, PRD, customer interviews, and competitor research for {projectName}.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[#6B6B64]">Product type</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-[#E4E4DC] px-3 py-2 text-sm"
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-medium text-[#6B6B64]">Additional context</span>
            <textarea
              value={extraContent}
              onChange={(e) => setExtraContent(e.target.value)}
              rows={4}
              placeholder="Customer interviews, support tickets, competitor notes…"
              className="w-full border border-[#E4E4DC] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={extracting}
          className={`${dxClass.btnPrimary} mt-4 inline-flex items-center gap-2`}
        >
          {extracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {extracting ? "Analysing…" : "Run AI product analysis"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E4E4DC] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t.id ? "bg-[#1C4A2E] text-white" : "bg-[#F0F0E8] text-[#6B6B64]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "discovery" ? (
        <div className="space-y-4">
          <div className={`${dxClass.card} p-4`}>
            <h4 className="text-sm font-semibold">Upload customer discovery</h4>
            <p className="mt-1 text-xs text-[#6B6B64]">
              PDF, DOCX, TXT, or MD — interviews, support exports, research notes.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadDiscovery(file);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className={`${dxClass.btnGhost} mt-3 inline-flex items-center gap-2 text-xs`}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? "Extracting pain points…" : "Upload & extract pain points"}
            </button>
            {discoverySummary ? (
              <p className="mt-3 text-sm text-[#6B6B64]">{discoverySummary}</p>
            ) : null}
          </div>
          <ul className="space-y-2">
            {insights.length ? (
              insights.map((i) => (
                <li key={i.id} className={`${dxClass.card} p-4 text-sm`}>
                  <span className="text-xs uppercase text-[#A8A89E]">{i.insight_type}</span>
                  <p className="font-medium">{i.theme || i.content}</p>
                  <p className="text-[#6B6B64]">{i.content}</p>
                </li>
              ))
            ) : (
              <p className="text-sm text-[#6B6B64]">No insights yet — upload discovery material above.</p>
            )}
          </ul>
        </div>
      ) : null}

      {tab === "features" ? (
        <ul className="space-y-3">
          {[...features]
            .sort((a, b) => b.rice.score - a.rice.score)
            .map((f) => (
              <li key={f.id} className={`${dxClass.card} p-4`}>
                <div className="flex justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-[#A8A89E]">{f.feature_code}</span>
                    <h4 className="font-semibold">{f.title}</h4>
                    <p className="text-sm text-[#6B6B64]">{f.description}</p>
                  </div>
                  <span className="text-lg font-bold text-[#1C4A2E]">{f.rice.score}</span>
                </div>
                <p className="mt-2 text-[10px] text-[#6B6B64]">
                  R{f.rice.reach} · I{f.rice.impact} · C{f.rice.confidence}% · E{f.rice.effort}w ·{" "}
                  {f.horizon}
                </p>
              </li>
            ))}
        </ul>
      ) : null}

      {tab === "roadmap" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(["now", "next", "later"] as const).map((h) => (
            <div key={h} className={`${dxClass.card} p-4`}>
              <p className="text-xs font-semibold uppercase text-[#1C4A2E]">{h}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {roadmap[h].map((f) => (
                  <li key={f.id}>{f.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "segments" ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[#A8A89E]">
              <th className="pb-2">Segment</th>
              <th className="pb-2 text-right">Users</th>
              <th className="pb-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.id} className="border-t border-[#F0F0E8]">
                <td className="py-2">{s.name}</td>
                <td className="py-2 text-right">{s.user_count}</td>
                <td className="py-2 text-right">£{s.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {tab === "assistant" ? (
        <div className={`${dxClass.card} p-6`}>
          <h3 className={`${dxClass.display} mb-3 flex items-center gap-2 text-lg`}>
            <MessageSquare size={18} /> AI product assistant
          </h3>
          <form onSubmit={askAssistant} className="flex gap-2">
            <input
              value={assistantQ}
              onChange={(e) => setAssistantQ(e.target.value)}
              placeholder="What should we build next?"
              className="flex-1 border border-[#E4E4DC] px-3 py-2 text-sm"
            />
            <button type="submit" disabled={asking} className={dxClass.btnPrimary}>
              {asking ? "…" : "Ask"}
            </button>
          </form>
          {assistantA ? (
            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-[#C6DDD0] bg-[#EEF5F1]/50 p-4 text-sm">
              {assistantA}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
