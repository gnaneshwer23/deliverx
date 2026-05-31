import Link from "next/link";
import { DxButtonLink } from "@/components/dx/dx-button";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { DxBadge } from "@/components/dx/dx-badge";
import {
  LandingContainer,
  LandingDashboardMockup,
  LandingSection,
  NavLink,
  SectionIntro,
} from "@/components/dx/landing-layout";
import { dxClass } from "@/lib/dx-theme";
import type { LandingPreviewStats } from "@/services/landing";

export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E4E4DC]/80 bg-[#FAFAF5]/90 backdrop-blur-lg">
      <LandingContainer className="flex h-[var(--dx-navh)] items-center justify-between gap-6">
        <DxLogo showTag />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#platform">Product</NavLink>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#price">Pricing</NavLink>
        </nav>
        <div className="flex items-center gap-3 md:gap-4">
          <DxButtonLink href="/login" variant="ghostSm" className="hidden sm:inline-flex">
            Sign In
          </DxButtonLink>
          <DxButtonLink href="/signup" variant="primarySm">
            Start trial
          </DxButtonLink>
        </div>
      </LandingContainer>
    </header>
  );
}

export function LandingHero({ preview }: { preview: LandingPreviewStats }) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-[var(--dx-navh)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(#E4E4DC 1px, transparent 1px), linear-gradient(90deg, #E4E4DC 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-20 h-[480px] w-[480px] rounded-full bg-[#C6DDD0]/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-[#EEF5F1]/80 blur-3xl"
        aria-hidden
      />

      <LandingContainer className="relative grid min-h-[calc(100svh-var(--dx-navh))] items-center gap-14 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 border border-[#C6DDD0] bg-white/80 px-3 py-1.5 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-[#1C4A2E]" />
            <DxCaps accent className="!text-[9px]">
              AI-native delivery OS
            </DxCaps>
          </div>
          <h1 className={`${dxClass.sectionTitle} mb-6 lg:text-[3.25rem] lg:leading-[1.08]`}>
            Deliver projects like an{" "}
            <em className="text-[#1C4A2E] not-italic">intelligent</em> organisation.
          </h1>
          <p className="mb-10 max-w-md text-lg font-light leading-relaxed text-[#6B6B64]">
            Upload your business case. Your team executes in one place. AI watches the signals —
            and only acts when you approve.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <DxButtonLink href="/signup">Start free trial</DxButtonLink>
            <DxButtonLink href="#platform" variant="ghost">
              See the product
            </DxButtonLink>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.14em] text-[#A8A89E]">
            <li>No credit card</li>
            <li>15 min setup</li>
            <li>GDPR ready</li>
          </ul>
        </div>

        <div className="relative lg:pl-4">
          {preview.live ? (
            <HeroLiveCard preview={preview} />
          ) : (
            <LandingDashboardMockup float />
          )}
        </div>
      </LandingContainer>
    </section>
  );
}

