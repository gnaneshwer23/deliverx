import Link from "next/link";
import { listReports } from "@/services/governance";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string; reportId: string }>;

export default async function ReportViewerPage({
  params,
}: {
  params: Params;
}) {
  const { id, reportId } = await params;
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("project_id", id)
    .single();

  if (!report) {
    return (
      <main className="p-6">
        <p className="text-slate-500">Report not found.</p>
        <Link href={`/project/${id}/reports`} className="mt-4 text-[#0F766E] hover:underline">
          Back to reports
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6">
      <Link
        href={`/project/${id}/reports`}
        className="text-sm text-[#0F766E] hover:underline"
      >
        ← Back to reports
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{report.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {report.report_type} · {new Date(report.generated_at as string).toLocaleString()}
      </p>
      <article className="prose prose-slate mt-6 max-w-none whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        {report.content as string}
      </article>
    </main>
  );
}
