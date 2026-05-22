"use client";

import { useState, useTransition } from "react";
import { FlaskConical, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type {
  ScenarioId,
  SimulationResult,
} from "@/services/twinEngine";

const SCENARIOS: { id: ScenarioId; label: string; description: string }[] = [
  {
    id: "increase_governance_speed",
    label: "Increase governance speed",
    description: "Cut approval cycle time",
  },
  {
    id: "dependency_delay",
    label: "Upstream dependency slips",
    description: "What if a critical dependency falls behind?",
  },
  {
    id: "resolve_top_blockers",
    label: "Resolve top blockers",
    description: "Targeted blocker clear-out across projects",
  },
  {
    id: "split_critical_milestone",
    label: "Split critical milestone",
    description: "Phase the largest at-risk milestone",
  },
  {
    id: "add_team_capacity",
    label: "Add team capacity",
    description: "Onboard additional engineers",
  },
  {
    id: "escalate_top_dependency",
    label: "Escalate top dependency",
    description: "Push the highest-severity link to steering",
  },
];

function diffTone(n: number, inverse = false) {
  if (Math.abs(n) < 0.5 && !inverse) return "text-slate-500";
  const positive = inverse ? n < 0 : n > 0;
  return positive ? "text-emerald-600" : "text-rose-600";
}

function diffIcon(n: number) {
  if (Math.abs(n) < 0.5) return Minus;
  return n > 0 ? ArrowUpRight : ArrowDownRight;
}

function fmtScore(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${Math.round(n)}`;
}

function fmtPct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${Math.round(n * 100)}%`;
}

export function ScenarioSimulator() {
  const [activeId, setActiveId] = useState<ScenarioId>(
    "increase_governance_speed",
  );
  const [intensity, setIntensity] = useState(0.2);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function run() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/twin/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: activeId, intensity }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Simulation failed");
        }
        const data = (await res.json()) as SimulationResult;
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <section className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-indigo-700">
        <FlaskConical size={14} />
        <h3 className="font-semibold">Scenario Simulator</h3>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={`rounded-lg border p-3 text-left text-sm transition ${
              activeId === s.id
                ? "border-indigo-500 bg-white shadow-sm"
                : "border-slate-200 bg-white/60 hover:border-indigo-200"
            }`}
          >
            <p className="font-medium text-slate-900">{s.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label className="flex-1 text-xs text-slate-600">
          Intensity
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="mt-1 block w-full accent-indigo-600"
          />
          <span className="mt-0.5 block text-[10px] text-slate-400">
            {Math.round(intensity * 100)}%
          </span>
        </label>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "Simulating…" : "Run simulation"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {result.scenarioLabel}
            </p>
            <span className="text-[10px] text-slate-400">
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-sm text-slate-700">{result.narrative}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <DiffPill
              label="Health"
              value={fmtScore(result.diff.health)}
              tone={diffTone(result.diff.health)}
              icon={diffIcon(result.diff.health)}
            />
            <DiffPill
              label="Stability"
              value={fmtScore(result.diff.stability)}
              tone={diffTone(result.diff.stability)}
              icon={diffIcon(result.diff.stability)}
            />
            <DiffPill
              label="Failure risk"
              value={fmtPct(result.diff.failureProbability)}
              tone={diffTone(result.diff.failureProbability, true)}
              icon={diffIcon(result.diff.failureProbability)}
            />
            <DiffPill
              label="Milestone risk"
              value={fmtPct(result.diff.milestoneRisk)}
              tone={diffTone(result.diff.milestoneRisk, true)}
              icon={diffIcon(result.diff.milestoneRisk)}
            />
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            Simulations are predictive. Nothing is auto-applied — review the
            outcome and decide.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function DiffPill({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-0.5 flex items-center gap-1 text-sm font-semibold ${tone}`}>
        <Icon size={12} /> {value}
      </p>
    </div>
  );
}
