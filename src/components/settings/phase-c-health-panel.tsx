"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { PhaseCHealthReport } from "@/services/phaseCHealth";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export function PhaseCHealthPanel() {
  const [data, setData] = useState<PhaseCHealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/setup/phase-c-health");
        const json = (await res.json()) as PhaseCHealthReport & { error?: string };
        if (!res.ok) {
          if (!cancelled) setError(json.error ?? "Could not load Phase C health");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Could not reach Phase C health endpoint");
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
          <Loader2 size={14} className="animate-spin" /> Checking Phase C features…
        </p>
      </section>
    );
  }

  const failedTables = data.tables.filter((t) => !t.ok);
  const failedSmoke = data.smokeTests.filter((s) => !s.ok);

  return (
    <section className={`${dxClass.cardPad} ${!data.ok ? "border-amber-200 bg-amber-50/80" : ""}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Phase C scale features</h2>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Prediction · GitHub · stakeholder share · voice copilot
          </p>
        </div>
        {data.ok ? (
          <DxBadge tone="green" dot>
            Healthy
          </DxBadge>
        ) : (
          <DxBadge tone="red" dot>
            Needs attention
          </DxBadge>
        )}
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
        Engine smoke tests
      </p>
      <ul className="mb-4 space-y-2">
        {data.smokeTests.map((row) => (
          <li
            key={row.feature}
            className="flex items-start justify-between gap-3 rounded-md border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{row.feature}</p>
              <p className="text-xs text-[#6B6B64]">
                Sprint {row.sprint} · {row.detail}
              </p>
            </div>
            {row.ok ? (
              <CheckCircle2 size={16} className="shrink-0 text-[#1C4A2E]" />
            ) : (
              <XCircle size={16} className="shrink-0 text-[#C0392B]" />
            )}
          </li>
        ))}
      </ul>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
        Database tables
      </p>
      <ul className="space-y-2">
        {data.tables.map((row) => (
          <li
            key={row.table}
            className="flex items-start justify-between gap-3 rounded-md border border-[#E4E4DC] bg-white px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{row.table}</p>
              <p className="text-xs text-[#6B6B64]">Sprint {row.sprint}</p>
              {row.error ? <p className="text-xs text-[#C0392B]">{row.error}</p> : null}
            </div>
            {row.ok ? (
              <CheckCircle2 size={16} className="shrink-0 text-[#1C4A2E]" />
            ) : (
              <XCircle size={16} className="shrink-0 text-[#C0392B]" />
            )}
          </li>
        ))}
      </ul>

      {failedTables.length > 0 || failedSmoke.length > 0 ? (
        <p className="mt-4 text-xs text-amber-800">
          {failedTables.length > 0
            ? `${failedTables.length} table(s) missing — apply migrations 0041–0043. `
            : ""}
          {failedSmoke.length > 0 ? `${failedSmoke.length} engine check(s) failed.` : ""}
        </p>
      ) : null}
    </section>
  );
}
