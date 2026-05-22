"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";

type InsightsResponse = {
  ok: true;
  narrative: string;
};

export function AiInsights({
  projectId,
  projectName,
  healthTier,
  confidenceScore,
  recommendation,
}: {
  projectId: string | null;
  projectName: string | null;
  healthTier: "healthy" | "watch" | "at-risk";
  confidenceScore: number;
  recommendation: string;
}) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const tierLabel =
    healthTier === "healthy"
      ? "On track"
      : healthTier === "watch"
        ? "Needs attention"
        : "At risk";

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    setLoading(true);
    setAiError(null);

    postAi<InsightsResponse>("/api/ai/insights", { projectId }).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        if (res.code !== "ai_not_configured") {
          setAiError(aiErrorMessage(res));
        }
        return;
      }
      setNarrative(res.data.narrative);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const body = narrative ?? recommendation;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-[#0F766E]/10 text-[#0F766E]">
          <Sparkles size={14} />
        </span>
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <span className="rounded bg-[#0F766E]/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#0F766E]">
          {narrative ? "Claude" : "Live"}
        </span>
        {loading ? <Loader2 size={14} className="animate-spin text-slate-400" /> : null}
      </div>
      {projectName ? (
        <p className="mb-2 text-xs text-slate-500">
          Top signal from{" "}
          <span className="font-medium text-slate-700">{projectName}</span> ·{" "}
          {tierLabel} · {confidenceScore}% confidence
        </p>
      ) : (
        <p className="mb-2 text-xs text-slate-500">
          Create a project and tasks to unlock delivery intelligence.
        </p>
      )}
      {aiError ? (
        <div className="mb-2">
          <AiStatusBanner message={aiError} variant="info" />
        </div>
      ) : null}
      <p className="text-sm text-slate-600">{body}</p>
      {narrative ? (
        <p className="mt-2 text-xs text-slate-400">
          Rule-based signal: {recommendation}
        </p>
      ) : null}
    </motion.section>
  );
}
