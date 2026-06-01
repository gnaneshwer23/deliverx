import Link from "next/link";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import {
  LandingContainer,
  LandingSection,
  NavLink,
  SectionIntro,
} from "@/components/dx/landing-layout";
import { PpButtonLink } from "@/components/dx/landing-pp-ui";
import { ppClass } from "@/lib/policy-pilot-theme";
import { dxClass } from "@/lib/dx-theme";

export function LandingNav() {
  return (
    <header className="landing-nav fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <LandingContainer className="landing-nav-bar flex h-[calc(var(--dx-navh)-12px)] items-center justify-between gap-6 rounded-2xl border border-white/[0.08] bg-[#0a0e14]/80 px-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl md:px-8">
        <DxLogo href="/" showTag dark />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <NavLink href="#shift">The shift</NavLink>
          <NavLink href="#agents">Agents</NavLink>
          <NavLink href="#platform">Product</NavLink>
          <NavLink href="#price">Pricing</NavLink>
        </nav>
        <div className="flex items-center gap-3 md:gap-4">
          <PpButtonLink href="/login" variant="ghost" className="!px-4 !py-2 !text-[9px]">
            Sign in
          </PpButtonLink>
          <PpButtonLink href="/signup" className="!px-5 !py-2 !text-[9px]">
            Start trial
          </PpButtonLink>
        </div>
      </LandingContainer>
    </header>
  );
}

export { LandingHero } from "@/components/dx/landing-hero";

export function LandingFeatures() {
  return (
    <LandingSection id="features" tone="muted">
      <LandingContainer>
        <SectionIntro
          onCream
          eyebrow="Features"
          title={
            <>
              Built for delivery, not{" "}
              <em className="text-[#1C4A2E] not-italic">task management.</em>
            </>
          }
        />
        <div className="grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-12 md:gap-5">
          <FeatureBlock
            className="md:col-span-7 md:row-span-2"
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
  className = "",
}: {
  eyebrow: string;
  title: string;
  dark?: boolean;
  accent?: boolean;
  bullets: string[];
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[200px] flex-col rounded-2xl p-8 transition hover:shadow-[0_20px_50px_-24px_rgba(10,14,20,0.15)] md:p-10 ${className} ${
        dark
          ? "bg-[#0a0e14] text-[#f8f6f2]"
          : accent
            ? "border border-[#6ee7c7]/30 bg-gradient-to-br from-[#eefaf6] to-white"
            : `${ppClass.cardLight}`
      }`}
    >
      <DxCaps className={`mb-3 ${dark ? "text-[#6ee7c7]" : ""}`} accent={!dark}>
        {eyebrow}
      </DxCaps>
      <h3 className={`${dxClass.display} mb-6 text-2xl leading-snug md:text-[1.65rem]`}>
        {title}
      </h3>
      <ul className="mt-auto space-y-2.5">
        {bullets.map((b) => (
          <li
            key={b}
            className={`flex gap-3 text-sm leading-snug ${dark ? "text-white/75" : "text-[#6B6B64]"}`}
          >
            <span
              className={`mt-2 h-px w-3 shrink-0 ${dark ? "bg-[#6ee7c7]" : "bg-[#1C4A2E]"}`}
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
    <LandingSection id="price" tone="base">
      <LandingContainer>
        <SectionIntro
          light
          align="center"
          eyebrow="Pricing"
          title={
            <>
              Simple plans. <em className="text-[#6ee7c7] not-italic">Serious delivery.</em>
            </>
          }
          description="30-day free trial on all plans. No credit card required."
        />
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <article
              key={t.name}
              className={`relative flex flex-col rounded-2xl border p-8 md:p-9 ${
                t.featured
                  ? "border-[#6ee7c7]/40 bg-[#111820] text-[#f8f6f2] shadow-[0_24px_60px_-20px_rgba(110,231,199,0.25)] lg:-mt-4 lg:mb-4 lg:py-12"
                  : `${ppClass.cardDark}`
              }`}
            >
              {t.featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#6ee7c7]/50 bg-[#6ee7c7]/15 px-3 py-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6ee7c7]">
                  Most popular
                </span>
              ) : null}
              <DxCaps className={t.featured ? "text-[#6ee7c7]" : "text-[#6ee7c7]"}>{t.name}</DxCaps>
              <p
                className={`${dxClass.display} mt-2 text-xl ${t.featured ? "text-white/90" : "text-white/60"}`}
              >
                {t.sub}
              </p>
              <p
                className={`mt-4 font-[family-name:var(--font-dx-mono)] text-4xl tracking-tight ${t.featured ? "text-white" : "text-[#f8f6f2]"}`}
              >
                {t.price}
              </p>
              <p
                className={`mt-1 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-wider ${t.featured ? "text-white/40" : "text-white/35"}`}
              >
                {t.note}
              </p>
              <ul className="my-8 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className={`flex gap-3 text-sm ${t.featured ? "text-white/85" : "text-white/70"}`}
                  >
                    <CheckIcon featured={t.featured} />
                    {f}
                  </li>
                ))}
              </ul>
              {t.featured ? (
                <PpButtonLink href={t.href} className="w-full justify-center">
                  {t.cta}
                </PpButtonLink>
              ) : (
                <PpButtonLink href={t.href} variant="ghost" className="w-full justify-center">
                  {t.cta}
                </PpButtonLink>
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
      className={`mt-0.5 shrink-0 ${featured ? "text-[#6ee7c7]" : "text-[#6ee7c7]"}`}
      aria-hidden
    >
      <path fill="none" stroke="currentColor" strokeWidth="2" d="M2 7l3.5 3.5L12 4" />
    </svg>
  );
}

export function LandingCta() {
  return (
    <LandingSection tone="ink" className="relative overflow-hidden !py-28 md:!py-36">
      <div className="landing-pp-glow pointer-events-none absolute inset-0" aria-hidden />
      <LandingContainer className="relative text-center">
        <SectionIntro
          eyebrow="Get started"
          light
          align="center"
          title={
            <>
              Ready to deliver like an{" "}
              <em className="text-[#6ee7c7] not-italic">intelligent</em> organisation?
            </>
          }
          description="30-day free trial · No credit card · ~15 minutes to first project"
        />
        <div className="flex flex-wrap justify-center gap-4">
          <PpButtonLink href="/signup">Start free trial</PpButtonLink>
          <PpButtonLink href="/login" variant="ghost">
            Sign in
          </PpButtonLink>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060910]">
      <LandingContainer className="flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <DxLogo dark />
        <DxCaps className="text-[8px] text-white/25">© 2026 DeliverX Ltd.</DxCaps>
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
