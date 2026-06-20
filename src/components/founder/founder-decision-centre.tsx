"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { FounderDecisionActions } from "@/components/founder/founder-decision-actions";
import { dxClass } from "@/lib/dx-theme";
import { buildFounderProposalsHref } from "@/lib/founder-day-one-panels";
import { buildFounderDecisionCentreHref } from "@/lib/founder-steady-state-panels";
import type { FounderDecisionCentreItem } from "@/lib/founder-decision-centre";

const IMPACT_STYLE = {
  High: "border-rose-200 bg-rose-50 text-rose-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-800",
  Low: "border-[#E4E4DC] bg-[#FAFAF7] text-[#6B6B64]",
} as const;

function FounderReviewDecisionRow({
  item,
  projectId,
}: {
  item: FounderDecisionCentreItem;
  projectId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function approve() {
    if (!item.reviewId) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/artifacts/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.reviewId, action: "approve" }),
        });
        const payload = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !payload.ok) {
          setError(payload.error ?? "Could not approve");
          return;
        }
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  return (
    <li className="px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${IMPACT_STYLE[item.impact]}`}
            >
              Sign off
            </span>
            <span className="text-xs text-[#A8A89E]">{item.waitLabel}</span>
          </div>
          <p className="mt-2 text-base font-medium text-[#2C2C28]">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6B6B64]">{item.context}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={approve}
            className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Approve
          </button>
          <Link
            href={item.href ?? buildFounderProposalsHref(projectId, item.reviewId)}
            className="inline-flex items-center gap-1 rounded border border-[#C6DDD0] bg-white px-3 py-1.5 text-xs font-medium text-[#1C4A2E] hover:bg-[#EEF5F1]"
          >
            Review
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}

function FounderGovernanceDecisionRow({ item }: { item: FounderDecisionCentreItem }) {
  if (!item.row) return null;

  return (
    <li className="px-6 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${IMPACT_STYLE[item.impact]}`}
            >
              {item.impact} impact
            </span>
            <span className="text-xs text-[#A8A89E]">{item.waitLabel}</span>
          </div>
          <p className="mt-2 text-base font-medium text-[#2C2C28]">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6B6B64]">{item.context}</p>
        </div>
        <FounderDecisionActions row={item.row} />
      </div>
    </li>
  );
}

export function FounderDecisionCentre({
  items,
  projectId,
  dataSource = "live",
}: {
  items: FounderDecisionCentreItem[];
  projectId?: string;
  dataSource?: "live" | "fallback";
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="founder-decision-centre" id="decisions">
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className={`${dxClass.display} text-lg`}>Decision centre</h3>
            <p className="mt-1 text-sm text-[#6B6B64]">
              What needs your approval — outcomes and commitments only.
            </p>
          </div>
          <Link
            href={buildFounderDecisionCentreHref(projectId)}
            className="text-xs font-medium text-[#1C4A2E] hover:underline"
          >
            View all
          </Link>
        </div>
        {dataSource === "fallback" ? (
          <p className="mt-2 text-xs text-[#B7620A]">
            Sample decisions — connect governance for live queue.
          </p>
        ) : null}
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {items.length ? (
          items.map((item) =>
            item.kind === "review" ? (
              <FounderReviewDecisionRow key={item.id} item={item} projectId={projectId} />
            ) : (
              <FounderGovernanceDecisionRow key={item.id} item={item} />
            ),
          )
        ) : (
          <li className="px-6 py-10 text-center text-sm text-[#6B6B64]">
            No decisions waiting — the business is clear to proceed this quarter.
          </li>
        )}
      </ul>
    </div>
  );
}
