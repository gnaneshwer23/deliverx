"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, FileSearch, Link2, Target } from "lucide-react";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { dxClass } from "@/lib/dx-theme";
import {
  formatExtractionCount,
  type ExtractionSummaryCounts,
} from "@/lib/workspace-flow-extraction";

const CARD_META = [
  {
    key: "requirements" as const,
    label: "Requirements",
    icon: FileSearch,
    hint: "Extracted from business case",
  },
  {
    key: "gaps" as const,
    label: "Gaps flagged",
    icon: AlertCircle,
    hint: "Missing or unclear scope",
  },
  {
    key: "objectives" as const,
    label: "Objectives",
    icon: Target,
    hint: "Goals & clarifications",
  },
  {
    key: "traceability" as const,
    label: "Traceability",
    icon: Link2,
    hint: "Req → story coverage",
  },
  {
    key: "risks" as const,
    label: "Risks",
    icon: AlertCircle,
    hint: "From business case analysis",
  },
];

export function BaExtractionReviewPanel({
  projectId,
  projectName,
  counts,
  nothingAppliedYet,
  aiSummary,
  pendingReviewId,
  isWelcome = false,
  onContinue,
}: {
  projectId: string;
  projectName: string;
  counts: ExtractionSummaryCounts;
  nothingAppliedYet: boolean;
  aiSummary: string | null;
  pendingReviewId: string | null;
  isWelcome?: boolean;
  onContinue?: () => void;
}) {
  const proposalsHref = pendingReviewId
    ? `/workspace/proposals?persona=ba&project=${projectId}&review=${pendingReviewId}`
    : `/workspace/proposals?persona=ba&project=${projectId}`;

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="ba-extraction-review">
      <DxWidgetHeader
        title="Auto-created workspace review"
        subtitle={`${projectName} — AI extracted this from the PM business case. Review before applying.`}
      />

      <div className="space-y-5 px-5 py-5 md:px-6">
        {isWelcome ? (
          <div className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1] px-4 py-3 text-sm text-[#1C4A2E]">
            <strong>Welcome to your BA workspace.</strong> Your PM uploaded a business case — review
            AI-extracted requirements below, then open the AI Review Queue to apply accepted items.
          </div>
        ) : null}

        {aiSummary ? (
          <p className="rounded-lg border border-[#C6DDD0] bg-[#EEF5F1] px-4 py-3 text-sm leading-relaxed text-[#2C2C28]">
            {aiSummary}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CARD_META.map(({ key, label, icon: Icon, hint }) => {
            const raw = counts[key];
            const display = key === "traceability" && raw != null ? `${raw}%` : formatExtractionCount(raw);
            const isEmpty = raw == null;

            return (
              <article
                key={key}
                className="rounded-lg border border-[var(--dx-rul)] bg-[var(--dx-bas)] px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-[#1C4A2E]" aria-hidden />
                  <p className={dxClass.panelTitle}>{label}</p>
                </div>
                <p
                  className={`${dxClass.display} mt-2 text-2xl ${
                    isEmpty ? "text-[var(--dx-fnt)]" : "text-[#0D0D0B]"
                  }`}
                >
                  {display}
                </p>
                <p className="mt-1 text-[10px] leading-snug text-[#6B6B64]">{hint}</p>
              </article>
            );
          })}
        </div>

        {nothingAppliedYet ? (
          <div className="flex items-start gap-2 rounded-lg border border-[#F0D4B0] bg-[#FEF6EC] px-4 py-3 text-sm text-[#B7620A]">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              <strong>Nothing applied yet.</strong> Proposals are in the AI Review Queue — approve
              items to populate your requirements register.
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href={proposalsHref} className={dxClass.btnGhost}>
            Open AI Review Queue
            <ArrowRight size={14} aria-hidden />
          </Link>
          {onContinue ? (
            <button type="button" onClick={onContinue} className={dxClass.btnPrimary}>
              Continue to BA dashboard
              <ArrowRight size={14} aria-hidden />
            </button>
          ) : (
            <Link href={`/workspace/ba?project=${projectId}`} className={dxClass.btnPrimary}>
              Continue to BA dashboard
              <ArrowRight size={14} aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
