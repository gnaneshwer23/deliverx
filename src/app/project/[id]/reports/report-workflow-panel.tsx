"use client";

import { useActionState } from "react";
import {
  markReportReviewedAction,
  publishReportAction,
  type ActionState,
} from "../governance/actions";
import { dxClass } from "@/lib/dx-theme";
import type { ReportReviewStatus } from "@/services/governance";

const initial: ActionState = { ok: false };

export function ReportWorkflowPanel({
  projectId,
  reportId,
  reviewStatus,
  publishedAt,
  stakeholderEmails,
}: {
  projectId: string;
  reportId: string;
  reviewStatus: ReportReviewStatus;
  publishedAt: string | null;
  stakeholderEmails: string[];
}) {
  const [reviewState, reviewAction, reviewPending] = useActionState(
    markReportReviewedAction,
    initial,
  );
  const [publishState, publishAction, publishPending] = useActionState(
    publishReportAction,
    initial,
  );

  const statusLabel =
    reviewStatus === "published"
      ? "Published"
      : reviewStatus === "reviewed"
        ? "Reviewed"
        : "Draft";

  return (
    <section className={`${dxClass.cardPad} mt-6 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Reporting pipeline</h2>
        <span
          className={`font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider ${
            reviewStatus === "published"
              ? "text-[#1C4A2E]"
              : reviewStatus === "reviewed"
                ? "text-amber-700"
                : "text-[#A8A89E]"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {reviewStatus === "draft" ? (
        <form action={reviewAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="reportId" value={reportId} />
          <button type="submit" disabled={reviewPending} className={dxClass.btnGhost}>
            {reviewPending ? "Saving…" : "Mark as reviewed"}
          </button>
        </form>
      ) : null}

      {reviewStatus !== "published" ? (
        <form action={publishAction} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="reportId" value={reportId} />
          <label className="block">
            <span className={dxClass.label}>Stakeholder emails (comma-separated)</span>
            <textarea
              name="stakeholderEmails"
              rows={2}
              defaultValue={stakeholderEmails.join(", ")}
              placeholder="sponsor@company.com, steering@company.com"
              className={`${dxClass.input} mt-1.5 w-full resize-y`}
            />
          </label>
          <button type="submit" disabled={publishPending} className={dxClass.btnPrimary}>
            {publishPending ? "Publishing…" : "Publish to stakeholders"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-[#6B6B64]">
          Published {publishedAt ? new Date(publishedAt).toLocaleString() : ""}
          {stakeholderEmails.length > 0
            ? ` · notified ${stakeholderEmails.length} stakeholder${stakeholderEmails.length === 1 ? "" : "s"}`
            : ""}
        </p>
      )}

      {reviewState.error ? (
        <p className="text-sm text-red-600">{reviewState.error}</p>
      ) : null}
      {publishState.error ? (
        <p className="text-sm text-red-600">{publishState.error}</p>
      ) : null}
      {reviewState.ok && reviewStatus === "draft" ? (
        <p className="text-sm text-[#1C4A2E]">Marked as reviewed.</p>
      ) : null}
      {publishState.ok ? (
        <p className="text-sm text-[#1C4A2E]">Report published.</p>
      ) : null}
    </section>
  );
}
