import Link from "next/link";
import { FileBarChart2 } from "lucide-react";
import { listReports } from "@/services/governance";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReportForm } from "./report-form";
import { ReportAiPanel } from "./report-ai-panel";

type Params = Promise<{ id: string }>;

export default async function ProjectReportsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const reports = await listReports(id);

  return (
    <main className="p-6">
      <PageHeader
        title="Reports"
        description="Status reports and delivery narratives."
        icon={FileBarChart2}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {reports.length === 0 ? (
            <EmptyState title="No reports yet" description="Create your first status report." />
          ) : (
            reports.map((r) => (
              <article
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
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
            ))
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
