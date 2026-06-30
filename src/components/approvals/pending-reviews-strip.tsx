import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ARTIFACT_ENTITY_LABELS } from "@/lib/approval/constants";
import { ArtifactReviewsPanel } from "@/components/approvals/artifact-reviews-panel";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { dxClass } from "@/lib/dx-theme";

export function PendingReviewsStrip({
  reviews,
  personaLabel,
  persona,
  inlineActions = false,
}: {
  reviews: (ArtifactReviewRow & { project_name?: string })[];
  personaLabel?: string;
  persona?: MissionPersonaId;
  inlineActions?: boolean;
}) {
  if (reviews.length === 0) return null;

  const visible = reviews.slice(0, 3);
  const overflow = reviews.length - visible.length;
  const proposalsHref = persona
    ? `/workspace/proposals?persona=${persona}`
    : "/workspace/proposals";

  if (inlineActions) {
    return (
      <div
        className={`${dxClass.card} border-l-4 border-l-[#B7620A] bg-[#FDF8F3] p-4`}
        data-testid="pending-reviews-strip"
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#B7620A]" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B7620A]">
                AI output review
                {personaLabel ? ` · ${personaLabel}` : ""}
              </p>
            </div>
          </div>
          <Link
            href={proposalsHref}
            className={`${dxClass.btnGhost} inline-flex shrink-0 items-center gap-1 text-[10px]`}
          >
            {reviews.length} pending
            <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
        <ArtifactReviewsPanel
          reviews={visible}
          showProject
          emptyMessage="No pending reviews."
        />
        {overflow > 0 ? (
          <p className="mt-2 text-xs text-[#6B6B64]">
            +{overflow} more —{" "}
            <Link href={proposalsHref} className="text-[#1C4A2E] hover:underline">
              open review centre
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`${dxClass.card} border-l-4 border-l-[#B7620A] bg-[#FDF8F3] p-4`}
      data-testid="pending-reviews-strip"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#B7620A]" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#B7620A]">
              Pending AI review{reviews.length === 1 ? "" : "s"}
              {personaLabel ? ` · ${personaLabel}` : ""}
            </p>
            <ul className="mt-2 space-y-1">
              {visible.map((review) => (
                <li key={review.id} className="truncate text-sm text-[#2C2C28]">
                  <span className="text-[#6B6B64]">
                    {ARTIFACT_ENTITY_LABELS[review.entity_type]} ·{" "}
                  </span>
                  {review.title}
                  {review.project_name ? (
                    <span className="text-[#A8A89E]"> — {review.project_name}</span>
                  ) : null}
                </li>
              ))}
              {overflow > 0 ? (
                <li className="text-xs text-[#6B6B64]">+{overflow} more in queue</li>
              ) : null}
            </ul>
          </div>
        </div>
        <Link
          href={proposalsHref}
          className={`${dxClass.btnGhost} inline-flex shrink-0 items-center gap-1 text-[10px]`}
        >
          AI output review
          <ArrowRight size={12} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
