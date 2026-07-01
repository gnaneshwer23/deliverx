"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import {
  ARTIFACT_ENTITY_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/approval/constants";
import type { ArtifactReviewRow } from "@/lib/approval/artifact-review";
import { BusinessCaseArtifactReviewItem } from "@/components/approvals/business-case-artifact-review";

export function ArtifactReviewsPanel({
  reviews,
  showProject = true,
  emptyMessage = "No AI artifacts pending review.",
  highlightReviewId,
}: {
  reviews: (ArtifactReviewRow & { project_name?: string })[];
  showProject?: boolean;
  emptyMessage?: string;
  highlightReviewId?: string | null;
}) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  return (
    <ArtifactReviewsList
      reviews={reviews}
      showProject={showProject}
      highlightReviewId={highlightReviewId}
    />
  );
}

function ArtifactReviewsList({
  reviews,
  showProject,
  highlightReviewId,
}: {
  reviews: (ArtifactReviewRow & { project_name?: string })[];
  showProject?: boolean;
  highlightReviewId?: string | null;
}) {
  useEffect(() => {
    if (!highlightReviewId) return;
    const el = document.getElementById(`review-${highlightReviewId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightReviewId]);

  return (
    <ul className="space-y-3">
      {reviews.map((review) =>
        review.source === "business_case_upload" &&
        review.payload?.structuredAnalysis != null ? (
          <BusinessCaseArtifactReviewItem
            key={review.id}
            review={review}
            showProject={showProject}
            highlighted={review.id === highlightReviewId}
          />
        ) : (
          <ArtifactReviewRowItem
            key={review.id}
            review={review}
            showProject={showProject}
            highlighted={review.id === highlightReviewId}
          />
        ),
      )}
    </ul>
  );
}

function ArtifactReviewRowItem({
  review,
  showProject,
  highlighted = false,
}: {
  review: ArtifactReviewRow & { project_name?: string };
  showProject?: boolean;
  highlighted?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resolve(action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/artifacts/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: review.id, action }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Action failed");
          return;
        }
        router.refresh();
      } catch {
        setError("Could not reach the server");
      }
    });
  }

  return (
    <li
      id={`review-${review.id}`}
      className={`rounded-lg border bg-[#EEF5F1] p-4 ${
        highlighted ? "border-[#1C4A2E] ring-2 ring-[#C6DDD0]" : "border-[#C6DDD0]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[#1C4A2E]">
            {ARTIFACT_ENTITY_LABELS[review.entity_type]} ·{" "}
            {REVIEW_STATUS_LABELS[review.status]}
          </p>
          <p className="mt-1 font-medium text-[#2C2C28]">{review.title}</p>
          {showProject && review.project_name ? (
            <Link
              href={`/project/${review.project_id}`}
              className="text-sm text-[#1C4A2E] hover:underline"
            >
              {review.project_name}
            </Link>
          ) : null}
          <p className="mt-1 text-sm text-[#6B6B64]">{review.summary}</p>
          {review.entity_ids.length > 0 ? (
            <p className="mt-1 text-xs text-[#A8A89E]">
              {review.entity_ids.length} item{review.entity_ids.length === 1 ? "" : "s"} in bundle
            </p>
          ) : null}
        </div>
        {review.status === "needs_review" ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("approve")}
              className="inline-flex items-center gap-1 rounded bg-[#1C4A2E] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#163d26] disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Approve
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("reject")}
              className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              <X size={12} />
              Reject
            </button>
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </li>
  );
}
