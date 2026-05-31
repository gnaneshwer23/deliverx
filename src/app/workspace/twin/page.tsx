import Link from "next/link";
import { Telescope } from "lucide-react";
import { runEnterpriseLoop } from "@/services/twin";
import { getDefaultPortfolio } from "@/services/portfolio";
import { TwinKpiStrip } from "@/components/twin/twin-kpi-strip";
import {
  SystemMetricsPanel,
  BehavioralPatternsPanel,
} from "@/components/twin/system-metrics-panel";
import { CascadingRiskPanel } from "@/components/twin/cascading-risk-panel";
import { OptimizationPanel } from "@/components/twin/optimization-panel";
import { ScenarioSimulator } from "@/components/twin/scenario-simulator";
import { TwinSnapshotPanel } from "@/components/twin/twin-snapshot-panel";
import { IntelligenceLiveRefresh } from "@/components/intelligence/intelligence-live-refresh";
import { listTwinSnapshots } from "@/services/twin";

export const dynamic = "force-dynamic";

export default async function DigitalTwinPage() {
  const portfolio = await getDefaultPortfolio();

  if (!portfolio) {
    return (
      <main className="p-8">
        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Telescope size={20} className="text-indigo-600" /> Digital Twin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A live model of how your organisation delivers work.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">
            Portfolio not configured.
          </p>
          <p className="mt-1">
            The twin builds on top of the portfolio model — set one up first.
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

  const { state, cascading, optimization } = await runEnterpriseLoop();
  const snapshots = await listTwinSnapshots(20);

  return (
    <IntelligenceLiveRefresh table="twin_snapshots">
    <main className="p-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Telescope size={20} className="text-indigo-600" /> Digital Twin
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A live simulation of enterprise delivery — predicts behaviour, runs
            scenarios, and surfaces strategic actions.
          </p>
        </div>
        <span className="text-xs text-slate-400">
          State captured {new Date(state.capturedAt).toLocaleString()}
        </span>
      </header>

      <TwinKpiStrip state={state} />

      <div className="mt-6">
        <TwinSnapshotPanel initialSnapshots={snapshots} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SystemMetricsPanel state={state} />
        <BehavioralPatternsPanel state={state} />
      </div>

      <div className="mt-6">
        <CascadingRiskPanel cascading={cascading} />
      </div>

      <div className="mt-6">
        <ScenarioSimulator />
      </div>

      <div className="mt-6">
        <OptimizationPanel actions={optimization} />
      </div>

      <p className="mt-6 text-[11px] text-slate-400">
        Phase 8 guardrails: nothing auto-applies to governance, teams, or
        timelines. The twin simulates — your team decides.
      </p>
    </main>
    </IntelligenceLiveRefresh>
  );
}
