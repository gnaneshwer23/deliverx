"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import type { EnvDiagnostics } from "@/lib/env-check";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export function SetupDiagnostics() {
  const [data, setData] = useState<EnvDiagnostics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/setup/diagnostics");
        const json = (await res.json()) as EnvDiagnostics & { error?: string };
        if (!res.ok) {
          if (!cancelled) setError(json.error ?? "Could not load diagnostics");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Could not reach diagnostics endpoint");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className={`${dxClass.cardPad} border-[#C0392B]/30 bg-[#FDF1F0]`}>
        <p className="text-sm text-[#C0392B]">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className={dxClass.cardPad}>
        <p className="flex items-center gap-2 text-sm text-[#6B6B64]">
          <Loader2 size={14} className="animate-spin" /> Running setup audit…
        </p>
      </section>
    );
  }

  const blocking = data.checks.filter((c) => c.required && !c.ok);

  return (
    <section className={`${dxClass.cardPad} ${blocking.length ? "border-amber-200 bg-amber-50/80" : ""}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Setup audit</h2>
        {blocking.length === 0 ? (
          <DxBadge tone="green" dot>
            Ready
          </DxBadge>
        ) : (
          <DxBadge tone="red" dot>
            {blocking.length} issue{blocking.length === 1 ? "" : "s"}
          </DxBadge>
        )}
      </div>

      {!data.ai.configured ? (
        <div className="mb-4 flex gap-2 rounded-lg border border-amber-300 bg-white px-3 py-3 text-sm text-amber-950">
          <AlertTriangle size={18} className="shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">AI is not responding — API key missing</p>
            <p className="mt-1 text-amber-900/90">
              Assistant, business case review, guided project chat, and structure generation need{" "}
              <code className="rounded bg-amber-100 px-1">MINIMAX_API_KEY</code> or{" "}
              <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code> on the server.
            </p>
          </div>
        </div>
      ) : null}

      <ul className="space-y-2">
        {data.checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2 text-sm">
            {c.ok ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#1A6B3A]" />
            ) : (
              <AlertTriangle
                size={16}
                className={`mt-0.5 shrink-0 ${c.required ? "text-[#C0392B]" : "text-amber-600"}`}
              />
            )}
            <div>
              <code className="text-xs text-[#1C4A2E]">{c.key}</code>
              {c.required && !c.ok ? (
                <span className="ml-2 text-xs font-medium text-[#C0392B]">Required</span>
              ) : null}
              {c.hint && !c.ok ? <p className="text-xs text-[#6B6B64]">{c.hint}</p> : null}
            </div>
          </li>
        ))}
      </ul>

      {data.ai.configured ? (
        <p className="mt-4 text-sm text-[#6B6B64]">
          AI provider: <strong>{data.ai.provider}</strong> · Model: <code>{data.ai.model}</code>
        </p>
      ) : null}

      {data.hints.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-[#E4E4DC] pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B6B64]">Next steps</p>
          {data.hints.map((h) => (
            <p key={h} className="text-sm text-[#2C2C28]">
              {h}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#1C4A2E] underline"
        >
          Vercel env vars <ExternalLink size={12} />
        </Link>
        <Link
          href="https://supabase.com/dashboard/project/jibmyxaldetyycmtlxet/auth/providers"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#1C4A2E] underline"
        >
          Supabase email auth <ExternalLink size={12} />
        </Link>
        <span className="text-[#A8A89E]">Docs: docs/API_KEYS.md</span>
      </div>

      <details className="mt-4 text-xs text-[#6B6B64]">
        <summary className="cursor-pointer font-medium">Add keys via Vercel CLI</summary>
        <pre className="mt-2 overflow-x-auto rounded bg-[#F7F7F2] p-3 text-[11px] leading-relaxed">
{`# From repo root (paste your real key when prompted)
vercel env add MINIMAX_API_KEY production
vercel env add ANTHROPIC_API_KEY production   # optional alternative

# Then redeploy
vercel --prod`}
        </pre>
      </details>
    </section>
  );
}
