import Link from "next/link";
import { listOrgReports } from "@/services/governance";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function WorkspaceReportsPage() {
  const reports = await listOrgReports(50);

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX · Intelligence" title="Status" titleEm="reports" />
      <div className="p-6 md:p-8">
        {reports.length === 0 ? (
          <div className={`${dxClass.cardPad} text-center`}>
            <p className={`${dxClass.display} text-lg`}>No reports yet</p>
            <p className="mt-2 text-sm text-[#6B6B64]">
              Create reports from a project reports page.
            </p>
            <Link href="/workspace/projects" className={`${dxClass.btnPrimary} mt-5 inline-flex text-[10px]`}>
              View projects
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {reports.map((r) => (
              <li key={r.id} className={`${dxClass.cardPad}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{r.title}</h2>
                    <p className="mt-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#A8A89E]">
                      {r.project_name} · {r.report_type} ·{" "}
                      {(r.review_status ?? "draft").toString()} ·{" "}
                      {new Date(r.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/project/${r.project_id}/reports/${r.id}`}
                    className="text-sm text-[#1C4A2E] hover:underline"
                  >
                    View
                  </Link>
                </div>
                <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-[#6B6B64]">
                  {r.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
