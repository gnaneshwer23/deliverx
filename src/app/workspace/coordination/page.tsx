import { BrainCircuit } from "lucide-react";
import {
  runEnterpriseCoordinationLoop,
  listPartners,
} from "@/services/coordination";
import { AgentFeed } from "@/components/coordination/agent-feed";
import { GraphView } from "@/components/coordination/graph-view";
import {
  CoordinationStabilityPanel,
  GovernanceFrictionPanel,
} from "@/components/coordination/coordination-metrics";
import { RecommendationChainPanel } from "@/components/coordination/recommendation-chain-panel";
import { CrossOrgAlertsPanel } from "@/components/coordination/cross-org-panel";
import { PartnerForm } from "./partner-form";
import { RunLoopButton } from "@/components/intelligence/run-loop-button";
import { IntelligenceLiveRefresh } from "@/components/intelligence/intelligence-live-refresh";
import { listCoordinationRuns } from "@/services/coordination";

export const dynamic = "force-dynamic";

export default async function CoordinationPage() {
  const [snapshot, partners, recentRuns] = await Promise.all([
    runEnterpriseCoordinationLoop(),
    listPartners(),
    listCoordinationRuns(5),
  ]);

  const lastRunAt = recentRuns[0]?.captured_at;

  return (
    <IntelligenceLiveRefresh table="coordination_runs">
      <main className="p-8">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <BrainCircuit size={22} className="text-violet-600" /> Coordination
              Intelligence
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Multi-agent coordination across your enterprise ecosystem. Agents
              analyse signals, traverse the knowledge graph, and propose unified
              recommendations — always subject to human governance.
            </p>
          </div>
          <div className="shrink-0 space-y-1 text-right">
            <RunLoopButton
              postUrl="/api/coordination/loop"
              label="Run coordination loop"
            />
            <p className="text-[11px] text-slate-400">
              Daily cron 07:00 UTC ·{" "}
              {lastRunAt
                ? `Last saved ${new Date(lastRunAt).toLocaleString()}`
                : "No saved runs yet"}
            </p>
          </div>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CoordinationStabilityPanel stability={snapshot.coordinationStability} />
        <GovernanceFrictionPanel friction={snapshot.governanceFriction} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AgentFeed items={snapshot.agentInsights} />
        <GraphView graph={snapshot.graph} />
      </div>

      <div className="mb-6">
        <RecommendationChainPanel
          recommendations={snapshot.recommendations}
          chainSummary={snapshot.chainSummary}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CrossOrgAlertsPanel alerts={snapshot.crossOrgAlerts} />

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 font-semibold">Ecosystem Partners</h3>
          <p className="mb-4 text-xs text-slate-500">
            Model clients, vendors, and consulting partners for cross-org
            coordination intelligence.
          </p>
          <PartnerForm />
          {partners.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {partners.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs capitalize text-slate-500">
                    {p.partnerType.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-slate-400">No partners configured.</p>
          )}
        </section>
      </div>

      <p className="text-[11px] text-slate-400">
        Phase 9 guardrails: agents never auto-execute cross-org decisions,
        override governance, or resolve conflicts without human approval.
      </p>
    </main>
    </IntelligenceLiveRefresh>
  );
}
