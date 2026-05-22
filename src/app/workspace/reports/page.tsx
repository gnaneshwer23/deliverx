import Link from "next/link";
import { FileBarChart2 } from "lucide-react";
import { listOrgReports } from "@/services/governance";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function WorkspaceReportsPage() {
  const reports = await listOrgReports(50);

  return (
    <main className="p-8">
      <PageHeader
        title="Reports"
        description="All status reports across your organisation."
        icon={FileBarChart2}
      />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="Create reports from a project reports page."
          actionLabel="View projects"
          actionHref="/workspace/projects"
        />
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{r.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.project_name} · {r.report_type} ·{" "}
                    {new Date(r.generated_at).toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/project/${r.project_id}/reports/${r.id}`}
                  className="text-sm text-[#0F766E] hover:underline"
                >
                  View
                </Link>
              </div>
              <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                {r.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
