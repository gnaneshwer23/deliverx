"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

type AiStatus = {
  configured: boolean;
  model: string;
};

export function AiIntegrationStatus() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/status");
        const data = (await res.json()) as AiStatus & { error?: string };
        if (!res.ok) {
          if (!cancelled) setError(data.error ?? "Could not load AI status");
          return;
        }
        if (!cancelled) setStatus(data);
      } catch {
        if (!cancelled) setError("Could not reach AI status endpoint");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={`${dxClass.cardPad}`}>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-[#1C4A2E]" />
        <h2 className="font-semibold">AI integrations</h2>
      </div>

      {!status && !error ? (
        <p className="flex items-center gap-2 text-sm text-[#6B6B64]">
          <Loader2 size={14} className="animate-spin" /> Checking configuration…
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-[#C0392B]">{error}</p>
      ) : status ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#6B6B64]">Text AI</span>
            <DxBadge tone={status.configured ? "green" : "red"} dot>
              {status.configured ? "Configured" : "Not configured"}
            </DxBadge>
            {status.configured ? (
              <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
                Model: {status.model}
              </span>
            ) : null}
          </div>
          {!status.configured ? (
            <p className="text-sm text-[#6B6B64]">
              Add <code className="text-[#1C4A2E]">MINIMAX_API_KEY</code> or{" "}
              <code className="text-[#1C4A2E]">ANTHROPIC_API_KEY</code> to{" "}
              <code className="text-[#1C4A2E]">.env.local</code> (local) or Vercel Environment
              Variables (production). See the environment variables section below.
            </p>
          ) : (
            <p className="text-sm text-[#6B6B64]">
              Assistant, insights, business case review, and structure generation are available.
            </p>
          )}
          <p className="text-xs text-[#A8A89E]">
            Optional: <code>OPENAI_API_KEY</code> for meeting transcription and charter embeddings.
          </p>
        </div>
      ) : null}
    </section>
  );
}
