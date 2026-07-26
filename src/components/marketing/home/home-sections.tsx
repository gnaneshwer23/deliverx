"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Briefcase,
  Compass,
  Users,
  type LucideIcon,
} from "lucide-react";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import {
  BUILT_FOR,
  GUARANTEE,
  HOME_FAQ,
  HOME_PRICING,
  HOME_PRODUCTS,
  JOURNEY_NODES,
  OUTCOMES,
  OUTPUTS,
  PLATFORM_TABS,
  PROBLEM,
  DEMO_STORIES,
  AI_COLLEAGUES,
  AI_COLLEAGUE_BEHAVIOURS,
  EXPERIENCE_TIMELINE,
  TEAM_COPILOT_PANELS,
} from "@/lib/marketing/homepage-data";
import { mktClass } from "@/lib/marketing/landing-theme";

const PRODUCT_ICONS: Record<string, LucideIcon> = {
  xperience: Briefcase,
  launchpad: Compass,
  "team-copilot": Users,
};

const ACCENT_CLASS = {
  purple: {
    icon: "text-[var(--mkt-accent-purple)] bg-[rgba(91,33,182,0.08)]",
    ring: "group-hover:border-[rgba(91,33,182,0.28)]",
    link: "text-[var(--mkt-accent-purple)]",
    num: "text-[var(--mkt-accent-purple)]",
    dot: "bg-[var(--mkt-accent-purple)]",
  },
  green: {
    icon: "text-[var(--mkt-green-l)] bg-[rgba(61,150,96,0.1)]",
    ring: "group-hover:border-[rgba(61,150,96,0.28)]",
    link: "text-[var(--mkt-green)]",
    num: "text-[var(--mkt-green-l)]",
    dot: "bg-[var(--mkt-green-l)]",
  },
  blue: {
    icon: "text-[var(--mkt-accent-blue)] bg-[rgba(37,99,235,0.08)]",
    ring: "group-hover:border-[rgba(37,99,235,0.28)]",
    link: "text-[var(--mkt-accent-blue)]",
    num: "text-[var(--mkt-accent-blue)]",
    dot: "bg-[var(--mkt-accent-blue)]",
  },
} as const;

