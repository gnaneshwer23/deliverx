import { CalendarDays } from "lucide-react";
import { listMeetings } from "@/services/governance";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { MeetingForm } from "./meeting-form";

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
        description="Schedule meetings and capture notes and summaries."
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
                  <StatusBadge status={m.status} />
                </div>
                {m.scheduled_at ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(m.scheduled_at).toLocaleString()}
                  </p>
                ) : null}
                {m.notes ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{m.notes}</p>
                ) : null}
                {m.summary ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Summary</p>
                    {m.summary}
                  </div>
                ) : null}
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
