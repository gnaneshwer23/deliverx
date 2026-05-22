import { Activity, AlertTriangle, Layers, Network } from "lucide-react";
import type { PortfolioSnapshot } from "@/services/portfolioEngine";

const TIER_BORDER = (health: number) =>
  health >= 80
    ? "border-green-500"
    : health >= 60
      ? "border-yellow-500"
      : "border-red-500";

export function PortfolioSummary({ snapshot }: { snapshot: PortfolioSnapshot }) {
  const cards = [
    {
      label: "Portfolio Health",
      value: `${snapshot.health}`,
      suffix: " / 100",
      icon: Activity,
      border: TIER_BORDER(snapshot.health),
    },
    {
      label: "Active Programmes",
      value: `${snapshot.totalProgrammes}`,
      icon: Layers,
      border: "border-slate-200",
    },
    {
      label: "At-Risk Projects",
      value: `${snapshot.atRiskProjects}`,
      icon: AlertTriangle,
      border:
        snapshot.atRiskProjects > 0 ? "border-yellow-500" : "border-slate-200",
    },
    {
      label: "Dependencies",
      value: `${snapshot.totalDependencies}`,
      icon: Network,
      border: "border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-xl border border-l-4 bg-white p-6 shadow-sm ${c.border}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-slate-500">{c.label}</p>
            <c.icon size={14} className="text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <h3 className="text-3xl font-bold">{c.value}</h3>
            {c.suffix ? (
              <span className="text-sm text-slate-500">{c.suffix}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
