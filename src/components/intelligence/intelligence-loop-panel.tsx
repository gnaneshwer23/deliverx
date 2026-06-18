import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { IntelligenceLoopSnapshot, LoopStageStatus } from "@/services/intelligenceLoopEngine";
import { dxClass } from "@/lib/dx-theme";

const STATUS_STYLE: Record<LoopStageStatus, string> = {
  healthy: "border-emerald-500 bg-emerald-50/60 text-emerald-800",
  watch: "border-amber-500 bg-amber-50/60 text-amber-900",
  idle: "border-[#E4E4DC] bg-[#FAFAF8] text-[#6B6B64]",
  blocked: "border-rose-500 bg-rose-50/60 text-rose-900",
};

const STATUS_DOT: Record<LoopStageStatus, string> = {
  healthy: "bg-emerald-500",
  watch: "bg-amber-500",
  idle: "bg-[#C4C4BC]",
  blocked: "bg-rose-500",
};

export function IntelligenceLoopPanel({
  snapshot,
  compact = false,
}: {
  snapshot: IntelligenceLoopSnapshot;
  compact?: boolean;
}) {
  const scoreBorder =
    snapshot.loopScore >= 80
      ? "border-l-emerald-500"
      : snapshot.loopScore >= 60
        ? "border-l-amber-500"
        : "border-l-rose-500";

  return (
    <section className={`${dxClass.cardPad} space-y-5`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Closed-loop intelligence</h3>
          <p className="mt-1 max-w-2xl text-sm text-[#6B6B64]">
            Observe → Understand → Predict → Recommend → Approve → Learn. AI suggests;
            humans approve; dashboards update; outcomes compound.
          </p>
        </div>
        <div
          className={`rounded-lg border-l-4 bg-white px-4 py-2 shadow-sm ${scoreBorder}`}
        >
          <p className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wide text-[#A8A89E]">
            Loop score
          </p>
          <p className="text-2xl font-semibold tabular-nums">{snapshot.loopScore}</p>
        </div>
      </div>

      <p className="rounded-md border border-[#E4E4DC] bg-[#FAFAF8] px-4 py-3 text-sm text-[#3D3D38]">
        {snapshot.narrative}
      </p>

      <div
        className={
          compact
            ? "grid grid-cols-2 gap-3 lg:grid-cols-3"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {snapshot.stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            {index < snapshot.stages.length - 1 && !compact ? (
              <ArrowRight
                size={14}
                className="absolute -right-2 top-5 z-10 hidden text-[#C4C4BC] xl:block"
                aria-hidden
              />
            ) : null}
            <article
              className={`rounded-lg border-l-4 px-3 py-3 ${STATUS_STYLE[stage.status]}`}
            >
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${STATUS_DOT[stage.status]}`} />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {stage.label}
                </p>
              </div>
              <p className="mt-2 text-sm font-medium">{stage.metric}</p>
              {!compact ? (
                <p className="mt-1 text-xs opacity-80">{stage.detail}</p>
              ) : null}
            </article>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B6B64]">
        {snapshot.humanGateActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 font-medium text-violet-800">
            <RefreshCw size={12} /> Human approval gate active
          </span>
        ) : null}
        <span>
          Updated {new Date(snapshot.capturedAt).toLocaleString()}
        </span>
        <Link href="/workspace/intelligence" className="font-medium text-teal-700 hover:underline">
          Intelligence hub →
        </Link>
        <Link href="/workspace/twin" className="font-medium text-teal-700 hover:underline">
          Digital twin →
        </Link>
      </div>
    </section>
  );
}
