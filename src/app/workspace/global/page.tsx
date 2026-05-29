import { Globe2 } from "lucide-react";
import { runGlobalLoop } from "@/services/global";
import { GlobalInsightsPanel } from "@/components/global/global-insights-panel";
import { GlobalBenchmarkPanel } from "@/components/global/global-benchmark-panel";
import { StrategicCopilotPanel } from "@/components/global/strategic-copilot-panel";
import { EvolutionMapPanel } from "@/components/global/evolution-map-panel";
import { GlobalGraphPanel } from "@/components/global/global-graph-panel";
import {
  LocalizedRecsPanel,
  PrivacyBadge,
} from "@/components/global/localized-recs-panel";

export const dynamic = "force-dynamic";

export default async function GlobalIntelligencePage() {
  const snapshot = await runGlobalLoop();

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Globe2 size={22} className="text-sky-600" /> Global Intelligence
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Privacy-preserving global intelligence infrastructure. Pattern-level
          learning from enterprise delivery signals — localized recommendations
          for your organisation, never raw cross-org data exposure.
        </p>
        {"networkUnavailable" in snapshot && snapshot.networkUnavailable ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Cross-org network aggregates are unavailable (set{" "}
            <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> on the server).
            Local metrics and recommendations still run from your organisation data.
          </p>
        ) : null}
      </header>

      <div className="mb-6">
        <PrivacyBadge
          aggregationThresholdMet={snapshot.privacy.aggregationThresholdMet}
          contributorOrgCount={snapshot.privacy.contributorOrgCount}
        />
      </div>

      <div className="mb-6">
        <EvolutionMapPanel evolution={snapshot.evolution} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlobalInsightsPanel patterns={snapshot.patterns} />
        <GlobalBenchmarkPanel benchmarks={snapshot.benchmarks} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StrategicCopilotPanel />
        <LocalizedRecsPanel recommendations={snapshot.localizedRecommendations} />
      </div>

      <div className="mb-6">
        <GlobalGraphPanel graph={snapshot.graph} />
      </div>

      <section className="rounded-xl border border-dashed border-sky-200 bg-sky-50/30 p-4 text-xs text-slate-600">
        <p className="font-medium text-sky-800">Intelligence compounding loop</p>
        <p className="mt-1">
          More orgs → more patterns → better models → better recommendations →
          better outcomes → more adoption. Your organisation contributes
          anonymized patterns on each visit — never identifiable data.
        </p>
      </section>

      <p className="mt-6 text-[11px] text-slate-400">
        Phase 10 guardrails: never expose identifiable enterprise data, never
        leak cross-org insights, never enable direct org comparison without
        anonymization. All outputs show confidence levels and require human
        governance for strategic actions.
      </p>
    </main>
  );
}
