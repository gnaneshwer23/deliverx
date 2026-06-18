import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ARTIFACT_ENTITY_LABELS } from "@/lib/approval/constants";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import { dxClass } from "@/lib/dx-theme";

export function PendingReviewsStrip({
  reviews,
  personaLabel,
}: {
  reviews: (ArtifactReviewRow & { project_name?: string })[];
  personaLabel?: string;
}) {
  if (reviews.length === 0) return null;

  const visible = reviews.slice(0, 3);
  const overflow = reviews.length - visible.length;

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
          href="/workspace/proposals"
          className={`${dxClass.btnGhost} inline-flex shrink-0 items-center gap-1 text-[10px]`}
        >
          Approval centre
          <ArrowRight size={12} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
