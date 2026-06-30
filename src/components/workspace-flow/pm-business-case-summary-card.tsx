"use client";

import { ExternalLink } from "lucide-react";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";
import { HONEST_KPI_EMPTY } from "@/lib/honest-kpi";
import {
  formatExtractionCount,
  type ExtractionSummaryCounts,
} from "@/lib/workspace-flow-extraction";
import type { ProjectBusinessCaseStatus } from "@/services/projectBusinessCaseFlow";

function statValue(value: number | null, suffix = ""): string {
  if (value == null) return HONEST_KPI_EMPTY;
  return `${value}${suffix}`;
}

export function PmBusinessCaseSummaryCard({
  projectId,
  projectName,
  status,
  counts,
  aiSummary,
}: {
  projectId: string;
  projectName: string;
  status: ProjectBusinessCaseStatus;
  counts: ExtractionSummaryCounts;
  aiSummary: string | null;
}) {
  const proposalsHref = status.pendingReviewId
    ? `/workspace/proposals?persona=pm-mission&project=${projectId}&review=${status.pendingReviewId}`
    : `/workspace/proposals?persona=pm-mission&project=${projectId}`;

  const stats = [
    { label: "Requirements", value: formatExtractionCount(counts.requirements) },
    { label: "Gaps", value: formatExtractionCount(counts.gaps) },
    { label: "Risks", value: formatExtractionCount(counts.risks) },
    { label: "Objectives", value: formatExtractionCount(counts.objectives) },
  ];

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="pm-bc-summary">
      <DxWidgetHeader
        title="Business case summary"
        subtitle={
          status.hasBusinessCase
            ? `${projectName} — extracted signals from PM upload`
            : "Upload a business case to populate summary stats"
        }
        href={status.pendingReviewId ? proposalsHref : undefined}
        actionLabel="Review queue"
        trailing={
          status.pendingReviewId ? (
            <ExternalLink size={14} className="text-[#1C4A2E]" aria-hidden />
          ) : undefined
        }
      />

      <div className="px-5 py-5 md:px-6">
        {aiSummary && status.hasBusinessCase ? (
          <p className="mb-4 text-sm leading-relaxed text-[#6B6B64]">{aiSummary}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--dx-radius-md)] border border-[var(--dx-rul)]/70 border-t-[3px] border-t-[#1C4A2E] bg-white px-3 py-3 text-center shadow-[var(--dx-shadow-sm)]"
            >
              <p className={dxClass.panelTitle}>{stat.label}</p>
              <p
                className={`${dxClass.display} mt-1 text-2xl ${
                  stat.value === HONEST_KPI_EMPTY ? "text-[var(--dx-fnt)]" : "text-[#0D0D0B]"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {status.baMember ? (
          <p className="mt-4 text-xs text-[#6B6B64]">
            BA joined:{" "}
            <span className="font-medium text-[#2C2C28]">
              {status.baMember.name ?? "Business Analyst"}
            </span>
            {" · "}
            Traceability {statValue(counts.traceability, counts.traceability != null ? "%" : "")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
