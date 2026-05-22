import Link from "next/link";
import { Target } from "lucide-react";
import { AlignmentRing } from "@/components/alignment/alignment-ring";
import type { AlignmentTier, AlignmentTrend } from "@/services/alignmentEngine";

export function AlignmentSummaryCard({
  projectId,
  projectName,
  score,
  tier,
  trend,
  delta,
  hasCharter,
}: {
  projectId: string;
  projectName: string;
  score: number;
  tier: AlignmentTier;
  trend: AlignmentTrend;
  delta: number | null;
  hasCharter: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#0F766E]/20 bg-gradient-to-br from-[#0F766E]/5 to-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Target size={16} className="text-[#0F766E]" />
            <h2 className="text-sm font-semibold text-slate-800">Charter alignment</h2>
          </div>
          <p className="text-xs text-slate-500">
            {hasCharter ? projectName : "Add a charter to unlock alignment scoring"}
          </p>
          <Link
            href={`/project/${projectId}/charter`}
            className="mt-2 inline-block text-xs font-medium text-[#0F766E] hover:underline"
          >
            {hasCharter ? "View charter →" : "Set up charter →"}
          </Link>
        </div>
        <AlignmentRing
          score={hasCharter ? score : 0}
          tier={hasCharter ? tier : "misaligned"}
          trend={trend}
          delta={delta}
          size="sm"
          label=""
        />
      </div>
    </div>
  );
}
