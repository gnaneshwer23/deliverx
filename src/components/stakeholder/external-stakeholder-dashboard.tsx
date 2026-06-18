import type { ExternalStakeholderView } from "@/services/stakeholderShareEngine";
import { AlignmentRing } from "@/components/alignment/alignment-ring";
import { tierForScore } from "@/services/alignmentEngine";

const HEALTH_BORDER: Record<string, string> = {
  healthy: "border-emerald-500",
  watch: "border-amber-500",
  "at-risk": "border-rose-500",
};

export function ExternalStakeholderDashboard({
  view,
  label,
}: {
  view: ExternalStakeholderView;
  label?: string | null;
}) {
  const alignmentTier = view.alignment.score !== null ? tierForScore(view.alignment.score) : "misaligned";

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#0D0D0B]">
      <header className="border-b border-[#E4E4DC] bg-white px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#A8A89E]">
              DeliverX · Stakeholder view
              {label ? ` · ${label}` : ""}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{view.projectName}</h1>
            <p className="mt-1 text-sm text-[#6B6B64]">{view.organisationName}</p>
          </div>
          <div className="text-right text-xs text-[#A8A89E]">
            <p className="capitalize">Status: {view.status.replace(/_/g, " ")}</p>
            <p>Updated {new Date(view.generatedAt).toLocaleString()}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {(view.goal || view.timeline) && (
          <section className="rounded-xl border border-[#E4E4DC] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B6B64]">
              Project summary
            </h2>
            {view.goal ? <p className="mt-3 text-sm leading-relaxed">{view.goal}</p> : null}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#6B6B64]">
              {view.timeline ? <span>Timeline: {view.timeline}</span> : null}
              {view.deliveryType ? <span>Delivery: {view.deliveryType}</span> : null}
            </div>
          </section>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <section
            className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${HEALTH_BORDER[view.health.tier] ?? "border-slate-300"}`}
          >
            <p className="text-xs uppercase text-[#A8A89E]">Health</p>
            <p className="mt-2 text-3xl font-bold">{view.health.score}</p>
            <p className="text-sm capitalize text-[#6B6B64]">{view.health.tier.replace("-", " ")}</p>
            <ul className="mt-3 space-y-1 text-xs text-[#6B6B64]">
              {view.health.factors.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[#E4E4DC] bg-white p-6 shadow-sm">
            <p className="text-xs uppercase text-[#A8A89E]">Delivery confidence</p>
            <p className="mt-2 text-3xl font-bold">{view.confidence.score}%</p>
            <p className="text-sm capitalize text-[#6B6B64]">{view.confidence.tier}</p>
            <p className="mt-3 text-xs text-[#6B6B64]">{view.confidence.summary}</p>
          </section>

          <section className="rounded-xl border border-[#0F766E]/20 bg-gradient-to-br from-[#EEF5F1] to-white p-6 shadow-sm">
            <p className="text-xs uppercase text-[#A8A89E]">Charter alignment</p>
            <div className="mt-2 flex items-center gap-4">
              {view.alignment.score !== null ? (
                <AlignmentRing
                  score={view.alignment.score}
                  tier={alignmentTier}
                  trend="flat"
                  delta={null}
                  size="sm"
                  label=""
                />
              ) : (
                <p className="text-sm text-[#6B6B64]">Not yet scored</p>
              )}
            </div>
            {view.alignment.factors.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-[#6B6B64]">
                {view.alignment.factors.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <section className="rounded-xl border border-[#E4E4DC] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold">Delivery forecast</h2>
          <p className="mt-2 text-sm text-[#6B6B64]">{view.forecast.prediction}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Expected date" value={view.forecast.expectedDate} />
            <Stat
              label="Schedule slip"
              value={view.forecast.delayDays > 0 ? `${view.forecast.delayDays} days` : "On track"}
            />
            <Stat label="Anchor" value={view.forecast.anchorLabel} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[#E4E4DC] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Milestones</h2>
            {view.milestones.length === 0 ? (
              <p className="mt-3 text-sm text-[#6B6B64]">No milestones tracked yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {view.milestones.slice(0, 8).map((m) => (
                  <li
                    key={`${m.title}-${m.targetDate}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-[#F0F0E8] px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{m.title}</p>
                      <p className="text-xs capitalize text-[#6B6B64]">
                        {m.status.replace(/_/g, " ")} · {m.confidenceScore}% confidence
                      </p>
                    </div>
                    {m.targetDate ? (
                      <span className="shrink-0 text-xs text-[#6B6B64]">{m.targetDate}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-[#E4E4DC] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Risk summary</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <MiniStat label="Risks" value={view.raidSummary.openRisks} />
              <MiniStat label="Issues" value={view.raidSummary.openIssues} />
              <MiniStat label="Dependencies" value={view.raidSummary.openDependencies} />
            </div>
            {view.topRisks.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {view.topRisks.map((r) => (
                  <li
                    key={`${r.type}-${r.title}`}
                    className="rounded-lg border border-[#F0F0E8] px-3 py-2 text-sm"
                  >
                    <span className="text-xs uppercase text-[#A8A89E]">{r.type}</span>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs capitalize text-[#6B6B64]">{r.severity} severity</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#6B6B64]">No open RAID items.</p>
            )}
          </section>
        </div>

        {view.latestReport ? (
          <section className="rounded-xl border border-[#E4E4DC] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Latest published report</h2>
            <p className="mt-1 text-xs text-[#A8A89E]">
              {view.latestReport.title} ·{" "}
              {new Date(view.latestReport.publishedAt).toLocaleDateString()}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6B6B64]">
              {view.latestReport.excerpt}
            </p>
          </section>
        ) : null}

        <p className="text-center text-xs text-[#A8A89E]">
          Read-only stakeholder view · Powered by DeliverX
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#F0F0E8] bg-[#FAFAF7] px-3 py-2">
      <p className="text-[10px] uppercase text-[#A8A89E]">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#F0F0E8] bg-[#FAFAF7] px-2 py-2">
      <p className="text-[10px] uppercase text-[#A8A89E]">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
