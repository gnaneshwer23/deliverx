"use client";

import { useState } from "react";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { WorkflowDiagram } from "@/components/marketing/marketing-workflow-diagram";
import {
  DELIVERY_STAGES,
  ROLES,
  THREAD_CALLOUTS,
} from "@/lib/marketing/landing-data";

const THREAD_DOT: Record<string, string> = {
  red: "#F87171",
  amber: "#FBBF24",
  green: "#3D9660",
};

/** Signal graph nodes — fixed positions for SVG illustration (not interactive cards). */
const SIGNAL_NODES = [
  { id: "pm", x: 50, y: 50, hub: true },
  { id: "sponsor", x: 18, y: 22 },
  { id: "ba", x: 82, y: 18 },
  { id: "po", x: 88, y: 52 },
  { id: "eng", x: 72, y: 82 },
  { id: "qa", x: 28, y: 82 },
  { id: "sm", x: 12, y: 52 },
] as const;

const SIGNAL_EDGES: [string, string][] = [
  ["pm", "sponsor"],
  ["pm", "ba"],
  ["pm", "po"],
  ["pm", "eng"],
  ["pm", "qa"],
  ["pm", "sm"],
  ["ba", "eng"],
  ["eng", "qa"],
  ["qa", "sponsor"],
];

function SignalGraphIllustration() {
  const nodeMap = Object.fromEntries(SIGNAL_NODES.map((n) => [n.id, n]));

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(13,13,11,0.4)] p-4 md:aspect-auto md:min-h-[320px] md:p-6"
      aria-hidden
    >
      <p className="mb-4 font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
        Signal graph · after PM approval
      </p>
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="signal-edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(61,150,96,0.2)" />
            <stop offset="50%" stopColor="rgba(61,150,96,0.7)" />
            <stop offset="100%" stopColor="rgba(61,150,96,0.2)" />
          </linearGradient>
          <filter id="signal-glow">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {SIGNAL_EDGES.map(([from, to], i) => {
          const a = nodeMap[from];
          const b = nodeMap[to];
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#signal-edge)"
              strokeWidth="0.35"
              strokeDasharray="1.2 1.8"
              className="marketing-signal-edge"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          );
        })}

        {SIGNAL_NODES.map((node) => {
          const role = ROLES[node.id as keyof typeof ROLES];
          const isHub = "hub" in node && node.hub;
          const r = isHub ? 5.5 : 4;
          return (
            <g key={node.id} filter={isHub ? "url(#signal-glow)" : undefined}>
              {isHub ? (
                <circle cx={node.x} cy={node.y} r={7} fill="rgba(61,150,96,0.15)" className="marketing-signal-hub-pulse" />
              ) : null}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={isHub ? "#3D9660" : "rgba(255,255,255,0.08)"}
                stroke={isHub ? "#3D9660" : role.accent}
                strokeWidth={isHub ? 0.6 : 0.4}
              />
              <text
                x={node.x}
                y={node.y + 0.8}
                textAnchor="middle"
                className="fill-white font-[family-name:var(--font-mkt-mono)] text-[2.8px] font-semibold"
                style={{ fontSize: isHub ? "3.2px" : "2.8px" }}
              >
                {role.code}
              </text>
            </g>
          );
        })}

        <circle r="1.2" fill="#6EE7B7" className="marketing-signal-particle" style={{ offsetPath: "path('M50 50 L18 22')" }} />
        <circle r="1.2" fill="#6EE7B7" className="marketing-signal-particle" style={{ offsetPath: "path('M50 50 L82 18')", animationDelay: "1.2s" }} />
        <circle r="1.2" fill="#6EE7B7" className="marketing-signal-particle" style={{ offsetPath: "path('M50 50 L72 82')", animationDelay: "2.4s" }} />
      </svg>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 md:bottom-6 md:left-6">
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-[family-name:var(--font-mkt-mono)] text-[9px] uppercase tracking-[0.1em] text-white/60">
          Delivery Brain hub
        </span>
        <span className="rounded-full border border-[rgba(61,150,96,0.3)] bg-[rgba(61,150,96,0.12)] px-2.5 py-1 font-[family-name:var(--font-mkt-mono)] text-[9px] uppercase tracking-[0.1em] text-[#6EE7B7]">
          Live propagation
        </span>
      </div>
    </div>
  );
}

