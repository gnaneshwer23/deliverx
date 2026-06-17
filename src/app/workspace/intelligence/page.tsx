import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDeliveryEvalMetrics } from "@/services/intelligenceMetrics";
import { getContinuousLearningSnapshot } from "@/services/continuousLearning";
import { IntelligenceMetricsPanel } from "@/components/intelligence/intelligence-metrics-panel";
import { ContinuousLearningPanel } from "@/components/intelligence/continuous-learning-panel";
import { DeliveryNarratorPanel } from "@/components/intelligence/delivery-narrator-panel";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function IntelligencePage() {
  const [metrics, learning, topProject] = await Promise.all([
    getDeliveryEvalMetrics().catch(() => null),
    getContinuousLearningSnapshot().catch(() => null),
    loadTopProject(),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Intelligence"
        title="Delivery"
        titleEm="learning"
        action={
          <Link href="/workspace/twin" className={`${dxClass.btnGhost} text-[10px]`}>
            Digital twin →
          </Link>
        }
      />
      <div className="space-y-8 p-6 md:p-8">
        <p className="max-w-2xl text-sm text-[#6B6B64]">
          Narrator briefings, sponsor Q&amp;A, forecast evaluation, and training data
          export — the learning loop for autonomous delivery intelligence.
        </p>

        {metrics ? <IntelligenceMetricsPanel metrics={metrics} /> : null}

        {learning ? <ContinuousLearningPanel snapshot={learning} /> : null}

        {topProject ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DeliveryNarratorPanel
              projectId={topProject.id}
              projectName={topProject.name}
            />
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold">Project-level briefing</h3>
              <p className="mt-2 text-sm text-slate-600">
                Open a project overview for narrator and sponsor Q&amp;A on that
                programme.
              </p>
              <Link
                href={`/project/${topProject.id}`}
                className="mt-4 inline-flex text-sm font-medium text-teal-700 hover:underline"
              >
                {topProject.name} →
              </Link>
            </section>
          </div>
        ) : null}
      </div>
    </>
  );
}

async function loadTopProject() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, name")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