export function HomeBuiltFor() {
  return (
    <section
      id="built-for"
      className="scroll-mt-[var(--mkt-navh)] border-y border-[var(--mkt-border)] bg-[var(--mkt-s2)] py-8 md:py-10"
    >
      <MarketingContainer className="!max-w-[1180px]">
        <p className={`${mktClass.label} mb-4 text-center`}>Built for</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-x-10">
          {BUILT_FOR.map((item) => (
            <li key={item} className="text-[0.8125rem] text-[var(--mkt-text2)]">
              {item}
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </section>
  );
}

export function HomeProblem() {
  return (
    <MarketingSection id="problem" tone="white">
      <MarketingContainer className="!max-w-[1180px]">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <MarketingReveal>
            <p className={mktClass.label}>The gap</p>
            <h2 className={`mt-3.5 ${mktClass.sectionTitle}`}>
              {PROBLEM.headline}{" "}
              <em className="not-italic text-[var(--mkt-green)]">{PROBLEM.emphasis}</em>
            </h2>
            <div className="mt-6 space-y-4">
              {PROBLEM.body.map((p) => (
                <p key={p.slice(0, 24)} className="text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                  {p}
                </p>
              ))}
            </div>
          </MarketingReveal>

          <MarketingReveal delay={0.08}>
            <ol className="mkt-problem-flow relative mx-auto max-w-sm space-y-0">
              {PROBLEM.flow.map((step, i) => (
                <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < PROBLEM.flow.length - 1 ? (
                    <span className="mkt-problem-connector absolute left-[15px] top-8 bottom-0 w-px" aria-hidden />
                  ) : null}
                  <span className="relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--mkt-border)] bg-[var(--mkt-s1)] text-[0.7rem] font-medium text-[var(--mkt-text2)]">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <p className={`text-[1.125rem] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                      {step}
                    </p>
                    {i === 1 ? (
                      <p className="mt-1 text-[0.75rem] text-[var(--mkt-green-l)]">Where DeliverX begins</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </MarketingReveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeProducts() {
  return (
    <MarketingSection id="products" tone="cream">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="Three products"
            title={
              <>
                Three products. One <em>career journey.</em>
              </>
            }
            subtitle="Everything you need to go from aspiring to achieving."
          />
        </MarketingReveal>

        <div className="relative mt-14">
          <div
            className="mkt-product-flow pointer-events-none absolute left-[16%] right-[16%] top-[2.25rem] hidden h-px md:block"
            aria-hidden
          />
          <ul className="grid gap-5 md:grid-cols-3 md:gap-6">
            {HOME_PRODUCTS.map((product, index) => {
              const Icon = PRODUCT_ICONS[product.id] ?? Briefcase;
              const accent = ACCENT_CLASS[product.accent];
              return (
                <li key={product.id} className="relative">
                  <MarketingReveal delay={index * 0.06}>
                    <article
                      className={`mkt-card mkt-card-lift group flex h-full flex-col p-7 md:p-8 ${accent.ring}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex size-10 items-center justify-center rounded-xl ${accent.icon}`}
                        >
                          <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                        </span>
                        <span className={`${mktClass.mono} text-[0.7rem] ${accent.num}`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3
                        className={`mt-6 text-[clamp(1.25rem,2vw,1.5rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                      >
                        {product.name}
                      </h3>
                      <p className="mt-1 text-[0.75rem] text-[var(--mkt-text3)]">{product.stage}</p>
                      <p className="mt-4 flex-1 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
                        {product.sentence}
                      </p>
                      <ul className="mt-5 space-y-1.5">
                        {product.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-[0.8125rem] text-[var(--mkt-text2)]">
                            <span className={`size-1 rounded-full ${accent.dot}`} />
                            {b}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={product.href}
                        className={`mt-7 text-[0.875rem] font-medium no-underline transition-transform duration-300 group-hover:translate-x-0.5 ${accent.link}`}
                      >
                        {product.cta} →
                      </Link>
                    </article>
                  </MarketingReveal>
                </li>
              );
            })}
          </ul>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeJourney() {
  const [active, setActive] = useState<string | null>(JOURNEY_NODES[1]?.id ?? null);

  return (
    <MarketingSection id="journey" tone="white">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="How it works"
            title="Your interactive career journey"
            subtitle="Hover a stage to see what happens — from discovery through to a real role."
          />
        </MarketingReveal>

        <MarketingReveal delay={0.06}>
          <div className="relative mt-12 overflow-x-auto pb-2">
            <div className="mkt-journey-line absolute left-4 right-4 top-[18px] hidden h-px md:block" aria-hidden />
            <ol className="flex min-w-[640px] gap-2 md:min-w-0 md:justify-between">
              {JOURNEY_NODES.map((node) => {
                const isActive = active === node.id;
                return (
                  <li key={node.id} className="relative flex min-w-0 flex-1 flex-col items-center px-1">
                    <button
                      type="button"
                      onMouseEnter={() => setActive(node.id)}
                      onFocus={() => setActive(node.id)}
                      onClick={() => setActive(node.id)}
                      className={`relative z-[1] flex size-9 items-center justify-center rounded-full border transition duration-200 ${
                        isActive
                          ? "border-[var(--mkt-green)] bg-[var(--mkt-green)] text-white shadow-[0_0_0_4px_rgba(61,150,96,0.15)]"
                          : "border-[var(--mkt-border)] bg-[var(--mkt-s1)] text-[var(--mkt-text3)] hover:border-[var(--mkt-green-l)]"
                      }`}
                      aria-expanded={isActive}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                    </button>
                    <p
                      className={`mt-3 text-center text-[0.7rem] leading-snug md:text-[0.75rem] ${
                        isActive ? "font-medium text-[var(--mkt-text1)]" : "text-[var(--mkt-text3)]"
                      }`}
                    >
                      {node.label}
                    </p>
                    <div
                      className={`mt-2 max-w-[9.5rem] overflow-hidden text-center transition-all duration-300 ${
                        isActive ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-[0.7rem] leading-relaxed text-[var(--mkt-text2)]">{node.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </MarketingReveal>

        <MarketingReveal delay={0.1}>
          <div className="mt-10 text-center">
            <MarketingButtonLink href="/how-it-works" variant="ghost">
              See the full workflow →
            </MarketingButtonLink>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomePlatformPreview() {
  const [tab, setTab] = useState<(typeof PLATFORM_TABS)[number]["id"]>("experience");
  const current = PLATFORM_TABS.find((t) => t.id === tab) ?? PLATFORM_TABS[0];

  return (
    <MarketingSection id="platform" tone="cream">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="Platform"
            title="One hub across experience, career and delivery"
            subtitle="Switch views — the same Professional Intelligence record, different lenses. No unexplained scores."
          />
        </MarketingReveal>

        <MarketingReveal delay={0.05}>
          <div
            role="tablist"
            aria-label="Platform preview"
            className="mx-auto mt-10 flex w-fit flex-wrap justify-center gap-1 rounded-full border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-1"
          >
            {PLATFORM_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-5 py-2 text-[0.8125rem] font-medium transition ${
                  tab === t.id
                    ? "bg-[var(--mkt-green)] text-white"
                    : "text-[var(--mkt-text3)] hover:text-[var(--mkt-text1)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </MarketingReveal>

        <MarketingReveal delay={0.08}>
          <div className="mkt-card mt-8 overflow-hidden p-0">
            <div className="border-b border-[var(--mkt-border)] bg-[var(--mkt-s2)]/50 px-6 py-4">
              <p className={`text-[1.125rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
                {current.title}
              </p>
              <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">{current.caption}</p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6" key={tab}>
              {tab === "experience" ? (
                <>
                  <MockPanel title="Active company" body="MediFlow · Product Manager">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <MockChip>Day 18</MockChip>
                        <MockChip tone="live">
                          <span className="mkt-hub-pulse size-1.5 rounded-full bg-[var(--mkt-green-l)]" />
                          Active
                        </MockChip>
                      </div>
                      <p className={`${mktClass.mono} text-[0.65rem] text-[var(--mkt-text3)]`}>
                        Month 3 · Company context · evidence in progress
                      </p>
                    </div>
                  </MockPanel>
                  <MockPanel title="Priorities" body="Retention, roadmap alignment, stakeholder update">
                    <ul className="space-y-2">
                      {PLATFORM_PRIORITIES.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-center gap-2 text-[0.75rem] text-[var(--mkt-text2)]"
                        >
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${
                              item.tone === "risk"
                                ? "bg-[var(--mkt-red)]"
                                : item.tone === "focus"
                                  ? "mkt-hub-pulse bg-[var(--mkt-accent-blue)]"
                                  : "bg-[var(--mkt-green-l)]"
                            }`}
                            aria-hidden
                          />
                          <span className="min-w-0 truncate">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </MockPanel>
                  <MockPanel title="Artefacts" body="PRD · Sprint plan · Risk register">
                    <ul className="space-y-1.5">
                      {PLATFORM_ARTEFACTS.map((item) => (
                        <li
                          key={item.name}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/60 px-2.5 py-1.5"
                        >
                          <span className="truncate text-[0.75rem] font-medium text-[var(--mkt-text1)]">
                            {item.name}
                          </span>
                          <span
                            className={`${mktClass.mono} shrink-0 text-[0.6rem] uppercase tracking-[0.08em] ${
                              item.status === "ready"
                                ? "text-[var(--mkt-green-l)]"
                                : "text-[var(--mkt-amber)]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </MockPanel>
                </>
              ) : null}
              {tab === "career" ? (
                <>
                  <MockPanel title="Role readiness" body="Source labelled · ScoreRun projection">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <MockChip tone="live">Developing</MockChip>
                        <MockChip>Why this band</MockChip>
                      </div>
                      <p className="text-[0.7rem] leading-relaxed text-[var(--mkt-text3)]">
                        Not a decorative score — band explains evidence coverage against the pinned
                        framework.
                      </p>
                    </div>
                  </MockPanel>
                  <MockPanel title="Career Intelligence" body="Labelled readiness, stories and gaps">
                    <ul className="space-y-2">
                      {CAREER_SKILL_BANDS.map((skill) => (
                        <li
                          key={skill.label}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/60 px-2.5 py-1.5"
                        >
                          <span className="truncate text-[0.75rem] text-[var(--mkt-text2)]">
                            {skill.label}
                          </span>
                          <span className={`${mktClass.mono} shrink-0 text-[0.6rem] text-[var(--mkt-text3)]`}>
                            {skill.band}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </MockPanel>
                  <MockPanel title="Interview prep" body="STAR stories from real project work">
                    <ul className="space-y-1.5">
                      {INTERVIEW_STORIES.map((story) => (
                        <li
                          key={story.title}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/60 px-2.5 py-1.5"
                        >
                          <span className="truncate text-[0.75rem] text-[var(--mkt-text1)]">
                            {story.title}
                          </span>
                          <MockChip>{story.tag}</MockChip>
                        </li>
                      ))}
                    </ul>
                  </MockPanel>
                </>
              ) : null}
              {tab === "delivery" ? (
                <>
                  <MockPanel title="Attention" body="Risks and decisions needing a human">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <MockChip tone="warn">2 risks</MockChip>
                        <MockChip>3 open decisions</MockChip>
                      </div>
                      <p className="text-[0.7rem] leading-relaxed text-[var(--mkt-text3)]">
                        Thin Workspace summary — not an executive mission-control dashboard.
                      </p>
                    </div>
                  </MockPanel>
                  <MockPanel title="Timeline" body="Milestones tied to the active project">
                    <ul className="space-y-2">
                      {ROADMAP_MILESTONES.map((m, i) => (
                        <li key={m.label} className="flex items-center gap-2.5 text-[0.75rem]">
                          <span
                            className={`size-2 shrink-0 rounded-full ${
                              m.done
                                ? "bg-[var(--mkt-green-l)]"
                                : i === 1
                                  ? "mkt-hub-pulse bg-[var(--mkt-accent-blue)]"
                                  : "border border-[var(--mkt-border-l)] bg-[var(--mkt-s1)]"
                            }`}
                            aria-hidden
                          />
                          <span
                            className={
                              m.done ? "text-[var(--mkt-text3)] line-through" : "text-[var(--mkt-text2)]"
                            }
                          >
                            {m.label}
                          </span>
                          <span className={`${mktClass.mono} ml-auto shrink-0 text-[0.6rem] text-[var(--mkt-text3)]`}>
                            {m.when}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </MockPanel>
                  <MockPanel title="Contribution trail" body="Authored · AI draft · submitted">
                    <ul className="space-y-1.5">
                      {WORKSPACE_TRAIL.map((item) => (
                        <li
                          key={item.label}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--mkt-border)] bg-[var(--mkt-s2)]/60 px-2.5 py-1.5"
                        >
                          <span className="truncate text-[0.75rem] text-[var(--mkt-text1)]">
                            {item.label}
                          </span>
                          <MockChip>{item.tag}</MockChip>
                        </li>
                      ))}
                    </ul>
                  </MockPanel>
                </>
              ) : null}
            </div>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </MarketingSection>
  );
}

const PLATFORM_PRIORITIES = [
  { label: "Retention dip — investigate", tone: "risk" as const },
  { label: "Roadmap alignment", tone: "focus" as const },
  { label: "Stakeholder update", tone: "ok" as const },
];

const PLATFORM_ARTEFACTS = [
  { name: "PRD", status: "ready" as const },
  { name: "Sprint plan", status: "ready" as const },
  { name: "Risk register", status: "draft" as const },
];

const CAREER_SKILL_BANDS = [
  { label: "Product sense", band: "Developing" },
  { label: "Stakeholder mgmt", band: "Emerging" },
  { label: "Delivery craft", band: "Developing" },
];

const INTERVIEW_STORIES = [
  { title: "Retention turnaround", tag: "Impact" },
  { title: "Roadmap trade-off", tag: "Conflict" },
  { title: "Sprint recovery", tag: "Ownership" },
];

const ROADMAP_MILESTONES = [
  { label: "Beta launch", when: "Jul", done: true },
  { label: "GA release", when: "Aug", done: false },
  { label: "Discovery wrap", when: "Sep", done: false },
];

const WORKSPACE_TRAIL = [
  { label: "Risk note", tag: "Submitted" },
  { label: "Meeting agenda", tag: "AI draft" },
  { label: "Decision log", tag: "Authored" },
];

function MockChip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "live" | "warn";
}) {
  const toneClass =
    tone === "live"
      ? "border-[rgba(61,150,96,0.25)] bg-[rgba(61,150,96,0.08)] text-[var(--mkt-green)]"
      : tone === "warn"
        ? "border-[rgba(183,98,10,0.28)] bg-[rgba(183,98,10,0.08)] text-[var(--mkt-amber)]"
        : "border-[var(--mkt-border)] bg-[var(--mkt-s2)] text-[var(--mkt-text3)]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.65rem] font-medium ${toneClass}`}
    >
      {children}
    </span>
  );
}

function MockPanel({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-4">
      <p className={`${mktClass.mono} text-[0.65rem] uppercase tracking-[0.12em] text-[var(--mkt-text3)]`}>
        {title}
      </p>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">{body}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function HomeOutputs() {
  return (
    <MarketingSection id="outputs" tone="white">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="What you'll build"
            title="Professional artefacts employers recognise"
            subtitle="Every challenge produces work you can show — not just certificates."
          />
        </MarketingReveal>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {OUTPUTS.map((item, i) => (
            <li key={item}>
              <MarketingReveal delay={(i % 5) * 0.03}>
                <div className="mkt-card mkt-card-lift flex h-full items-center justify-center px-3 py-5 text-center">
                  <p className="text-[0.8125rem] font-medium text-[var(--mkt-text1)]">{item}</p>
                </div>
              </MarketingReveal>
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeAiCompany() {
  return (
    <MarketingSection id="ai-company" tone="cream">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="AI Company"
            title="Meet your AI colleagues"
            subtitle="They remember, challenge, disagree and negotiate — so the work feels real."
          />
        </MarketingReveal>
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {AI_COLLEAGUES.map((colleague, i) => (
            <li key={colleague.role}>
              <MarketingReveal delay={(i % 3) * 0.04}>
                <div className="mkt-card mkt-card-lift group relative h-full overflow-hidden p-5">
                  <p className={`text-[1.05rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    {colleague.role}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text3)]">{colleague.focus}</p>
                  <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100 group-focus-within:max-h-40 group-focus-within:opacity-100">
                    <ul className="space-y-1 border-t border-[var(--mkt-border)] pt-3">
                      {AI_COLLEAGUE_BEHAVIOURS.map((b) => (
                        <li key={b} className="text-[0.75rem] leading-relaxed text-[var(--mkt-text2)]">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </MarketingReveal>
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeExperienceRecord() {
  return (
    <MarketingSection id="professional-intelligence" tone="white">
      <MarketingContainer className="!max-w-[1180px]">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <MarketingReveal>
            <MarketingSectionIntro
              label="Professional Intelligence"
              title="Your work becomes useful when its meaning is clear"
              subtitle="Claims, evidence, capability judgements and independent attestations stay distinct — so recommendations remain explainable."
            />
          </MarketingReveal>
          <MarketingReveal delay={0.06}>
            <ol className="relative space-y-0">
              <span className="mkt-record-line absolute left-[11px] top-3 bottom-3 w-px" aria-hidden />
              {EXPERIENCE_TIMELINE.map((entry) => (
                <li key={entry.month} className="relative flex gap-5 pb-8 last:pb-0">
                  <span className="relative z-[1] mt-1.5 size-6 shrink-0 rounded-full border-2 border-[var(--mkt-green-l)] bg-[var(--mkt-s1)]" />
                  <div className="mkt-card flex-1 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className={`${mktClass.mono} text-[0.7rem] text-[var(--mkt-green-l)]`}>
                        {entry.month}
                      </p>
                    </div>
                    <p className={`mt-1 text-[1.1rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
                      {entry.title}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-[var(--mkt-text2)]">{entry.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </MarketingReveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}

function TeamCopilotVisual({ title }: { title: (typeof TEAM_COPILOT_PANELS)[number]["title"] }) {
  const shell =
    "mb-4 flex h-16 items-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#0A1628] px-3";

  switch (title) {
    case "Tasks":
      return (
        <div className={`${shell} flex-col justify-center gap-1.5 py-2`} aria-hidden>
          {["w-[72%]", "w-[55%]", "w-[40%]"].map((w, i) => (
            <div key={w} className="h-1.5 w-full rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${i === 0 ? "bg-sky-400/70" : i === 1 ? "bg-emerald-400/65" : "bg-white/30"} ${w}`}
              />
            </div>
          ))}
        </div>
      );
    case "Meetings":
      return (
        <div className={`${shell} justify-between gap-3`} aria-hidden>
          <div className="flex size-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[0.65rem] text-white/70">
            10:30
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-1.5 w-[80%] rounded-full bg-white/20" />
            <div className="h-1.5 w-[55%] rounded-full bg-white/10" />
          </div>
        </div>
      );
    case "Decisions":
      return (
        <div className={`${shell} gap-1.5`} aria-hidden>
          {["Decide", "Record", "Share"].map((label) => (
            <div
              key={label}
              className="flex flex-1 flex-col items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] py-1"
            >
              <span className="text-[0.55rem] uppercase tracking-[0.08em] text-white/55">{label}</span>
            </div>
          ))}
        </div>
      );
    case "Risks":
      return (
        <div className={`${shell} justify-center gap-2.5`} aria-hidden>
          {[
            { c: "bg-rose-400", s: "size-2.5" },
            { c: "bg-amber-400", s: "size-3.5" },
            { c: "bg-emerald-400", s: "size-3" },
            { c: "bg-white/30", s: "size-2" },
          ].map((dot, i) => (
            <span key={i} className={`rounded-full ${dot.c} ${dot.s}`} />
          ))}
        </div>
      );
    case "Artefacts":
      return (
        <div className={`${shell} justify-center gap-2`} aria-hidden>
          {["PRD", "Plan", "Note"].map((label) => (
            <span
              key={label}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.55rem] uppercase tracking-[0.08em] text-white/55"
            >
              {label}
            </span>
          ))}
        </div>
      );
    case "Evidence Review":
      return (
        <div className={`${shell} flex-col justify-center gap-1.5 py-2`} aria-hidden>
          <div className="h-1.5 w-full rounded-full bg-white/10">
            <div className="h-full w-[65%] rounded-full bg-emerald-400/70" />
          </div>
          <p className="text-[0.55rem] uppercase tracking-[0.1em] text-white/35">Source labelled</p>
        </div>
      );
    case "Coach":
      return (
        <div className={`${shell} gap-2`} aria-hidden>
          <span className="rounded-md border border-dashed border-white/20 px-2 py-1 text-[0.55rem] text-white/45">
            AI draft
          </span>
          <span className="text-[0.55rem] text-white/30">→</span>
          <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[0.55rem] text-emerald-300/80">
            You submit
          </span>
        </div>
      );
    case "Consent":
      return (
        <div className={`${shell} justify-between`} aria-hidden>
          <span className="text-[0.65rem] text-white/55">Observation</span>
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.1em] text-white/45">
            Default off
          </span>
        </div>
      );
    default:
      return <div className={`${shell}`} aria-hidden />;
  }
}

export function HomeTeamCopilotPreview() {
  return (
    <MarketingSection id="team-copilot-preview" tone="dark" className="!bg-[#0B1220]">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <header className="mx-auto max-w-2xl text-center">
            <p className={`${mktClass.label} !text-white/45`}>Professional Workspace</p>
            <h2
              className={`mt-3.5 text-[clamp(1.875rem,4.2vw,2.875rem)] leading-[1.06] tracking-[-0.025em] text-white ${mktClass.serif}`}
            >
              Deliver products with confidence
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[0.9375rem] font-light leading-relaxed text-white/60">
              A calm delivery workspace for product work — tasks, meetings, decisions and evidence
              with observation consent default OFF.
            </p>
          </header>
        </MarketingReveal>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM_COPILOT_PANELS.map((panel, i) => (
            <li key={panel.title}>
              <MarketingReveal delay={(i % 4) * 0.04}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06]">
                  <TeamCopilotVisual title={panel.title} />
                  <p className={`text-[1rem] tracking-tight text-white ${mktClass.serif}`}>{panel.title}</p>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-white/55">{panel.body}</p>
                </div>
              </MarketingReveal>
            </li>
          ))}
        </ul>

        <MarketingReveal delay={0.1}>
          <div className="mt-10 text-center">
            <MarketingButtonLink href="/professional-workspace" variant="ctaLight">
              Explore Professional Workspace
            </MarketingButtonLink>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeOutcomes() {
  return (
    <MarketingSection id="outcomes" tone="white">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="Outcomes"
            title="After DeliverX you'll have"
            subtitle="Capability you can demonstrate — not just knowledge you can recite."
          />
        </MarketingReveal>
        <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {OUTCOMES.map((item, i) => (
            <li key={item}>
              <MarketingReveal delay={(i % 4) * 0.04}>
                <div className="mkt-soft-panel-light flex h-full flex-col justify-center px-5 py-6 text-center">
                  <p className={`text-[1.125rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    {item}
                  </p>
                </div>
              </MarketingReveal>
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomePricing() {
  return (
    <MarketingSection id="pricing" tone="cream">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="Pilot access"
            title="Start at any stage — or take the full journey"
            subtitle="Open pilot access today. Paid plans are not live — no checkout, no money-back claim."
          />
        </MarketingReveal>

        <ul className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {HOME_PRICING.map((tier, i) => (
            <li key={tier.id} className="min-h-0">
              <MarketingReveal delay={i * 0.05} className="h-full">
                <article
                  className={`flex h-full flex-col rounded-[var(--mkt-radius-card)] p-6 md:p-7 ${
                    tier.featured
                      ? "mkt-pricing-card-featured"
                      : "mkt-card"
                  }`}
                >
                  {tier.featured ? (
                    <p className={`${mktClass.label} !text-white/55`}>Most popular</p>
                  ) : (
                    <p className={mktClass.label}>{tier.stage}</p>
                  )}
                  <h3
                    className={`mt-3 text-[1.35rem] tracking-[-0.025em] ${mktClass.serif} ${
                      tier.featured ? "text-white" : "text-[var(--mkt-text1)]"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`mt-2 flex-1 text-[0.8125rem] leading-relaxed ${
                      tier.featured ? "text-white/70" : "text-[var(--mkt-text2)]"
                    }`}
                  >
                    {tier.summary}
                  </p>
                  <p
                    className={`mt-6 text-[clamp(1.35rem,2.5vw,1.75rem)] leading-none tracking-[-0.03em] ${mktClass.serif} ${
                      tier.featured ? "text-white" : "text-[var(--mkt-text1)]"
                    }`}
                  >
                    {tier.price}
                  </p>
                  <p className={`mt-1.5 text-[0.75rem] ${tier.featured ? "text-white/55" : "text-[var(--mkt-text3)]"}`}>
                    {tier.cadence}
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    <MarketingButtonLink
                      href={tier.ctaHref}
                      variant={tier.featured ? "ctaLight" : "primary"}
                      className="w-full justify-center"
                    >
                      Join the pilot
                    </MarketingButtonLink>
                    <Link
                      href={tier.href.startsWith("/") ? tier.href : "/pricing"}
                      className={`text-center text-[0.75rem] no-underline underline-offset-4 hover:underline ${
                        tier.featured ? "text-white/70" : "text-[var(--mkt-text3)]"
                      }`}
                    >
                      Full details →
                    </Link>
                  </div>
                </article>
              </MarketingReveal>
            </li>
          ))}
        </ul>

        <MarketingReveal delay={0.1}>
          <p className="mt-8 text-center text-[0.8125rem] text-[var(--mkt-text3)]">
            See what each product includes on the{" "}
            <Link href="/pricing" className="font-medium text-[var(--mkt-green)] no-underline hover:underline">
              access page
            </Link>
            .
          </p>
        </MarketingReveal>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeGuarantee() {
  return (
    <MarketingSection id="guarantee" tone="dark" className="!py-24 md:!py-32">
      <MarketingContainer className="!max-w-[900px] text-center">
        <MarketingReveal>
          <h2
            className={`text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.02] tracking-[-0.04em] text-white ${mktClass.serif}`}
          >
            {GUARANTEE.title}
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-[1.0625rem] font-light leading-relaxed text-white/65">
            {GUARANTEE.body}
          </p>
        </MarketingReveal>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeStories() {
  return (
    <MarketingSection id="stories" tone="white">
      <MarketingContainer className="!max-w-[1180px]">
        <MarketingReveal>
          <MarketingSectionIntro
            align="center"
            label="Illustrative journeys"
            title="How different people move through DeliverX"
            subtitle="These are demo stories — example paths, not customer testimonials."
          />
        </MarketingReveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {DEMO_STORIES.map((story, i) => (
            <li key={story.archetype}>
              <MarketingReveal delay={i * 0.05}>
                <article className="mkt-soft-panel-light h-full p-7 md:p-8">
                  <p className={mktClass.label}>Example path</p>
                  <h3
                    className={`mt-3 text-[1.25rem] tracking-tight text-[var(--mkt-text1)] ${mktClass.serif}`}
                  >
                    {story.archetype}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    {story.journey}
                  </p>
                </article>
              </MarketingReveal>
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeFaq() {
  return (
    <MarketingSection id="faq" tone="cream">
      <MarketingContainer className="!max-w-[720px]">
        <MarketingReveal>
          <MarketingSectionIntro align="center" label="FAQ" title="Questions, answered clearly" />
        </MarketingReveal>
        <div className="mt-10 space-y-2">
          {HOME_FAQ.map((item, i) => (
            <MarketingReveal key={item.q} delay={i * 0.03}>
              <details className="mkt-card group mkt-faq-item">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[0.9375rem] font-medium text-[var(--mkt-text1)] marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--mkt-border)] text-[var(--mkt-text3)] transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="border-t border-[var(--mkt-border)] px-5 py-4 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
                  {item.a}
                </p>
              </details>
            </MarketingReveal>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}

export function HomeFinalCta() {
  return (
    <MarketingSection tone="dark" className="mkt-cta-band !border-0">
      <MarketingContainer className="relative z-10 text-center">
        <MarketingReveal>
          <h2
            className={`text-[clamp(1.875rem,4.5vw,3rem)] tracking-[-0.03em] text-white ${mktClass.serif}`}
          >
            Ready to build your experience?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[0.9375rem] font-light leading-relaxed text-white/65">
            Start with meaningful work — then use Launchpad and Professional Workspace when you are ready.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <MarketingButtonLink href="/signup?product=xperience" variant="ctaLight">
              Start your experience
            </MarketingButtonLink>
            <MarketingButtonLink href="/how-it-works" variant="ctaOutline">
              See how it works
            </MarketingButtonLink>
          </div>
        </MarketingReveal>
      </MarketingContainer>
    </MarketingSection>
  );
}
