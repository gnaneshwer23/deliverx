"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { AlignmentRing } from "@/components/alignment/alignment-ring";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import type { AlignmentTier, AlignmentTrend } from "@/services/alignmentEngine";

type ScoreResponse = {
  ok: true;
  alignment: {
    score: number;
    tier: AlignmentTier;
    trend: AlignmentTrend;
    delta: number | null;
    factors: string[];
  };
};

export function MeetingAlignmentPreview({
  projectId,
  meetingId,
  meetingContext,
}: {
  projectId: string;
  meetingId: string;
  meetingContext: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResponse["alignment"] | null>(null);

  async function previewAlignment() {
    setLoading(true);
    setError(null);

    const res = await postAi<ScoreResponse>("/api/ai/alignment/score", {
      projectId,
      meetingId,
      meetingContext,
      persist: false,
    });

    setLoading(false);

    if (!res.ok) {
      setError(aiErrorMessage(res));
      return;
    }

    setResult(res.data.alignment);
  }

  if (!result) {
    return (
      <div className="mt-2">
        <button
          type="button"
          disabled={loading}
          onClick={previewAlignment}
          className="text-xs font-medium text-[#0F766E] hover:underline disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Scoring charter impact…
            </span>
          ) : (
            "Preview charter alignment impact"
          )}
        </button>
        {error ? (
          <div className="mt-2">
            <AiStatusBanner message={error} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-start gap-4 rounded-lg border border-[#0F766E]/20 bg-[#0F766E]/5 p-3">
      <AlignmentRing
        score={result.score}
        tier={result.tier}
        trend={result.trend}
        delta={result.delta}
        size="sm"
        label="After this meeting"
      />
      <div className="min-w-0 flex-1 text-xs text-slate-600">
        {result.factors.slice(0, 2).map((f) => (
          <p key={f}>{f}</p>
        ))}
      </div>
    </div>
  );
}
