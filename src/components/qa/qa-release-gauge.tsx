"use client";

import type { QaMissionControl } from "@/services/qaDashboard";
import { deriveQaGoNoGoVerdict } from "@/lib/qa-release-kpis";
import { dxClass } from "@/lib/dx-theme";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const qaAccent = getMissionPersonaAccent("qa");

const VERDICT_STYLE = {
  Go: { ring: "#1A6B3A", bg: "#EEF5F1", text: "#1A6B3A" },
  "No-Go": { ring: "#C0392B", bg: "#FEF2F2", text: "#C0392B" },
  Hold: { ring: "#B7620A", bg: "#FEF6EC", text: "#B7620A" },
} as const;

export function QaReleaseGauge({
  readiness,
  criticalDefects,
}: {
  readiness: QaMissionControl["releaseReadiness"];
  criticalDefects: number;
}) {
  const verdict = deriveQaGoNoGoVerdict({
    overall: readiness.overall,
    criticalDefects,
    recommendation: readiness.recommendation,
  });
  const style = VERDICT_STYLE[verdict];
  const score = readiness.overall > 0 ? readiness.overall : null;
  const circumference = 2 * Math.PI * 54;
  const offset = score != null ? circumference * (1 - score / 100) : circumference;

  return (
    <div
      className={`${dxClass.card} border-t-2 p-6`}
      style={{ borderTopColor: qaAccent.primary }}
      data-panel="qa-release-gauge"
    >
      <h3 className={`${dxClass.display} mb-1 text-lg`}>Release readiness</h3>
      <p className="mb-4 text-xs text-[#6B6B64]">Are we ready to ship?</p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative size-32 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#F0F0E8" strokeWidth="10" />
            {score != null ? (
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={style.ring}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            ) : null}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${dxClass.display} text-2xl tabular-nums`}>
              {score != null ? score : "—"}
            </span>
            <span className="text-[10px] text-[#A8A89E]">/ 100</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-semibold"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {verdict}
          </span>
          <p className="text-sm font-medium text-[#0D0D0B]">{readiness.recommendation}</p>
          <p className="text-sm text-[#6B6B64]">{readiness.reason}</p>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {[
              { label: "Coverage", value: readiness.coverage },
              { label: "Defects", value: readiness.defects },
              { label: "UAT", value: readiness.uat },
              { label: "Performance", value: readiness.performance },
              { label: "Security", value: readiness.security },
            ].map((dim) => (
              <div key={dim.label} className="rounded border border-[#E4E4DC] px-2 py-1.5">
                <p className="text-[#A8A89E]">{dim.label}</p>
                <p className="font-semibold tabular-nums">{dim.value > 0 ? dim.value : "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
