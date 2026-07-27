import Link from "next/link";
import { Command, ArrowRight, Activity } from "lucide-react";
import { getPmoSnapshot, resolveDefaultPortfolio } from "@/services/portfolio";
import { ExecutiveSummary } from "@/components/portfolio/executive-summary";
import { ForecastPanel } from "@/components/portfolio/forecast-panel";
import {
  RisksPanel,
  BottlenecksPanel,
} from "@/components/portfolio/list-panel";
import { DemotedWorkspaceBanner } from "@/components/dx/demoted-workspace-banner";

export const dynamic = "force-dynamic";

const TIER_COLOR = (n: number) =>
  n >= 80
    ? "text-emerald-600"
    : n >= 60
      ? "text-amber-600"
      : n === 0
        ? "text-slate-400"
        : "text-rose-600";

const healthBand = (n: number) =>
  n <= 0 ? "unavailable" : n >= 80 ? "strong" : n >= 60 ? "watch" : "at risk";

export default async function PmoPage() {
  const portfolio = await resolveDefaultPortfolio();
  if (!portfolio) {
    return (
      <main className="p-8">
        <DemotedWorkspaceBanner
          title="PMO Dashboard is outside the primary pilot journey"
          body="This Mission Control surface remains bookmarkable for legacy org work. No portfolio is configured, so there are no charts to interpret."
        />
        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Command size={20} className="text-indigo-600" aria-hidden /> PMO
            Dashboard
          </h1>
        </header>
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">Portfolio not configured.</p>
          <p className="mt-1">
            Create a portfolio to unlock organisation-wide intelligence, or
            return to Professional Home for the pilot journey.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Back to Professional Home
            </Link>
            <Link
              href="/workspace/portfolio"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Go to portfolio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const snap = await getPmoSnapshot();
  const healthValue = snap.portfolioHealth || 0;
  const healthText =
    healthValue > 0
      ? `Portfolio health ${healthValue} of 100 (${healthBand(healthValue)}). Organisation simulation heuristic — not capability.`
      : "Portfolio health unavailable. No capability score is implied.";

  return (
    <main className="p-8">
      <DemotedWorkspaceBanner
        title="PMO Dashboard is outside the primary pilot journey"
        body="Risks, bottlenecks and forecasts below are legacy portfolio signals. They are not Professional Intelligence capability scores."
      />
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Command size={20} className="text-indigo-600" aria-hidden /> PMO
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cross-programme command centre — risks, bottlenecks, blast radius,
            forecasts.
          </p>
        </div>
        <Link
          href="/workspace/portfolio"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          Portfolio view <ArrowRight size={14} aria-hidden />
        </Link>
      </header>

      <section
        className="mb-6 rounded-xl border border-l-4 border-l-indigo-500 border-slate-200 bg-white p-6 shadow-sm"
        aria-label="Portfolio health"
      >
        <p className="text-xs text-slate-500">{healthText}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Activity size={14} aria-hidden /> Portfolio Health
          </div>
          <span
            className={`text-3xl font-bold ${TIER_COLOR(healthValue)}`}
            aria-label={healthText}
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
        <h2 className="mb-3 font-semibold">Blast Radius (at-risk → downstream)</h2>
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
                <ArrowRight size={12} className="text-slate-400" aria-hidden />
                <span className="font-medium text-slate-900">{b.targetName}</span>
                <span className="ml-auto text-xs uppercase tracking-wide text-slate-500">
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