function ReviewQueueMock() {
  const pm = ROLES.pm;
  return (
    <div className="rounded-2xl border border-[var(--mkt-border)] bg-white p-5 shadow-[0_24px_64px_-32px_rgba(28,74,46,0.2)] md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
          AI Review Queue
        </p>
        <span className="rounded-full bg-[rgba(96,165,250,0.12)] px-2.5 py-0.5 font-[family-name:var(--font-mkt-mono)] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#60A5FA]">
          PM view
        </span>
      </div>
      <p className="mb-4 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
        Every AI proposal lands here. Nothing applies until a human approves it.
      </p>
      <div className="space-y-2.5">
        {pm.loopItems.slice(0, 4).map((item) => (
          <div
            key={`${item.name}-${item.status}`}
            className="flex items-center gap-3 rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-2.5"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-mkt-mono)] text-[0.6rem] font-semibold"
              style={{ background: item.bg, color: item.color }}
            >
              {item.code}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] font-medium text-[var(--mkt-text1)]">{item.name}</p>
              <p className="truncate text-[0.6875rem] text-[var(--mkt-text3)]">{item.status}</p>
            </div>
            <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[0.625rem] font-medium text-[var(--mkt-text2)]">
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketingWorkflowSection() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = DELIVERY_STAGES[activeStage];

  return (
    <MarketingSection
      id="workflow"
      className="relative overflow-hidden bg-[#0D0D0B] !py-14 md:!py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(61,150,96,0.15)_0%,transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <MarketingContainer className="relative">
        <MarketingSectionIntro
          label="Delivery pipeline"
          title={
            <>
              Seven roles. <em>One signal graph.</em>
            </>
          }
          subtitle="The Delivery Brain connects every persona dashboard. After PM approval, signals propagate across roles via delivery impact events. Every AI proposal lands in the Review Queue until a human approves it."
          className="[&_em]:text-[#6EE7B7] [&_h2]:text-white [&_p]:text-white/65 [&_header>p]:text-white/45"
        />

        <WorkflowDiagram />

        {/* Horizontal pipeline stepper */}
        <div className="mt-16">
          <p className="mb-6 font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
            End-to-end flow
          </p>

          <div className="relative hidden md:block">
            <div
              className="absolute left-[5%] right-[5%] top-[1.75rem] h-px bg-gradient-to-r from-transparent via-[rgba(61,150,96,0.5)] to-transparent"
              aria-hidden
            />
            <div
              className="marketing-workflow-stepper-pulse absolute left-[5%] top-[calc(1.75rem-3px)] size-1.5 rounded-full bg-[#6EE7B7] shadow-[0_0_12px_#6EE7B7]"
              aria-hidden
            />
            <ol className="relative grid grid-cols-5 gap-2">
              {DELIVERY_STAGES.map((s, i) => {
                const isActive = i === activeStage;
                const isPast = i < activeStage;
                return (
                  <li key={s.code}>
                    <button
                      type="button"
                      onClick={() => setActiveStage(i)}
                      className={`group flex w-full flex-col items-center text-center transition duration-300 ${
                        isActive ? "opacity-100" : "opacity-60 hover:opacity-85"
                      }`}
                    >
                      <span
                        className={`relative z-[1] flex size-14 items-center justify-center rounded-2xl border font-[family-name:var(--font-mkt-mono)] text-xs font-semibold transition duration-300 ${
                          isActive
                            ? "border-[#3D9660] bg-[#3D9660] text-white shadow-[0_0_32px_-4px_rgba(61,150,96,0.6)]"
                            : isPast
                              ? "border-[rgba(61,150,96,0.4)] bg-[rgba(61,150,96,0.15)] text-[#6EE7B7]"
                              : "border-white/10 bg-white/5 text-white/50"
                        }`}
                      >
                        {s.code}
                      </span>
                      <span
                        className={`mt-3 text-[0.8125rem] font-semibold leading-tight ${
                          isActive ? "text-white" : "text-white/70"
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Mobile: vertical stepper */}
          <ol className="space-y-0 md:hidden">
            {DELIVERY_STAGES.map((s, i) => {
              const isActive = i === activeStage;
              return (
                <li key={s.code}>
                  <button
                    type="button"
                    onClick={() => setActiveStage(i)}
                    className={`flex w-full items-center gap-4 border-b border-white/8 py-4 text-left transition ${
                      isActive ? "opacity-100" : "opacity-55"
                    }`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-mkt-mono)] text-[10px] font-semibold ${
                        isActive
                          ? "bg-[#3D9660] text-white"
                          : "border border-white/10 bg-white/5 text-white/50"
                      }`}
                    >
                      {s.code}
                    </span>
                    <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/70"}`}>
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Active stage detail */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm md:p-6">
            <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[#6EE7B7]">
              Step {stage.code} · {stage.label}
            </p>
            <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-white/75">{stage.detail}</p>
          </div>
        </div>

        {/* Signal graph + Review Queue — distinct from platform bento */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <SignalGraphIllustration />
          <ReviewQueueMock />
        </div>
      </MarketingContainer>

      {/* Signal threads — light cards on dark section footer */}
      <MarketingContainer className="relative mt-12 md:mt-16">
        <p className="mb-6 font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
          Example signal threads
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {THREAD_CALLOUTS.map((thread) => (
            <article
              key={thread.title}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="size-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ background: THREAD_DOT[thread.tone], color: THREAD_DOT[thread.tone] }}
                  aria-hidden
                />
                <span className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">
                  Signal thread
                </span>
              </div>
              <h3 className="mb-2 text-[0.9375rem] font-semibold text-white">{thread.title}</h3>
              <p className="text-[0.8125rem] leading-relaxed text-white/60">{thread.body}</p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
