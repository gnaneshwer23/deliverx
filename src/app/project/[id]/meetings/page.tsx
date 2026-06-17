import { CalendarDays } from "lucide-react";
import { countMeetings, listMeetings } from "@/services/governance";
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
  parsePageParam,
  totalPages,
} from "@/components/shared/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { MeetingCeremonyBadge } from "@/components/meetings/meeting-ceremony";
import { MeetingIntelligencePanel } from "@/components/meetings/meeting-intelligence-panel";
import { getProjectMeetingIntelligenceStats } from "@/services/meetingIntelligence";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";
import { MeetingForm } from "./meeting-form";
import { MeetingAiPanel } from "./meeting-ai-panel";

type Params = Promise<{ id: string }>;
type Search = Promise<{ page?: string; ceremony?: string }>;

const VALID_CEREMONIES = new Set([
  "general",
  "standup",
  "planning",
  "retro",
  "steering",
  "workshop",
]);

function parseCeremony(raw?: string): MeetingCeremonyType {
  if (raw && VALID_CEREMONIES.has(raw)) return raw as MeetingCeremonyType;
  return "general";
}

export default async function ProjectMeetingsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { page: pageRaw, ceremony: ceremonyRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const defaultCeremony = parseCeremony(ceremonyRaw);

  const [meetings, total, intelligenceStats] = await Promise.all([
    listMeetings(id, { page, pageSize: DEFAULT_PAGE_SIZE }),
    countMeetings(id),
    getProjectMeetingIntelligenceStats(id).catch(() => ({
      totalMeetings: 0,
      withExtraction: 0,
      withTranscript: 0,
      pendingProposals: 0,
      byCeremony: {
        general: 0,
        standup: 0,
        planning: 0,
        retro: 0,
        steering: 0,
        workshop: 0,
      },
      recent: [],
    })),
  ]);
  const pages = totalPages(total, DEFAULT_PAGE_SIZE);

  function buildHref(nextPage: number) {
    return nextPage > 0 ? `/project/${id}/meetings?page=${nextPage}` : `/project/${id}/meetings`;
  }

  return (
    <main className="p-6">
      <PageHeader
        title="Meetings"
        description="Pick a ceremony template, upload recordings for transcription, and extract structured actions into the approval queue."
        icon={CalendarDays}
      />

      <MeetingIntelligencePanel projectId={id} stats={intelligenceStats} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {meetings.length === 0 ? (
            <EmptyState title="No meetings yet" description="Schedule your first meeting." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-0 divide-y divide-slate-100 p-4">
                {meetings.map((m) => (
                  <article key={m.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-semibold">{m.title}</h2>
                      <div className="flex items-center gap-2">
                        <MeetingCeremonyBadge type={m.ceremony_type ?? "general"} />
                        {m.recording_path ? (
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                            Recording
                          </span>
                        ) : null}
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                    {m.scheduled_at ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(m.scheduled_at).toLocaleString()}
                      </p>
                    ) : null}
                    {m.notes ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{m.notes}</p>
                    ) : null}
                    {m.transcript ? (
                      <details className="mt-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                        <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-400">
                          Transcript
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{m.transcript}</p>
                      </details>
                    ) : null}
                    {m.summary ? (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Summary</p>
                        {m.summary}
                      </div>
                    ) : null}
                    <MeetingAiPanel
                      projectId={id}
                      meetingId={m.id}
                      title={m.title}
                      notes={m.notes}
                      hasSummary={Boolean(m.summary)}
                      ceremonyType={m.ceremony_type ?? "general"}
                    />
                  </article>
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={pages}
                totalItems={total}
                buildHref={buildHref}
              />
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New meeting</h2>
          <MeetingForm projectId={id} defaultCeremony={defaultCeremony} />
        </div>
      </div>
    </main>
  );
}
