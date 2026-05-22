import Link from "next/link";
import { GitBranch } from "lucide-react";
import { getProjectTraceability } from "@/services/traceability";
import { PageHeader } from "@/components/shared/page-header";
import { TraceabilityPanel } from "@/components/traceability/traceability-panel";

type Params = Promise<{ id: string }>;

export default async function ProjectTraceabilityPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const trace = await getProjectTraceability(id);

  return (
    <main className="p-6">
      <PageHeader
        title="Traceability"
        description="Follow how meeting outcomes flow into decisions and RAID — all inside DeliverX."
        icon={GitBranch}
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Meetings with outputs", value: trace.stats.meetingsWithOutputs },
          { label: "Linked decisions", value: trace.stats.linkedDecisions },
          { label: "Linked RAID items", value: trace.stats.linkedRaid },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className="mt-1 text-2xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      <TraceabilityPanel projectId={id} trace={trace} />

      <p className="mt-6 text-xs text-slate-500">
        Tip: upload a recording on{" "}
        <Link href={`/project/${id}/meetings`} className="font-medium text-[#0F766E] hover:underline">
          Meetings
        </Link>
        , approve an AI summary, and tick “Create decisions / RAID” to populate this graph.
      </p>
    </main>
  );
}
