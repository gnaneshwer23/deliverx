import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  FileBarChart2,
  Layers,
  MessageSquare,
  Radar,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { DxButtonLink } from "@/components/dx/dx-button";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { LandingReveal } from "@/components/dx/landing-motion";
import { LandingMobileNav } from "@/components/dx/landing-nav-menu";
import {
  LandingContainer,
  landingCard,
  LandingSection,
  NavLink,
  SectionIntro,
} from "@/components/dx/landing-layout";
import { dxClass } from "@/lib/dx-theme";

export function LandingNav() {
  return (
    <header className="landing-nav fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <LandingContainer className="landing-nav-bar relative flex h-[calc(var(--dx-navh)-12px)] items-center justify-between gap-4 border border-[#E4E4DC]/70 bg-[#FAFAF5]/75 px-5 shadow-[0_8px_40px_-16px_rgba(13,13,11,0.12)] backdrop-blur-xl md:px-8">
        <DxLogo showTag />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#platform">Product</NavLink>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
          <NavLink href="#price">Pricing</NavLink>
        </nav>
        <div className="flex items-center gap-3 md:gap-4">
          <DxButtonLink href="/login" variant="ghostSm" className="hidden sm:inline-flex">
            Sign In
          </DxButtonLink>
          <DxButtonLink href="/signup" variant="primarySm" className="hidden md:inline-flex">
            Start trial
          </DxButtonLink>
          <LandingMobileNav />
        </div>
      </LandingContainer>
    </header>
  );
}

export { LandingHero } from "@/components/dx/landing-hero";

export function LandingProblem() {
  const stats = [
    {
      n: "40%",
      t: "PM time on admin",
      d: "Status chasing and report writing consume nearly half the week.",
      icon: Clock,
    },
    {
      n: "3wk",
      t: "Risk escalation lag",
      d: "Issues spotted in standups often go unlogged until it's too late.",
      icon: AlertTriangle,
    },
    {
      n: "97%",
      t: "Lessons lost",
      d: "Closure reports sit in folders instead of shaping the next programme.",
      icon: Layers,
    },
  ];

  return (
    <LandingSection id="problem" tone="ink" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#1C4A2E]/20 to-transparent"
        aria-hidden
      />
      <LandingContainer className="relative">
        <LandingReveal>
          <SectionIntro
            eyebrow="The problem"
            light
          title={
            <>
              Twelve tools.
              <br />
              <em className="text-[#3D9660] not-italic">Zero shared context.</em>
            </>
          }
            description="PMs chase status. Risks surface late. Lessons never compound."
          />
        </LandingReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((s, i) => (
            <LandingReveal key={s.n} delay={i * 0.06}>
              <article className="relative h-full overflow-hidden border border-white/[0.08] bg-white/[0.03] p-8 transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] md:p-9">
                <span
                  className={`${dxClass.display} pointer-events-none absolute -right-2 -top-4 text-[5.5rem] leading-none text-white/[0.04]`}
                  aria-hidden
                >
                  {s.n}
                </span>
                <span className="relative mb-4 flex size-10 items-center justify-center border border-[#3D9660]/30 bg-[#3D9660]/10">
                  <s.icon size={18} className="text-[#3D9660]" strokeWidth={1.5} />
                </span>
                <p className="relative font-[family-name:var(--font-dx-mono)] text-2xl font-medium tracking-tight text-[#3D9660]">
                  {s.n}
                </p>
                <h3 className="relative mt-3 text-lg font-semibold text-white">{s.t}</h3>
                <p className="relative mt-2 text-sm font-light leading-relaxed text-white/45">
                  {s.d}
                </p>
              </article>
            </LandingReveal>
          ))}
        </div>

        <LandingReveal delay={0.15}>
          <div className="mt-14 flex flex-col items-start justify-between gap-6 border border-[#3D9660]/30 bg-[#1C4A2E]/40 p-8 md:flex-row md:items-center md:p-10">
            <div className="max-w-xl">
              <DxCaps className="text-[#3D9660]">The answer</DxCaps>
              <p className={`${dxClass.display} mt-3 text-2xl leading-snug text-white md:text-3xl`}>
                One workspace. One signal graph. Human-approved AI.
              </p>
              <p className="mt-3 text-sm font-light leading-relaxed text-white/50">
                DeliverX replaces the patchwork with a command centre that stays in sync from
                charter to closure.
              </p>
            </div>
            <DxButtonLink href="/signup" className="shrink-0">
              Start free trial
            </DxButtonLink>
          </div>
        </LandingReveal>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingFeatures() {
  return (
    <LandingSection id="features" tone="muted">
      <LandingContainer>
        <LandingReveal>
          <SectionIntro
            eyebrow="Features"
            title={
              <>
                Built for delivery, not{" "}
                <em className="text-[#1C4A2E] not-italic">task management.</em>
              </>
            }
            description="Every module reads from the same project signals — no duplicate entry, no drift between tools."
          />
        </LandingReveal>
        <div className="grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-12 md:gap-5">
          <FeatureBlock
            className="md:col-span-7 md:row-span-2"
            icon={FileBarChart2}
            eyebrow="Reporting"
            title="Status reports that write themselves"
            dark
            bullets={[
              "Draft → review → publish pipeline",
              "Executive summaries for sponsors",
              "Optional email on publish",
            ]}
          />
          <FeatureBlock
            className="md:col-span-5"
            icon={Radar}
            eyebrow="Signals"
            title="Risks surface before they escalate"
            bullets={[
              "RAID fed from standups and tasks",
              "Alert queue with PM review",
              "Milestone confidence on the dashboard",
            ]}
          />
          <FeatureBlock
            className="md:col-span-5"
            icon={MessageSquare}
            eyebrow="Meetings"
            title="Meetings become operational records"
            bullets={[
              "Summaries and decision capture",
              "Actions with suggested owners",
              "Change requests from outcomes",
            ]}
          />
          <FeatureBlock
            className="md:col-span-7"
            icon={Sparkles}
            eyebrow="Memory"
            title="Every project makes the next one smarter"
            accent
            bullets={[
              "Lessons learned you can search",
              "Playbooks across programmes",
              "Patterns from closed work",
            ]}
          />
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

function FeatureBlock({
  eyebrow,
  title,
  dark,
  accent,
  bullets,
  icon: Icon,
  className = "",
}: {
  eyebrow: string;
  title: string;
  dark?: boolean;
  accent?: boolean;
  bullets: string[];
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <LandingReveal className={`h-full ${className}`}>
      <div
        className={`flex h-full min-h-[200px] flex-col p-8 md:p-10 ${
          dark
            ? "bg-[#1C4A2E] text-white"
            : accent
              ? "border border-[#C6DDD0] bg-gradient-to-br from-[#EEF5F1] to-white"
              : landingCard
        }`}
      >
        <span
          className={`mb-4 flex size-11 items-center justify-center border ${
            dark
              ? "border-[#3D9660]/40 bg-[#3D9660]/15"
              : "border-[#C6DDD0] bg-white"
          }`}
        >
          <Icon
            size={20}
            className={dark ? "text-[#3D9660]" : "text-[#1C4A2E]"}
            strokeWidth={1.5}
          />
        </span>
        <DxCaps className={`mb-3 ${dark ? "text-[#3D9660]" : ""}`} accent={!dark}>
          {eyebrow}
        </DxCaps>
      <h3 className={`${dxClass.display} mb-6 text-2xl leading-snug md:text-[1.65rem]`}>
        {title}
      </h3>
      <ul className="mt-auto space-y-2.5">
        {bullets.map((b) => (
          <li
            key={b}
            className={`flex gap-3 text-sm leading-snug ${dark ? "text-white/80" : "text-[#6B6B64]"}`}
          >
            <span
              className={`mt-2 h-px w-3 shrink-0 ${dark ? "bg-[#3D9660]" : "bg-[#1C4A2E]"}`}
            />
            {b}
          </li>
        ))}
      </ul>
      </div>
    </LandingReveal>
  );
}

export function LandingPricing() {
  const tiers = [
    {
      name: "Starter",
      sub: "Solo PM",
      price: "£49",
      note: "per month",
      features: [
        "3 active projects",
        "Up to 10 team members",
        "AI document analysis",
        "Standup intelligence",
        "Weekly status reports",
      ],
      cta: "Start free trial",
      href: "/signup",
      featured: false,
    },
    {
      name: "Professional",
      sub: "Delivery teams",
      price: "£149",
      note: "per month",
      features: [
        "Unlimited projects",
        "Unlimited team members",
        "Meeting intelligence",
        "Decision register",
        "Organisational memory",
      ],
      cta: "Start free trial",
      href: "/signup",
      featured: true,
    },
    {
      name: "Enterprise",
      sub: "PMO & programmes",
      price: "Custom",
      note: "talk to us",
      features: [
        "All Professional features",
        "Programme layer",
        "Portfolio dashboard",
        "SSO / SAML",
        "Dedicated success",
      ],
      cta: "Contact sales",
      href: "/signup",
      featured: false,
    },
  ];

  return (
    <LandingSection id="price" tone="white">
      <LandingContainer>
        <LandingReveal>
          <SectionIntro
            eyebrow="Pricing"
            align="center"
            title={
              <>
                Simple plans. <em className="text-[#1C4A2E] not-italic">Serious delivery.</em>
              </>
            }
            description="30-day free trial on all plans. No credit card required."
          />
        </LandingReveal>
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <LandingReveal key={t.name} delay={i * 0.06} className="h-full">
            <article
              key={t.name}
              className={`relative flex flex-col border p-8 md:p-9 ${
                t.featured
                  ? "border-[#1C4A2E] bg-[#1C4A2E] text-white shadow-[0_24px_60px_-20px_rgba(28,74,46,0.45)] lg:-mt-4 lg:mb-4 lg:py-12"
                  : "border-[#E4E4DC] bg-[#FAFAF5]"
              }`}
            >
              {t.featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap border border-[#3D9660] bg-[#3D9660] px-3 py-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-white">
                  Most popular
                </span>
              ) : null}
              <DxCaps className={t.featured ? "text-[#3D9660]" : ""}>{t.name}</DxCaps>
              <p
                className={`${dxClass.display} mt-2 text-xl ${t.featured ? "text-white/90" : "text-[#6B6B64]"}`}
              >
                {t.sub}
              </p>
              <p
                className={`mt-4 font-[family-name:var(--font-dx-mono)] text-4xl tracking-tight ${t.featured ? "text-white" : "text-[#0D0D0B]"}`}
              >
                {t.price}
              </p>
              <p
                className={`mt-1 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider ${t.featured ? "text-white/40" : "text-[#A8A89E]"}`}
              >
                {t.note}
              </p>
              <ul className="my-8 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className={`flex gap-3 text-sm ${t.featured ? "text-white/85" : "text-[#2C2C28]"}`}
                  >
                    <CheckIcon featured={t.featured} />
                    {f}
                  </li>
                ))}
              </ul>
              {t.featured ? (
                <Link
                  href={t.href}
                  className="flex w-full items-center justify-center bg-white px-5 py-3 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.12em] text-[#1C4A2E] transition hover:bg-[#EEF5F1]"
                >
                  {t.cta}
                </Link>
              ) : (
                <DxButtonLink href={t.href} variant="ghost" className="w-full justify-center">
                  {t.cta}
                </DxButtonLink>
              )}
            </article>
            </LandingReveal>
          ))}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

function CheckIcon({ featured }: { featured: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={`mt-0.5 shrink-0 ${featured ? "text-[#3D9660]" : "text-[#1C4A2E]"}`}
      aria-hidden
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M2 7l3.5 3.5L12 4"
      />
    </svg>
  );
}

export function LandingCta() {
  return (
    <LandingSection tone="ink" className="relative !py-28 overflow-hidden md:!py-36">
      <div className="landing-mesh-dark pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <LandingContainer className="relative text-center">
        <LandingReveal>
          <SectionIntro
            eyebrow="Get started"
            light
            align="center"
            title={
              <>
                Ready to deliver like an{" "}
                <em className="text-[#3D9660] not-italic">intelligent</em> organisation?
              </>
            }
            description="30-day free trial · No credit card · ~15 minutes to first project"
          />
        </LandingReveal>
        <LandingReveal delay={0.08}>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-white px-10 py-3.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.14em] text-[#1C4A2E] transition hover:bg-[#EEF5F1]"
          >
            Start free trial
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center border border-white/20 px-8 py-3.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.14em] text-white transition hover:border-white/40"
          >
            Sign in
          </Link>
        </div>
        </LandingReveal>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingFooter() {
  const columns = [
    {
      title: "Product",
      links: [
        { href: "#how", label: "How it works" },
        { href: "#platform", label: "Command centre" },
        { href: "#features", label: "Features" },
        { href: "#capabilities", label: "Capabilities" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#faq", label: "FAQ" },
        { href: "#price", label: "Pricing" },
        { href: "/login", label: "Sign in" },
        { href: "/signup", label: "Start trial" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#1A1A17]">
      <LandingContainer className="py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <DxLogo dark />
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-white/40">
              AI-native delivery OS — from business case to lessons learned, with human approval
              on every change.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <DxCaps className="text-[8px] text-white/30">{col.title}</DxCaps>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/50 transition hover:text-white/80"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <DxCaps className="text-[8px] text-white/25">© 2026 DeliverX Ltd.</DxCaps>
          <p className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.14em] text-white/25">
            GDPR-ready · EU data practices
          </p>
        </div>
      </LandingContainer>
    </footer>
  );
}
