"use client";

import { useState, type CSSProperties } from "react";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import {
  DELIVERY_STAGES,
  ROLE_ORDER,
  ROLES,
  THREAD_CALLOUTS,
  type RoleId,
} from "@/lib/marketing/landing-data";

const THREAD_DOT: Record<string, string> = {
  red: "#F87171",
  amber: "#FBBF24",
  green: "#3D9660",
};

export function MarketingWorkflowSection() {
  const [activeRole, setActiveRole] = useState<RoleId>("pm");
  const active = ROLES[activeRole];

  return (
    <MarketingSection id="workflow" className="relative overflow-hidden !pb-0">
      <div className="marketing-workflow-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="marketing-workflow-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] size-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(61,150,96,0.18)_0%,transparent_68%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[8%] top-[42%] size-[280px] rounded-full bg-[radial-gradient(circle,rgba(147,197,253,0.12)_0%,transparent_70%)] blur-2xl"
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
        />

        <div className="mt-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--mkt-text3)]">
              Example workflow
            </p>
            <div className="marketing-workflow-hub inline-flex items-center gap-2 rounded-full border border-[var(--mkt-border)] bg-[rgba(255,255,255,0.55)] px-3.5 py-1.5 backdrop-blur-md">
              <span className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--mkt-text3)]">
                Illustrative signal flow
              </span>
            </div>
          </div>

          <div
            className="marketing-workflow-stage relative overflow-hidden rounded-2xl border border-[var(--mkt-border)] bg-[rgba(255,255,255,0.55)] p-5 shadow-[0_24px_80px_-40px_rgba(28,74,46,0.25)] backdrop-blur-xl md:p-8"
            aria-label="Connected delivery personas"
          >
            <svg
              className="pointer-events-none absolute inset-x-6 top-[3.4rem] hidden h-8 w-[calc(100%-3rem)] min-[901px]:block"
              viewBox="0 0 1000 32"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="mkt-flow-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(61,150,96,0.15)" />
                  <stop offset="50%" stopColor="rgba(61,150,96,0.55)" />
                  <stop offset="100%" stopColor="rgba(61,150,96,0.15)" />
                </linearGradient>
              </defs>
              <path
                d="M0 16 H1000"
                fill="none"
                stroke="url(#mkt-flow-line)"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                className="marketing-workflow-line"
              />
              <circle
                r="4"
                fill="var(--mkt-green-l)"
                className="marketing-workflow-pulse-dot"
                style={{ offsetPath: "path('M0 16 H1000')" }}
              />
            </svg>

            <ol className="marketing-workflow-nodes relative grid grid-cols-2 gap-3 min-[601px]:grid-cols-4 min-[901px]:grid-cols-7 min-[901px]:gap-2">
              {ROLE_ORDER.map((id) => {
                const role = ROLES[id];
                const isActive = id === activeRole;
                return (
                  <li key={id} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveRole(id)}
                      className={`marketing-workflow-node group flex w-full flex-col items-center rounded-xl border px-2 py-4 text-center transition duration-300 ${
                        isActive
                          ? "border-[var(--node-accent)] bg-[var(--node-accent-bg)] shadow-[0_0_0_1px_var(--node-accent),0_12px_32px_-12px_var(--node-accent)]"
                          : "border-[var(--mkt-border)] bg-[rgba(255,255,255,0.65)] hover:border-[var(--mkt-border-l)]"
                      }`}
                      style={
                        {
                          "--node-accent": role.accent,
                          "--node-accent-bg": role.accentBg,
                        } as CSSProperties
                      }
                    >
                      <span
                        className={`mb-2.5 flex size-10 items-center justify-center rounded-lg font-[family-name:var(--font-mkt-mono)] text-xs font-semibold transition ${
                          isActive ? "text-white" : "text-[var(--mkt-text2)]"
                        }`}
                        style={{
                          background: isActive ? role.accent : "var(--mkt-s2)",
                          boxShadow: isActive ? `0 8px 24px -8px ${role.accent}88` : undefined,
                        }}
                      >
                        {role.code}
                      </span>
                      <span className="text-[0.8125rem] font-semibold leading-tight text-[var(--mkt-text1)]">
                        {role.name.split(" / ")[0]}
                      </span>
                      <span className="mt-1 line-clamp-2 text-[0.625rem] leading-snug text-[var(--mkt-text3)]">
                        {role.tagline}
                      </span>
                      <span
                        className={`mt-2 font-[family-name:var(--font-mkt-mono)] text-[9px] uppercase tracking-[0.1em] ${
                          isActive ? "text-[var(--mkt-green-l)]" : "text-[var(--mkt-text3)]"
                        }`}
                      >
                        {isActive ? "selected" : "example"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="marketing-workflow-glass rounded-2xl border border-[var(--mkt-border)] p-5 md:p-6">
              <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
                End-to-end flow
              </p>
              <ol className="mt-4 space-y-0">
                {DELIVERY_STAGES.map((stage, i) => (
                  <li
                    key={stage.code}
                    className="relative flex gap-4 border-b border-[var(--mkt-border)] py-4 last:border-b-0"
                  >
                    {i < DELIVERY_STAGES.length - 1 ? (
                      <span
                        className="absolute left-[1.125rem] top-[2.85rem] h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-[var(--mkt-green-l)] to-transparent opacity-40"
                        aria-hidden
                      />
                    ) : null}
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(61,150,96,0.25)] bg-[rgba(61,150,96,0.08)] font-[family-name:var(--font-mkt-mono)] text-[10px] font-semibold text-[var(--mkt-green-l)]">
                      {stage.code}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-[var(--mkt-text1)]">{stage.label}</p>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                        {stage.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div
              className="marketing-workflow-glass rounded-2xl border p-5 md:p-6"
              style={{ borderColor: `${active.accent}44` }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
                  AI Review Queue
                </p>
                <span
                  className="rounded-full px-2.5 py-0.5 font-[family-name:var(--font-mkt-mono)] text-[9px] font-semibold uppercase tracking-[0.08em]"
                  style={{ background: active.accentBg, color: active.accent }}
                >
                  {active.code} view
                </span>
              </div>
              <div className="space-y-2.5">
                {active.loopItems.slice(0, 4).map((item) => (
                  <div
                    key={`${item.name}-${item.status}`}
                    className="flex items-center gap-3 rounded-xl border border-[var(--mkt-border)] bg-[rgba(255,255,255,0.7)] px-3 py-2.5"
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
                    <span className="shrink-0 rounded-md bg-[var(--mkt-s2)] px-2 py-0.5 text-[0.625rem] font-medium text-[var(--mkt-text2)]">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MarketingContainer>

      <MarketingContainer className="relative py-8 md:py-10">
        <p className="mb-6 font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
          Example signal threads
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {THREAD_CALLOUTS.map((thread) => (
            <article
              key={thread.title}
              className="marketing-workflow-glass rounded-xl border border-[var(--mkt-border)] p-6 transition hover:border-[var(--mkt-border-l)] hover:shadow-[0_16px_48px_-32px_rgba(28,74,46,0.2)]"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="size-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ background: THREAD_DOT[thread.tone], color: THREAD_DOT[thread.tone] }}
                  aria-hidden
                />
                <span className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--mkt-text3)]">
                  Signal thread
                </span>
              </div>
              <h3 className="mb-2 text-[0.9375rem] font-semibold text-[var(--mkt-text1)]">
                {thread.title}
              </h3>
              <p className="text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">{thread.body}</p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
