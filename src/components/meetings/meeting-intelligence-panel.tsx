"use client";

import Link from "next/link";
import { CalendarDays, Mic, Sparkles } from "lucide-react";
import type { MeetingIntelligenceStats } from "@/services/meetingIntelligenceEngine";
import { MEETING_CEREMONY_TEMPLATES } from "@/lib/ai/prompts/meeting-ceremonies";
import { MeetingCeremonyBadge } from "./meeting-ceremony";
import { dxClass } from "@/lib/dx-theme";

export function MeetingIntelligencePanel({
  projectId,
  stats,
}: {
  projectId?: string;
  stats?: MeetingIntelligenceStats;
}) {
  if (!projectId || !stats) {
    return (
      <div className={`${dxClass.card} p-6 text-sm text-[#6B6B64]`}>
        Select a project to view meeting intelligence.
      </div>
    );
  }

  const ceremonyEntries = MEETING_CEREMONY_TEMPLATES.filter((t) => t.id !== "general");

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`}>
      <div className="border-b border-[#E4E4DC] px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className={`${dxClass.display} text-lg`}>Meeting intelligence</h3>
            <p className="text-sm text-[#6B6B64]">
              Upload recordings, pick a ceremony template, extract blockers and dependencies, then
              queue proposals for approval.
            </p>
          </div>
          <Link
            href={`/project/${projectId}/meetings`}
            className={`${dxClass.btnPrimary} text-[10px]`}
          >
            Open meetings →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Meetings" value={stats.totalMeetings} />
          <Stat label="Extracted" value={stats.withExtraction} />
          <Stat label="Transcripts" value={stats.withTranscript} />
          <Stat label="Pending proposals" value={stats.pendingProposals} tone="amber" />
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
            Ceremony quick-start
          </h4>
          <ul className="space-y-2">
            {ceremonyEntries.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/project/${projectId}/meetings?ceremony=${t.id}`}
                  className="flex items-start gap-3 rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-4 py-3 transition hover:border-[#1C4A2E]/30"
                >
                  <MeetingCeremonyBadge type={t.id} />
                  <div>
                    <p className="text-sm font-medium text-[#0D0D0B]">{t.label}</p>
                    <p className="text-xs text-[#6B6B64]">{t.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B6B64]">
            Recent extractions
          </h4>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-[#6B6B64]">
              No meetings yet. Log a standup or upload a recording to begin.
            </p>
          ) : (
            <ul className="space-y-2">
              {stats.recent.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-[#E4E4DC] px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{m.title}</span>
                    <MeetingCeremonyBadge type={m.ceremonyType} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#6B6B64]">
                    {m.hasSummary ? (
                      <span className="inline-flex items-center gap-1 text-[#1A6B3A]">
                        <Sparkles size={10} /> Extracted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Mic size={10} /> Awaiting extraction
                      </span>
                    )}
                    {m.proposalCount > 0 ? (
                      <Link href="/workspace/proposals" className="text-[#B7620A] hover:underline">
                        {m.proposalCount} pending proposal{m.proposalCount === 1 ? "" : "s"}
                      </Link>
                    ) : null}
                    {m.scheduledAt ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={10} />
                        {new Date(m.scheduledAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "amber";
}) {
  return (
    <div className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2">
      <p className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#A8A89E]">
        {label}
      </p>
      <p
        className={`text-xl font-semibold ${tone === "amber" && value > 0 ? "text-[#B7620A]" : "text-[#0D0D0B]"}`}
      >
        {value}
      </p>
    </div>
  );
}
