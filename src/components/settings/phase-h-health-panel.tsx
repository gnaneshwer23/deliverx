"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { PhaseHHealthReport } from "@/services/phaseHHealth";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export function PhaseHHealthPanel() {
  const [data, setData] = useState<PhaseHHealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/setup/phase-h-health");
        const json = (await res.json()) as PhaseHHealthReport & { error?: string };
        if (!res.ok) {
          if (!cancelled) setError(json.error ?? "Could not load team sync health");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Could not reach team sync health endpoint");
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
          <Loader2 size={14} className="animate-spin" /> Checking team sync spine…
        </p>
      </section>
    );
  }

  const failed = data.smokeTests.filter((s) => !s.ok);

  return (
    <section className={`${dxClass.cardPad} ${!data.ok ? "border-amber-200 bg-amber-50/80" : ""}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Team sync &amp; mission dashboards</h2>
          <p className="mt-1 text-sm text-[#6B6B64]">
            Team needs, stakeholder pulse, and cross-role updates on mission dashboards.
          </p>
        </div>
        <DxBadge tone={data.ok ? "green" : "amber"}>{data.ok ? "Healthy" : "Needs attention"}</DxBadge>
      </div>
      <ul className="space-y-2">
        {data.smokeTests.map((check) => (
          <li key={check.feature} className="flex items-start gap-2 text-sm">
            {check.ok ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
            )}
            <div>
              <span className="font-medium">{check.feature}</span>
              <span className="text-[#A8A89E]"> · {check.sprint}</span>
              <p className="text-[#6B6B64]">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      {failed.length > 0 ? (
        <p className="mt-4 text-xs text-amber-800">
          {failed.length} check{failed.length === 1 ? "" : "s"} failed — verify H1 wiring.
        </p>
      ) : null}
      <p className="mt-3 text-[10px] text-[#A8A89E]">Checked {new Date(data.checkedAt).toLocaleString()}</p>
    </section>
  );
}
