import { Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveCharter, listAlignmentScores } from "@/services/charter";
import { getProjectAlignment } from "@/services/alignment";
import { AlignmentRing } from "@/components/alignment/alignment-ring";
import { CharterForm, AlignmentHistory } from "./charter-form";

type Params = Promise<{ id: string }>;

export default async function ProjectCharterPage({ params }: { params: Params }) {
  const { id } = await params;
  const [charter, alignment, history] = await Promise.all([
    getActiveCharter(id),
    getProjectAlignment(id),
    listAlignmentScores(id, 10),
  ]);

  return (
    <main className="p-6">
      <PageHeader
        title="Charter & alignment"
        description="Define project intent and measure delivery alignment — DeliverX's core intelligence signal."
        icon={Target}
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <AlignmentRing
            score={alignment.score}
            tier={alignment.tier}
            trend={alignment.trend}
            delta={alignment.latest?.delta ?? null}
            size="lg"
          />
          <ul className="mt-4 w-full space-y-1 text-xs text-slate-600">
            {alignment.factors.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <CharterForm projectId={id} charter={charter} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Score history</h2>
        <AlignmentHistory scores={history} />
      </section>
    </main>
  );
}
