"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function AiConfigBanner() {
  const [show, setShow] = useState(false);
  const [model, setModel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ai/status");
        const data = (await res.json()) as { configured?: boolean; model?: string };
        if (!cancelled && res.ok && !data.configured) {
          setShow(true);
          setModel(data.model ?? null);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return (
    <div className="mb-4 flex gap-2 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <AlertTriangle size={18} className="shrink-0 text-amber-600" />
      <p>
        <strong>AI is not configured on this server.</strong> Chat and reviews will not respond until
        you add <code className="rounded bg-amber-100 px-1">MINIMAX_API_KEY</code> or{" "}
        <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code>
        {model ? <> (model: {model})</> : null}, then redeploy.{" "}
        <Link href="/workspace/settings" className="font-medium text-[#1C4A2E] underline">
          Open setup audit →
        </Link>
      </p>
    </div>
  );
}
