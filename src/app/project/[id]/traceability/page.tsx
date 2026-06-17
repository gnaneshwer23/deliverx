import Link from "next/link";
import { GitBranch } from "lucide-react";
import { getProjectTraceability } from "@/services/traceability";
import { getDeliveryTraceability } from "@/services/deliveryTraceability";
import { PageHeader } from "@/components/shared/page-header";
import { TraceabilityPanel } from "@/components/traceability/traceability-panel";
import { DeliveryTraceabilityPanel } from "@/components/traceability/delivery-traceability-panel";

type Params = Promise<{ id: string }>;

export default async function ProjectTraceabilityPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [trace, delivery] = await Promise.all([
    getProjectTraceability(id),
    getDeliveryTraceability(id).catch(() => ({
      rows: [],
      coverage: {
        requirements: 0,
        withStory: 0,
        withTask: 0,
        withTest: 0,
        storyCoveragePct: 0,
        taskCoveragePct: 0,
        testCoveragePct: 0,
        overallPct: 0,
      },
      gaps: [],
    })),
  ]);

  return (
    <main className="space-y-10 p-6">
      <PageHeader
        title="Traceability"
        description="Delivery chain and governance links — all inside DeliverX."
        icon={GitBranch}
      />

      <DeliveryTraceabilityPanel projectId={id} graph={delivery} />

      <section className="space-y-4 border-t border-slate-200 pt-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Governance traceability</h2>
          <p className="text-sm text-slate-500">Meeting outcomes → decisions → RAID</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
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

        <p className="text-xs text-slate-500">
          Tip: upload a recording on{" "}
          <Link href={`/project/${id}/meetings`} className="font-medium text-[#0F766E] hover:underline">
            Meetings
          </Link>
          , approve an AI summary, and tick “Create decisions / RAID” to populate the governance graph.
        </p>
      </section>
    </main>
  );
}
