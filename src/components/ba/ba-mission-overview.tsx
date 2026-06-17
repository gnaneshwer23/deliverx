"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { BaMissionControl } from "@/services/baDashboard";
import { dxClass } from "@/lib/dx-theme";

export function BaMissionOverview({ data }: { data: BaMissionControl }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
      <Kpi label="Requirements extracted" value={data.kpis.extracted} />
      <Kpi label="Approved" value={data.kpis.approved} tone="green" />
      <Kpi label="Pending clarification" value={data.kpis.pendingClarification} tone="amber" />
      <Kpi label="Stakeholder reviews" value={data.kpis.stakeholderReviewsPending} />
      <Kpi label="Stories ready" value={data.kpis.storiesReady} tone="green" />
      <Kpi label="Traceability" value={`${data.kpis.traceabilityScore}%`} />
      <Kpi
        label="Delivery impact"
        value={data.kpis.deliveryImpact}
        tone={data.kpis.deliveryImpactTone}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "amber" | "red";
}) {
  const color =
    tone === "green"
      ? "text-[#1A6B3A]"
      : tone === "amber"
        ? "text-[#B7620A]"
        : tone === "red"
          ? "text-[#C0392B]"
          : "text-[#0D0D0B]";

  return (
    <div className={`${dxClass.card} p-4`}>
      <p className="font-[family-name:var(--font-dx-mono)] text-[7px] uppercase tracking-[0.14em] text-[#A8A89E]">
        {label}
      </p>
      <p className={`${dxClass.display} mt-1 text-2xl leading-none ${color}`}>{value}</p>
    </div>
  );
}

export function BaAiSummary({ summary, projectId }: { summary: string; projectId?: string }) {
  return (
    <div className="rounded-xl border border-[#C6DDD0] bg-[#EEF5F1]/60 p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1C4A2E]">
        <Sparkles size={14} />
        AI summary
      </div>
      <p className="text-sm leading-relaxed text-[#0D0D0B]">&ldquo;{summary}&rdquo;</p>
      {projectId ? (
        <Link
          href={`/project/${projectId}/requirements`}
          className="mt-3 inline-block text-xs font-medium text-[#1C4A2E] hover:underline"
        >
          Open requirements workspace →
        </Link>
      ) : null}
    </div>
  );
}
