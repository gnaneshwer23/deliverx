import { dxClass } from "@/lib/dx-theme";
import { formatHonestKpi } from "@/lib/honest-kpi";

type ClassificationReviewCardProps = {
  title: string;
  suggestedType: string;
  confidence: number | null;
  summary: string;
};

/** Stub card for ingest flow — human review before classification is applied. */
export function ClassificationReviewCard({
  title,
  suggestedType,
  confidence,
  summary,
}: ClassificationReviewCardProps) {
  const confidenceKpi = formatHonestKpi(
    confidence != null ? `${Math.round(confidence * 100)}%` : null,
    "Confidence available after classification runs",
  );

  return (
    <div className={`${dxClass.cardPad}`}>
      <p className={dxClass.panelTitle}>Classification review</p>
      <h3 className="mt-2 font-semibold text-[#0D0D0B]">{title}</h3>
      <p className="mt-2 text-sm text-[#6B6B64]">{summary}</p>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-[#F0F0E8] pb-2">
          <dt className="text-[#6B6B64]">Suggested type</dt>
          <dd className="font-medium">{suggestedType}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-[#F0F0E8] pb-2">
          <dt className="text-[#6B6B64]">Confidence</dt>
          <dd className="font-medium">{confidenceKpi.value}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" className={dxClass.btnPrimary} disabled>
          Approve classification
        </button>
        <button type="button" className={dxClass.btnGhost} disabled>
          Edit &amp; retry
        </button>
      </div>
      <p className="mt-3 text-xs text-[#A8A89E]">
        AI never auto-applies — review required before saving.
      </p>
    </div>
  );
}
