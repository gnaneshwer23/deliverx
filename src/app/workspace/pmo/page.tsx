import Link from "next/link";
import { Command, ArrowRight, Activity } from "lucide-react";
import { getPmoSnapshot, getDefaultPortfolio } from "@/services/portfolio";
import { ExecutiveSummary } from "@/components/portfolio/executive-summary";
import { ForecastPanel } from "@/components/portfolio/forecast-panel";
import {
  RisksPanel,
  BottlenecksPanel,
} from "@/components/portfolio/list-panel";

export const dynamic = "force-dynamic";

const TIER_COLOR = (n: number) =>
  n >= 80
    ? "text-emerald-600"
    : n >= 60
      ? "text-amber-600"
      : n === 0
        ? "text-slate-400"
        : "text-rose-600";

export default async function PmoPage() {
  const portfolio = await getDefaultPortfolio();
  if (!portfolio) {
    return (
      <main className="p-8">
        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Command size={20} className="text-indigo-600" /> PMO Dashboard
          </h1>
        </header>
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">Portfolio not configured.</p>
          <p className="mt-1">
            Create a portfolio to unlock organisation-wide intelligence.
          </p>
          <Link
            href="/workspace/portfolio"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to portfolio
          </Link>
        </div>
      </main>
    );
  }

  const snap = await getPmoSnapshot();

  return (
    <main className="p-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Command size={20} className="text-indigo-600" /> PMO Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cross-programme command centre — risks, bottlenecks, blast radius,
            forecasts.
          </p>
        </div>
        <Link
          href="/workspace/portfolio"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          Portfolio view <ArrowRight size={14} />
        </Link>
      </header>

      <section className="mb-6 rounded-xl border border-l-4 border-l-indigo-500 border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Activity size={14} /> Portfolio Health
          </div>
          <span
            className={`text-3xl font-bold ${TIER_COLOR(snap.portfolioHealth)}`}
          >
            {snap.portfolioHealth || "—"}
          </span>
        </div>
      </section>

      <ExecutiveSummary summary={snap.executiveSummary} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RisksPanel risks={snap.topRisks} />
        <BottlenecksPanel bottlenecks={snap.bottlenecks} />
        <ForecastPanel forecasts={snap.forecasts} title="Short-horizon Forecasts" />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-semibold">Blast Radius (at-risk → downstream)</h3>
        {snap.blastRadius.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            No propagating risk paths detected.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {snap.blastRadius.map((b, i) => (
              <li
                key={`${b.sourceProjectId}-${b.targetProjectId}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2"
              >
                <span className="font-medium text-slate-900">{b.sourceName}</span>
                <ArrowRight size={12} className="text-slate-400" />
                <span className="font-medium text-slate-900">{b.targetName}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
                  hop {b.hops} · {b.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
