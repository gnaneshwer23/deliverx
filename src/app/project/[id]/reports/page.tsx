import Link from "next/link";
import { FileBarChart2 } from "lucide-react";
import { countReports, listReports } from "@/services/governance";
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
  parsePageParam,
  totalPages,
} from "@/components/shared/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportForm } from "./report-form";
import { ReportAiPanel } from "./report-ai-panel";

type Params = Promise<{ id: string }>;
type Search = Promise<{ page?: string }>;

export default async function ProjectReportsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const [reports, total] = await Promise.all([
    listReports(id, { page, pageSize: DEFAULT_PAGE_SIZE }),
    countReports(id),
  ]);
  const pages = totalPages(total, DEFAULT_PAGE_SIZE);

  function buildHref(nextPage: number) {
    return nextPage > 0 ? `/project/${id}/reports?page=${nextPage}` : `/project/${id}/reports`;
  }

  return (
    <main className="p-6">
      <PageHeader
        title="Reports"
        description="Status reports and delivery narratives."
        icon={FileBarChart2}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {reports.length === 0 ? (
            <EmptyState title="No reports yet" description="Create your first status report." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100 p-4">
                {reports.map((r) => (
                  <article key={r.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold">{r.title}</h2>
                        <p className="mt-1 text-xs text-slate-500">
                          {r.report_type} · {new Date(r.generated_at).toLocaleString()}
                          {r.ai_generated ? " · AI" : ""}
                        </p>
                      </div>
                      <Link
                        href={`/project/${id}/reports/${r.id}`}
                        className="text-sm text-[#0F766E] hover:underline"
                      >
                        View
                      </Link>
                    </div>
                    <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">
                      {r.content}
                    </p>
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
        <div className="space-y-6">
          <ReportAiPanel projectId={id} />
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Manual report</h2>
            <ReportForm projectId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}
