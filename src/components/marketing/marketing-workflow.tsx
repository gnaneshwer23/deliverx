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
              From trigger to <em>team sync.</em>
            </>
          }
          subtitle="The Delivery Brain connects every persona dashboard. After PM approval, signals propagate across roles via delivery impact events."
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

        <div className="mt-12 mx-auto max-w-xl">
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