function HeroLiveCard({ preview }: { preview: LandingPreviewStats }) {
  return (
    <div className="landing-mock-float">
      <div className="overflow-hidden border border-[#E4E4DC] bg-white shadow-[0_32px_100px_-20px_rgba(13,13,11,0.18)] ring-1 ring-[#0D0D0B]/[0.04]">
        <div className="flex items-center border-b border-[#F0F0E8] bg-[#0a0e14] px-5 py-3">
          <DxCaps className="text-[#9ca3af]">Your workspace</DxCaps>
          <span className="ml-auto inline-flex items-center gap-1.5 font-[family-name:var(--font-dx-mono)] text-[8px] text-[#3D9660]">
            <span
              className="size-1.5 rounded-full bg-[#1A6B3A]"
              style={{ animation: "dx-pulse 2s ease-in-out infinite" }}
            />
            Live data
          </span>
        </div>
        <div className="grid grid-cols-3 gap-px bg-[#F0F0E8]">
          {[
            { v: `${preview.confidence}%`, l: "Confidence", c: "text-[#1A6B3A]" },
            { v: String(preview.atRisk), l: "At risk", c: "text-[#B7620A]" },
            { v: String(preview.blocked), l: "Blocked", c: "text-[#C0392B]" },
          ].map((s) => (
            <div key={s.l} className="bg-white px-4 py-4 text-center">
              <div className={`${dxClass.display} text-xl leading-none ${s.c}`}>{s.v}</div>
              <DxCaps className="mt-1 text-[6px]">{s.l}</DxCaps>
            </div>
          ))}
        </div>
        <div className="space-y-2 p-4">
          {preview.signals.map((signal) => (
            <SignalPreview
              key={signal.text}
              tone={signal.tone}
              text={signal.text}
              badge={signal.badge}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SignalPreview({
  tone,
  text,
  badge,
}: {
  tone: "red" | "amber" | "green";
  text: string;
  badge: string;
}) {
  const styles = {
    red: { border: "#C0392B", bg: "bg-[#FDF1F0]/80" },
    amber: { border: "#B7620A", bg: "bg-[#FEF6EC]/80" },
    green: { border: "#1A6B3A", bg: "bg-[#EDF7F1]/80" },
  }[tone];

  return (
    <div
      className={`flex items-center justify-between gap-3 border-l-[3px] px-3 py-2.5 ${styles.bg}`}
      style={{ borderLeftColor: styles.border }}
    >
      <span className="text-[13px] leading-snug text-[#2C2C28]">{text}</span>
      <DxBadge tone={tone === "green" ? "green" : tone === "amber" ? "amber" : "red"}>
        {badge}
      </DxBadge>
    </div>
  );
}

export function LandingProblem() {
  const stats = [
    {
      n: "40%",
      t: "PM time on admin",
      d: "Status chasing and report writing consume nearly half the week.",
    },
    {
      n: "3wk",
      t: "Risk escalation lag",
      d: "Issues spotted in standups often go unlogged until it's too late.",
    },
    {
      n: "97%",
      t: "Lessons lost",
      d: "Closure reports sit in folders instead of shaping the next programme.",
    },
  ];

  return (
    <LandingSection tone="ink" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#1C4A2E]/20 to-transparent"
        aria-hidden
      />
      <LandingContainer className="relative">
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
        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <article
              key={s.n}
              className="relative overflow-hidden border border-white/[0.08] bg-white/[0.03] p-8 md:p-9"
            >
              <span
                className={`${dxClass.display} pointer-events-none absolute -right-2 -top-4 text-[5.5rem] leading-none text-white/[0.04]`}
                aria-hidden
              >
                {s.n}
              </span>
              <p className="relative font-[family-name:var(--font-dx-mono)] text-2xl font-medium tracking-tight text-[#3D9660]">
                {s.n}
              </p>
              <h3 className="relative mt-3 text-lg font-semibold text-white">{s.t}</h3>
              <p className="relative mt-2 text-sm font-light leading-relaxed text-white/45">
                {s.d}
              </p>
            </article>
          ))}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingFeatures() {
  return (
    <LandingSection id="features" tone="muted">
      <LandingContainer>
        <SectionIntro
          eyebrow="Features"
          title={
            <>
              Built for delivery, not{" "}
              <em className="text-[#1C4A2E] not-italic">task management.</em>
            </>
          }
        />
        <div className="grid gap-5 md:grid-cols-2">
          <FeatureBlock
            eyebrow="Signals"
            title="Risks surface before they escalate"
            dark={false}
            bullets={[
              "RAID fed from standups and tasks",
              "Alert queue with PM review",
              "Milestone confidence on the dashboard",
            ]}
          />
          <FeatureBlock
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
            eyebrow="Meetings"
            title="Meetings become operational records"
            dark={false}
            bullets={[
              "Summaries and decision capture",
              "Actions with suggested owners",
              "Change requests from outcomes",
            ]}
          />
          <FeatureBlock
            eyebrow="Memory"
            title="Every project makes the next one smarter"
            dark={false}
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
  bullets,
}: {
  eyebrow: string;
  title: string;
  dark?: boolean;
  bullets: string[];
}) {
  return (
    <div
      className={`flex min-h-[220px] flex-col p-8 md:p-10 ${
        dark
          ? "bg-[#1C4A2E] text-white md:min-h-[260px]"
          : "border border-[#E4E4DC] bg-white"
      }`}
    >
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
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
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
    <LandingSection tone="ink" className="!py-28 md:!py-36">
      <LandingContainer className="text-center">
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
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#1A1A17]">
      <LandingContainer className="flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <DxLogo dark />
        <DxCaps className="text-[8px] text-white/25">
          © 2026 DeliverX Ltd.
        </DxCaps>
        <div className="flex gap-8">
          {["Privacy", "Terms", "Security"].map((l) => (
            <Link
              key={l}
              href="#"
              className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.16em] text-white/30 transition hover:text-white/60"
            >
              {l}
            </Link>
          ))}
        </div>
      </LandingContainer>
    </footer>
  );
}
