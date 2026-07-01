"use client";

import Link from "next/link";
import type { ProposedActionRow } from "@/services/proposedActions";
import { pmMeetingReviewUrl } from "@/lib/meeting-flow";

/** Compact PM mission banner linking to the dedicated meeting review page. */
export function MeetingIntelReviewPanel({
  projectId,
  proposals,
}: {
  projectId: string;
  proposals: ProposedActionRow[];
}) {
  if (proposals.length === 0) return null;

  const meetingId = proposals.find((proposal) => proposal.source_id)?.source_id;
  if (!meetingId) return null;

  return (
    <section className="rounded-2xl border border-[#E4E4DC] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#2C2C28]">Meeting intel review</h3>
          <p className="mt-1 text-xs text-[#6B6B64]">
            {proposals.length} pending action{proposals.length === 1 ? "" : "s"} from recent
            meetings — open the review page to approve, edit, or remove.
          </p>
        </div>
        <Link
          href={pmMeetingReviewUrl(projectId, meetingId)}
          className="rounded-lg bg-[#1C4A2E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163d26]"
        >
          Open review
        </Link>
      </div>
    </section>
  );
}
