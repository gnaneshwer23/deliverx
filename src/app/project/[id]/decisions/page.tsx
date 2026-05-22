import { Scale } from "lucide-react";
import { countDecisions, listDecisions, listMeetings } from "@/services/governance";
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
  parsePageParam,
  totalPages,
} from "@/components/shared/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DecisionForm } from "./decision-form";

type Params = Promise<{ id: string }>;
type Search = Promise<{ page?: string }>;

export default async function ProjectDecisionsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const [decisions, total, meetings] = await Promise.all([
    listDecisions(id, { page, pageSize: DEFAULT_PAGE_SIZE }),
    countDecisions(id),
    listMeetings(id),
  ]);
  const pages = totalPages(total, DEFAULT_PAGE_SIZE);

  const meetingMap = Object.fromEntries(meetings.map((m) => [m.id, m.title]));

  function buildHref(nextPage: number) {
    return nextPage > 0 ? `/project/${id}/decisions?page=${nextPage}` : `/project/${id}/decisions`;
  }

  return (
    <main className="p-6">
      <PageHeader
        title="Decision register"
        description="Track proposed and approved decisions."
        icon={Scale}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {decisions.length === 0 ? (
            <EmptyState title="No decisions yet" description="Record the first decision." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50 text-slate-500">
                  <TableRow>
                    <TableHead className="px-4">Title</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4">Meeting</TableHead>
                    <TableHead className="px-4">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decisions.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="px-4">
                        <div className="font-medium">{d.title}</div>
                        {d.context ? (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{d.context}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell className="px-4 text-slate-600">
                        {d.meeting_id ? (meetingMap[d.meeting_id] ?? "—") : "—"}
                      </TableCell>
                      <TableCell className="px-4 text-slate-500">
                        {new Date(d.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          <h2 className="mb-3 text-sm font-semibold text-slate-700">New decision</h2>
          <DecisionForm
            projectId={id}
            meetings={meetings.map((m) => ({ id: m.id, title: m.title }))}
          />
        </div>
      </div>
    </main>
  );
}
