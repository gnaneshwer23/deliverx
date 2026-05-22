import { Gauge } from "lucide-react";
import type { DigitalTwinState } from "@/services/twinEngine";

type Bar = {
  label: string;
  value: number; // 0..1
  inverse?: boolean; // higher = worse if true
  hint?: string;
};

function tone(value: number, inverse?: boolean) {
  const lift = inverse ? 1 - value : value;
  return lift > 0.66
    ? "bg-emerald-500"
    : lift > 0.4
      ? "bg-amber-500"
      : "bg-rose-500";
}

function MetricRow({ bar }: { bar: Bar }) {
  return (
    <li>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">{bar.label}</p>
          {bar.hint ? (
            <p className="text-[10px] text-slate-400">{bar.hint}</p>
          ) : null}
        </div>
        <span className="text-xs text-slate-500">
          {Math.round(bar.value * 100)}%
        </span>
      </div>
      <div className="h-1.5 rounded bg-slate-200">
        <div
          className={`h-1.5 rounded ${tone(bar.value, bar.inverse)}`}
          style={{ width: `${Math.round(bar.value * 100)}%` }}
        />
      </div>
    </li>
  );
}

export function SystemMetricsPanel({ state }: { state: DigitalTwinState }) {
  const bars: Bar[] = [
    {
      label: "Dependency load",
      value: state.systemMetrics.dependencyLoad,
      inverse: true,
      hint: "Cross-project coupling intensity",
    },
    {
      label: "Governance latency",
      value: state.systemMetrics.governanceLatency,
      inverse: true,
      hint: "How long decisions take to land",
    },
    {
      label: "Execution pressure",
      value: state.systemMetrics.executionPressure,
      inverse: true,
      hint: "Aggregate load on delivery teams",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <Gauge size={14} /> System Metrics
      </div>
      <ul className="space-y-3">
        {bars.map((b) => (
          <MetricRow bar={b} key={b.label} />
        ))}
      </ul>
    </section>
  );
}

export function BehavioralPatternsPanel({
  state,
}: {
  state: DigitalTwinState;
}) {
  const bars: Bar[] = [
    {
      label: "Escalation speed",
      value: state.behavioralPatterns.escalationSpeed,
      hint: "How fast issues reach the right level",
    },
    {
      label: "Approval speed",
      value: state.behavioralPatterns.approvalSpeed,
      hint: "How quickly decisions clear",
    },
    {
      label: "Coordination efficiency",
      value: state.behavioralPatterns.coordinationEfficiency,
      hint: "Cross-team handoff quality",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <Gauge size={14} /> Behavioural Patterns
      </div>
      <ul className="space-y-3">
        {bars.map((b) => (
          <MetricRow bar={b} key={b.label} />
        ))}
      </ul>
    </section>
  );
}
