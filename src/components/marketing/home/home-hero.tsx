"use client";

import {
  Briefcase,
  Calendar,
  ChartNoAxesColumn,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer } from "@/components/marketing/marketing-layout";
import {
  MarketingHeroItem,
  MarketingHeroMotion,
} from "@/components/marketing/marketing-reveal";
import { HOME_EYEBROW, HOME_SUPPORT } from "@/lib/marketing/homepage-data";
import { mktClass } from "@/lib/marketing/landing-theme";

const SIDEBAR_ICONS = [Home, Briefcase, Calendar, Users, ChartNoAxesColumn, MessageSquare, Settings];

const PRIORITIES = [
  { label: "Customer retention declined 8%", tone: "risk" as const },
  { label: "Align roadmap with Engineering", tone: "focus" as const },
  { label: "Prepare stakeholder update", tone: "ok" as const },
];

const ACHIEVEMENTS = ["PRD Expert", "Stakeholder Pro", "Data Driven", "Delivery Champion"];

function HubDashboardMock() {
  return (
    <div className="mkt-hub-glow relative">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.14),transparent_65%)] blur-2xl"
        aria-hidden
      />
      <div className="mkt-hub-panel overflow-hidden rounded-[1.35rem] border border-[var(--mkt-border)] bg-[var(--mkt-s1)] shadow-[0_24px_64px_-28px_rgba(13,13,11,0.28)]">
        <div className="flex min-h-[420px]">
          {/* Sidebar */}
          <aside className="flex w-12 shrink-0 flex-col items-center gap-3 border-r border-[var(--mkt-border)] bg-[var(--mkt-s2)] py-4 sm:w-14">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--mkt-green)] text-[0.65rem] font-semibold text-white">
              DX
            </div>
            {SIDEBAR_ICONS.map((Icon, i) => (
              <span
                key={Icon.displayName ?? i}
                className={`flex size-8 items-center justify-center rounded-lg ${
                  i === 0
                    ? "bg-white text-[var(--mkt-green)] shadow-sm"
                    : "text-[var(--mkt-text3)]"
                }`}
              >
                <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
              </span>
            ))}
          </aside>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4 lg:flex-row">
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className={`text-[0.95rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
                  Good morning, Sarah
                </p>
                <p className="mt-0.5 text-[0.7rem] text-[var(--mkt-text3)]">
                  Your career journey is on track
                </p>
              </div>

              {/* Journey */}
              <div className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/60 p-3">
                <p className={`${mktClass.mono} text-[0.6rem] uppercase tracking-[0.14em] text-[var(--mkt-text3)]`}>
                  Your Journey
                </p>
                <div className="relative mt-4">
                  <div className="mkt-hub-journey-line absolute left-3 right-3 top-[5px] h-px" aria-hidden />
                  <div className="mkt-hub-journey relative flex items-start justify-between gap-1">
                    {[
                      { label: "Build Experience", active: false },
                      { label: "Land Opportunity", active: true },
                      { label: "Succeed in Role", active: false },
                    ].map((step) => (
                      <div key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                        <span
                          className={`relative z-[1] size-2.5 rounded-full ${
                            step.active
                              ? "bg-[var(--mkt-accent-blue)] shadow-[0_0_0_4px_rgba(37,99,235,0.18)]"
                              : "bg-[var(--mkt-border-l)] ring-2 ring-[var(--mkt-s2)]"
                          }`}
                        />
                        <span
                          className={`truncate text-center text-[0.55rem] leading-tight ${
                            step.active ? "font-medium text-[var(--mkt-text1)]" : "text-[var(--mkt-text3)]"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MediFlow */}
              <div className="rounded-xl border border-[var(--mkt-border)] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[0.8125rem] font-medium text-[var(--mkt-text1)]">
                      MediFlow Technologies
                    </p>
                    <p className="mt-0.5 text-[0.65rem] text-[var(--mkt-text3)]">Product Manager</p>
                  </div>
                  <span className={`${mktClass.mono} text-[0.7rem] text-[var(--mkt-green-l)]`}>72%</span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--mkt-s3)]">
                  <div className="mkt-hub-progress h-full rounded-full bg-[var(--mkt-green-l)]" />
                </div>
                <button
                  type="button"
                  tabIndex={-1}
                  className="mt-3 rounded-full bg-[var(--mkt-green)] px-3 py-1.5 text-[0.65rem] font-medium text-white"
                >
                  Continue experience
                </button>
              </div>

              {/* Priorities */}
              <div className="rounded-xl border border-[var(--mkt-border)] bg-white p-3">
                <p className={`${mktClass.mono} text-[0.6rem] uppercase tracking-[0.14em] text-[var(--mkt-text3)]`}>
                  Today&apos;s Priorities
                </p>
                <ul className="mt-2 space-y-1.5">
                  {PRIORITIES.map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-[0.7rem] text-[var(--mkt-text2)]">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${
                          item.tone === "risk"
                            ? "bg-[var(--mkt-red,#C0392B)]"
                            : item.tone === "focus"
                              ? "mkt-hub-pulse bg-[var(--mkt-accent-blue)]"
                              : "bg-[var(--mkt-green-l)]"
                        }`}
                      />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Achievements */}
              <div className="hidden gap-1.5 sm:grid sm:grid-cols-4">
                {ACHIEVEMENTS.map((a) => (
                  <div
                    key={a}
                    className="rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/50 px-1.5 py-2 text-center"
                  >
                    <span className="mx-auto mb-1 block size-5 rounded-md border border-[var(--mkt-border)] bg-white" />
                    <p className="text-[0.5rem] leading-tight text-[var(--mkt-text3)]">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right stats */}
            <div className="hidden w-[132px] shrink-0 flex-col gap-2 lg:flex">
              <div className="rounded-xl border border-[var(--mkt-border)] bg-white p-3 text-center shadow-sm">
                <p className={`${mktClass.mono} text-[0.55rem] uppercase tracking-[0.12em] text-[var(--mkt-text3)]`}>
                  Career Score
                </p>
                <div className="relative mx-auto mt-2 flex size-14 items-center justify-center">
                  <span className="mkt-hub-score absolute inset-0 rounded-full" aria-hidden />
                  <span className={`relative text-lg leading-none text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    87
                  </span>
                </div>
                <p className="mt-1 text-[0.6rem] text-[var(--mkt-green-l)]">Excellent</p>
              </div>
              {[
                { label: "Projects", value: "12" },
                { label: "Skills", value: "8" },
                { label: "Feedback", value: "4.8" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[var(--mkt-border)] bg-white px-3 py-2.5">
                  <p className={`${mktClass.mono} text-[0.5rem] uppercase tracking-[0.12em] text-[var(--mkt-text3)]`}>
                    {stat.label}
                  </p>
                  <p className={`mt-1 text-lg leading-none text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeHero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--mkt-mist)] via-[var(--mkt-ink)] to-[var(--mkt-cream)] pt-[var(--mkt-navh)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
      <MarketingContainer className="relative z-[1] !max-w-[1180px] py-14 md:py-20 lg:py-24">
        <MarketingHeroMotion>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-14">
            <div className="max-w-xl">
              <MarketingHeroItem>
                <p className={`${mktClass.label} !normal-case !tracking-[0.04em]`}>{HOME_EYEBROW}</p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <h1
                  className={`mt-5 text-[clamp(2.15rem,5vw,3.5rem)] leading-[1.08] tracking-[-0.04em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                >
                  Build the <span className="mkt-keyword-gradient">experience</span>
                  <br />
                  Land the <span className="mkt-keyword-gradient">opportunity</span>
                  <br />
                  Succeed in the <span className="mkt-keyword-gradient">role</span>
                </h1>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  {HOME_SUPPORT}
                </p>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <MarketingButtonLink href="/signup" variant="primaryLg">
                    Start your journey
                  </MarketingButtonLink>
                  <a
                    href="#products"
                    className="inline-flex items-center justify-center gap-1.5 rounded-[var(--mkt-radius-btn)] border border-[var(--mkt-border-l)] bg-[var(--mkt-s1)]/70 px-8 py-[14px] text-[0.9375rem] font-medium text-[var(--mkt-text2)] no-underline transition duration-200 hover:bg-[var(--mkt-s1)] hover:text-[var(--mkt-text1)]"
                  >
                    Explore products
                  </a>
                </div>
              </MarketingHeroItem>
              <MarketingHeroItem>
                <p className="mt-6 text-[0.8125rem] text-[var(--mkt-text3)]">
                  Professionals building experience, opportunity and delivery with DeliverX
                </p>
              </MarketingHeroItem>
            </div>

            <MarketingHeroItem className="lg:pl-2">
              <div className="mkt-hero-float" aria-hidden>
                <HubDashboardMock />
              </div>
              <span className="sr-only">Preview of the DeliverX career hub dashboard</span>
            </MarketingHeroItem>
          </div>
        </MarketingHeroMotion>
      </MarketingContainer>
    </section>
  );
}
