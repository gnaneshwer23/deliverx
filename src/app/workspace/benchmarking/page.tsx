import { LineChart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadProjectSignals } from "@/services/projectSignals";
import { computeProjectHealth, computeDeliveryConfidence } from "@/services/intelligenceEngine";

export default async function BenchmarkingPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, created_at");

  const ranked: {
    id: string;
    name: string;
    deliveryType: string | null;
    health: number;
    confidence: number;
  }[] = [];

  for (const p of projects ?? []) {
    const signals = await loadProjectSignals(p.id);
    const health = computeProjectHealth(signals);
    const conf = computeDeliveryConfidence(signals);
    ranked.push({
      id: p.id,
      name: p.name,
      deliveryType: p.delivery_type ?? null,
      health: health.score,
      confidence: conf.score,
    });
  }

  const avgHealth =
    ranked.length === 0
      ? 0
      : Math.round(ranked.reduce((s, r) => s + r.health, 0) / ranked.length);
  const avgConfidence =
    ranked.length === 0
      ? 0
      : Math.round(ranked.reduce((s, r) => s + r.confidence, 0) / ranked.length);

  const topProjects = [...ranked].sort((a, b) => b.health - a.health).slice(0, 5);

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <LineChart size={20} className="text-[#0F766E]" /> Benchmarking
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          How your portfolio stacks up across health and delivery confidence.
        </p>
      </header>

      {ranked.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No projects to benchmark yet.
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="Avg. project health" value={`${avgHealth}/100`} />
            <Metric label="Avg. delivery confidence" value={`${avgConfidence}%`} />
            <Metric label="Projects scored" value={String(ranked.length)} />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Top performers</h2>
            <ul className="divide-y divide-slate-100">
              {topProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/project/${p.id}`}
                    className="flex items-center justify-between py-3 transition hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {p.deliveryType ?? "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">
                        Health <span className="font-semibold text-[#0F172A]">{p.health}</span>
                      </span>
                      <span className="text-slate-500">
                        Confidence <span className="font-semibold text-[#0F172A]">{p.confidence}%</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-6 text-xs text-slate-500">
            Scores derive from the deterministic mock signal loader. Once the
            tasks/blockers schema lands, benchmarks update automatically.
          </p>
        </>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
