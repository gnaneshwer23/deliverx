import { CalendarDays } from "lucide-react";
import { listMeetings } from "@/services/governance";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { MeetingForm } from "./meeting-form";
import { MeetingAiPanel } from "./meeting-ai-panel";

type Params = Promise<{ id: string }>;

export default async function ProjectMeetingsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const meetings = await listMeetings(id);

  return (
    <main className="p-6">
      <PageHeader
        title="Meetings"
        description="Upload recordings for transcription, capture notes, and generate AI summaries."
        icon={CalendarDays}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <EmptyState title="No meetings yet" description="Schedule your first meeting." />
          ) : (
            meetings.map((m) => (
              <article
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold">{m.title}</h2>
                  <div className="flex items-center gap-2">
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
                />
              </article>
            ))
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New meeting</h2>
          <MeetingForm projectId={id} />
        </div>
      </div>
    </main>
  );
}
