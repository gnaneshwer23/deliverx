"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { ROLE_ORDER, ROLES } from "@/lib/marketing/landing-data";

const EXPLORE_OPTIONS = [
  {
    id: "projects",
    label: "Projects & delivery",
    desc: "Milestones, RAID, governance",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 4v4M16 4v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "requirements",
    label: "Requirements",
    desc: "Traceability & gap analysis",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "meetings",
    label: "Meeting intel",
    desc: "Transcripts → tasks & decisions",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "review",
    label: "AI Review Queue",
    desc: "Human approval before apply",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    ),
  },
  {
    id: "sponsor",
    label: "Sponsor view",
    desc: "Portfolio & runway signals",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 14l4-4 4 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "release",
    label: "Release readiness",
    desc: "QA gates & go-live status",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

function DashboardBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Layer 1 — kanban board */}
      <div className="absolute left-[4%] top-[8%] w-[52%] rotate-[-2deg] scale-[0.92] opacity-40 blur-[2px]">
        <div className="overflow-hidden rounded-xl border border-[var(--mkt-border)] bg-white shadow-[0_24px_64px_-16px_rgba(15,23,42,0.15)]">
          <div className="flex h-8 items-center gap-1.5 border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3">
            <span className="size-2 rounded-full bg-[#FF5F57]" />
            <span className="size-2 rounded-full bg-[#FFBD2E]" />
            <span className="size-2 rounded-full bg-[#28CA41]" />
            <span className="ml-1 text-[0.55rem] font-medium text-[var(--mkt-text3)]">
              Mission Control · Example
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            {["Backlog", "In progress", "Review"].map((col, ci) => (
              <div key={col} className="rounded-lg bg-[var(--mkt-s2)] p-2">
                <p className="mb-2 text-[0.5rem] font-semibold uppercase tracking-wide text-[var(--mkt-text3)]">
                  {col}
                </p>
                {[0, 1].map((r) => (
                  <div
                    key={r}
                    className="mb-1.5 rounded border border-[var(--mkt-border)] bg-white p-1.5"
                  >
                    <div className="h-1 w-3/4 rounded bg-[var(--mkt-s3)]" />
                    <div className="mt-1 h-1 w-1/2 rounded bg-[var(--mkt-s3)]" />
                    {ci === 1 && r === 0 ? (
                      <span className="mt-1 inline-block rounded bg-[rgba(61,150,96,0.12)] px-1 text-[0.45rem] text-[#3D9660]">
                        NHS EHR
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layer 2 — table view */}
      <div className="absolute right-[2%] top-[18%] w-[48%] rotate-[1.5deg] scale-[0.88] opacity-35 blur-[3px]">
        <div className="overflow-hidden rounded-xl border border-[var(--mkt-border)] bg-white shadow-[0_20px_48px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex h-8 items-center border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3">
            <span className="text-[0.55rem] font-medium text-[var(--mkt-text3)]">Requirements trace</span>
          </div>
          <div className="p-2">
            {["REQ-142 · Patient portal", "REQ-089 · API auth", "REQ-201 · Audit log"].map((row) => (
              <div
                key={row}
                className="flex items-center gap-2 border-b border-[var(--mkt-border)] py-1.5 last:border-0"
              >
                <span className="size-1.5 rounded-full bg-[#3D9660]" />
                <span className="text-[0.5rem] text-[var(--mkt-text2)]">{row}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layer 3 — KPI strip */}
      <div className="absolute bottom-[12%] left-[15%] w-[70%] rotate-[-0.5deg] opacity-30 blur-[4px]">
        <div className="grid grid-cols-4 gap-2 rounded-xl border border-[var(--mkt-border)] bg-white p-3 shadow-lg">
          {ROLE_ORDER.slice(0, 4).map((id) => {
            const r = ROLES[id];
            return (
              <div key={id} className="rounded-lg bg-[var(--mkt-s2)] p-2 text-center">
                <p className="font-[family-name:var(--font-mkt-mono)] text-[0.45rem] font-semibold" style={{ color: r.accent }}>
                  {r.code}
                </p>
                <p className="text-[0.55rem] font-semibold text-[var(--mkt-text1)]">{r.kpis[0].val}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[var(--mkt-ink)]/20 via-transparent to-[var(--mkt-ink)]/60" />
    </div>
  );
}

export function MarketingHowItLooksSection() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["projects", "review"]));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <MarketingSection id="how-it-looks" tone="white" className="!overflow-hidden">
      <MarketingContainer>
        <MarketingSectionIntro
          label="How it looks"
          title={
            <>
              Real dashboards. <em>Not slide decks.</em>
            </>
          }
          subtitle="Every role gets a mission control built for how they work — kanban, tables, review queues, and KPI strips. Example data from an NHS EHR programme."
        />

        <div className="relative mt-10 min-h-[480px] md:min-h-[520px]">
          <DashboardBackdrop />

          <div className="relative z-[1] mx-auto max-w-lg md:max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-[var(--mkt-border)] bg-white shadow-[0_32px_80px_-24px_rgba(28,74,46,0.25)]">
              <div className="border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-5 py-4">
                <p className="text-base font-semibold text-[var(--mkt-text1)]">
                  What would you like to explore?
                </p>
                <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">
                  Pick the areas that matter to your role — we&apos;ll tailor your workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
                {EXPLORE_OPTIONS.map((opt) => {
                  const isOn = selected.has(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(opt.id)}
                      className={`group flex flex-col items-start rounded-xl border p-3 text-left transition duration-200 ${
                        isOn
                          ? "border-[#1C4A2E] bg-[#EEF5F1] shadow-[0_0_0_1px_#1C4A2E]"
                          : "border-[var(--mkt-border)] bg-[var(--mkt-s1)] hover:border-[var(--mkt-border-l)] hover:shadow-[var(--dx-shadow-sm)]"
                      }`}
                    >
                      <div className="mb-2 flex w-full items-center justify-between">
                        <span
                          className={`flex size-8 items-center justify-center rounded-lg transition ${
                            isOn ? "bg-[#1C4A2E] text-white" : "bg-[var(--mkt-s2)] text-[var(--mkt-text2)]"
                          }`}
                        >
                          {opt.icon}
                        </span>
                        <span
                          className={`flex size-4 items-center justify-center rounded border transition ${
                            isOn
                              ? "border-[#1C4A2E] bg-[#1C4A2E] text-white"
                              : "border-[var(--mkt-border-l)] bg-white"
                          }`}
                          aria-hidden
                        >
                          {isOn ? (
                            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                      </div>
                      <span className="text-[0.8125rem] font-semibold leading-tight text-[var(--mkt-text1)]">
                        {opt.label}
                      </span>
                      <span className="mt-0.5 text-[0.625rem] leading-snug text-[var(--mkt-text3)]">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-4 py-3">
                <p className="text-[0.6875rem] text-[var(--mkt-text3)]">
                  {selected.size} area{selected.size !== 1 ? "s" : ""} selected · Example workspace
                </p>
                <MarketingButtonLink href="/signup" variant="primary" className="!py-2 !text-sm">
                  Get started
                </MarketingButtonLink>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--mkt-text3)]">
          All dashboards use example programme data.{" "}
          <Link href="#platform" className="font-medium text-[var(--mkt-green-l)] hover:underline">
            See every role →
          </Link>
        </p>
      </MarketingContainer>
    </MarketingSection>
  );
}
