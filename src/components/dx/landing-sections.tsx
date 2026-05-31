import Link from "next/link";
import { DxButtonLink } from "@/components/dx/dx-button";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-[var(--dx-navh)] items-center gap-9 border-b border-[#E4E4DC] bg-[#FAFAF5]/95 px-6 backdrop-blur-md md:px-11">
      <DxLogo showTag />
      <div className="ml-auto flex items-center gap-7">
        <a href="#platform" className={`${dxClass.caps} hidden sm:inline`}>
          Platform
        </a>
        <a href="#how" className={dxClass.caps}>
          How It Works
        </a>
        <a href="#loops" className={`${dxClass.caps} hidden md:inline`}>
          Loops
        </a>
        <a href="#feat" className={dxClass.caps}>
          Features
        </a>
        <a href="#price" className={dxClass.caps}>
          Pricing
        </a>
        <DxButtonLink href="/login" variant="ghostSm">
          Sign In
        </DxButtonLink>
        <DxButtonLink href="/signup" variant="primarySm">
          Start Free Trial
        </DxButtonLink>
      </div>
    </nav>
  );
}

import type { LandingPreviewStats } from "@/services/landing";

export function LandingHero({ preview }: { preview: LandingPreviewStats }) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-[calc(var(--dx-navh)+4rem)] md:px-11">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(#E4E4DC 1px, transparent 1px), linear-gradient(90deg, #E4E4DC 1px, transparent 1px)",
          backgroundSize: "68px 68px",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-[4.5rem]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-[#1C4A2E]" />
            <DxCaps accent>AI-Native Delivery Operating System</DxCaps>
          </div>
          <h1 className={`${dxClass.sectionTitle} mb-5`}>
            Deliver Projects
            <br />
            Like an <em className="text-[#1C4A2E] not-italic">Intelligent</em>
            <br />
            Organisation.
          </h1>
          <p className="mb-9 max-w-md text-[17px] font-light leading-relaxed text-[#6B6B64]">
            One workspace for projects, governance, portfolio intelligence, and AI-assisted
            delivery — from business case to closure, with human approval on every AI action.
          </p>
          <div className="mb-10 flex flex-wrap items-center gap-3">
            <DxButtonLink href="/signup">Start Free Trial</DxButtonLink>
            <DxButtonLink href="/workspace/dashboard" variant="ghost">
              Explore Dashboard
            </DxButtonLink>
          </div>
          <div className="flex flex-wrap items-center gap-5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.1em] text-[#A8A89E]">
            <span>No credit card</span>
            <span className="h-2.5 w-px bg-[#E4E4DC]" />
            <span>15 min setup</span>
            <span className="h-2.5 w-px bg-[#E4E4DC]" />
            <span>GDPR compliant</span>
          </div>
        </div>

        <div className={`${dxClass.card} shadow-[0_8px_40px_rgba(13,13,11,0.12)]`}>
          <div className="flex items-center justify-between border-b border-[#F0F0E8] px-4 py-3">
            <DxCaps>Delivery command centre</DxCaps>
            <span className="flex items-center gap-1 font-[family-name:var(--font-dx-mono)] text-[8px] text-[#1A6B3A]">
              <span
                className="size-1 rounded-full bg-[#1A6B3A]"
                style={{ animation: preview.live ? "dx-pulse 2s ease-in-out infinite" : undefined }}
              />
              {preview.live ? "Live" : "Sample"}
            </span>
          </div>
          <div className="p-4">
            <div className="mb-3.5 grid grid-cols-3 gap-2.5">
              {[
                { v: `${preview.confidence}%`, l: "Confidence", c: "text-[#1A6B3A]" },
                { v: String(preview.atRisk), l: "At Risk", c: "text-[#B7620A]" },
                { v: String(preview.blocked), l: "Blocked", c: "text-[#C0392B]" },
              ].map((s) => (
                <div key={s.l} className="border border-[#F0F0E8] bg-[#F7F7F2] p-3">
                  <div className={`${dxClass.display} text-[1.75rem] leading-none ${s.c}`}>
                    {s.v}
                  </div>
                  <DxCaps className="mt-0.5 text-[7px]">{s.l}</DxCaps>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
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
      </div>
    </section>
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
  const border =
    tone === "red" ? "#C0392B" : tone === "amber" ? "#B7620A" : "#1A6B3A";
  const bg =
    tone === "red"
      ? "rgba(192,57,43,0.03)"
      : tone === "amber"
        ? "rgba(183,98,10,0.03)"
        : "rgba(26,107,58,0.03)";
  return (
    <div
      className="flex items-center justify-between gap-2 border-l-[2.5px] px-2.5 py-2"
      style={{ borderLeftColor: border, backgroundColor: bg }}
    >
      <span className="text-[13px] text-[#2C2C28]">{text}</span>
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
      t: "PM time wasted on admin",
      d: "Status chasing, report writing, and meeting scheduling take up nearly half a PM's week.",
    },
    {
      n: "3wk",
      t: "Average risk escalation lag",
      d: "Risks visible in early standup notes go unlogged for weeks. AI extraction reduces the lag to the same day.",
    },
    {
      n: "97%",
      t: "Lessons never reused",
      d: "Most lessons learned reports are filed and never read. DeliverX makes every closed project searchable.",
    },
  ];
  return (
    <section className="bg-[#0D0D0B] px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps className="mb-3.5 text-[#3D9660]">The Problem</DxCaps>
        <h2 className={`${dxClass.display} mb-3.5 text-4xl leading-tight text-white md:text-5xl`}>
          Project teams use 12 tools.
          <br />
          None of them <em className="text-[#3D9660] not-italic">talk to each other.</em>
        </h2>
        <p className="mb-14 max-w-lg text-base font-light leading-relaxed text-white/40">
          PMs spend 40% of their week chasing status. Risks are spotted 3 weeks late. Lessons are
          never captured.
        </p>
        <div className="grid gap-px bg-white/[0.06] md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.n} className="bg-[#0D0D0B] p-8 md:p-9">
              <div className={`${dxClass.display} mb-2.5 text-[3.5rem] leading-none text-white/5`}>
                {s.n}
              </div>
              <div className="mb-1.5 text-[15px] font-semibold text-white">{s.t}</div>
              <p className="text-sm font-light leading-relaxed text-white/40">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingHow() {
  const steps = [
    {
      n: "01",
      t: "Upload your business case",
      d: "Upload a PDF or describe your project. DeliverX generates your full project structure in under 60 seconds.",
    },
    {
      n: "02",
      t: "Invite your team",
      d: "Generate invite links per role. Team members join in under 3 minutes and see tasks sorted by priority.",
    },
    {
      n: "03",
      t: "Execute with AI monitoring",
      d: "Dashboard command centre, standups, RAID, and alert queue. Assistant proposes actions — you approve before they apply.",
    },
    {
      n: "04",
      t: "Close and learn",
      d: "AI generates closure reports and lessons learned. Every insight stored in Organisational Memory.",
    },
  ];
  return (
    <section id="how" className="bg-[#FAFAF5] px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps accent className="mb-3">
          How It Works
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-12`}>
          From business case to <em className="text-[#1C4A2E] not-italic">closed project</em> — one
          workspace.
        </h2>
        <div className="grid border border-[#E4E4DC] md:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`relative p-7 md:p-8 ${i < 3 ? "md:border-r md:border-[#E4E4DC]" : ""}`}
            >
              <div className={`${dxClass.display} mb-4 text-5xl leading-none text-[#F0F0E8]`}>
                {s.n}
              </div>
              <div className="mb-2 text-[15px] font-semibold leading-snug text-[#0D0D0B]">
                {s.t}
              </div>
              <p className="text-[13px] font-light leading-relaxed text-[#6B6B64]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section id="feat" className="bg-[#F7F7F2] px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps accent className="mb-3">
          Features
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-12`}>
          Built for delivery, not <em className="text-[#1C4A2E] not-italic">task management.</em>
        </h2>
        <div className="grid gap-px bg-[#E4E4DC] md:grid-cols-2 lg:grid-cols-3">
          <FeatureBlock
            eyebrow="AI Intelligence Layer"
            title="Risks surface before they escalate"
            dark={false}
            bullets={[
              "RAID log auto-populated from standups",
              "Milestone confidence updated daily",
              "5 alert types with PM review queue",
            ]}
          />
          <FeatureBlock
            eyebrow="Reporting Engine"
            title="Status reports that write themselves"
            dark
            bullets={[
              "Weekly report — every Monday at 07:00",
              "Executive summary to sponsor",
              "AI citations on every generated output",
            ]}
          />
          <FeatureBlock
            eyebrow="Meeting Intelligence"
            title="Meetings become operational records"
            dark={false}
            bullets={[
              "Decision Register auto-population",
              "Action items with suggested owners",
              "Change requests from meeting output",
            ]}
          />
          <FeatureBlock
            eyebrow="Organisational Memory"
            title="Every project makes the next one smarter"
            dark={false}
            bullets={[
              "Searchable lessons learned library",
              "Risk patterns across projects",
              "Delivery playbooks enriched automatically",
            ]}
          />
          <FeatureBlock
            eyebrow="Portfolio & Twin"
            title="See the whole programme, not just tasks"
            dark
            bullets={[
              "Portfolio & programme dependencies",
              "Digital twin scenarios & snapshots",
              "Coordination + global intelligence loops",
            ]}
          />
          <FeatureBlock
            eyebrow="Workspace search"
            title="Find anything across your org"
            dark={false}
            bullets={[
              "Projects, tasks, RAID, documents",
              "Nav search + dedicated search page",
              "Tied to your organisation boundary",
            ]}
          />
        </div>
      </div>
    </section>
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
    <div className={`p-10 ${dark ? "bg-[#1C4A2E]" : "bg-[#FAFAF5]"}`}>
      <DxCaps className={`mb-2.5 ${dark ? "text-[#3D9660]" : ""}`} accent={!dark}>
        {eyebrow}
      </DxCaps>
      <h3
        className={`${dxClass.display} mb-2.5 text-2xl leading-snug ${dark ? "text-white" : "text-[#0D0D0B]"}`}
      >
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {bullets.map((b) => (
          <li
            key={b}
            className={`relative pl-4 text-sm leading-snug ${dark ? "text-white/75" : "text-[#2C2C28]"}`}
          >
            <span
              className={`absolute left-0 top-2 h-px w-1.5 ${dark ? "bg-[#3D9660]" : "bg-[#1C4A2E]"}`}
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
      cta: "Start Free Trial",
      href: "/signup",
      featured: false,
    },
    {
      name: "Professional",
      sub: "Delivery Teams",
      price: "£149",
      note: "per month",
      features: [
        "Unlimited projects",
        "Unlimited team members",
        "Meeting intelligence",
        "Decision Register",
        "Organisational Memory",
      ],
      cta: "Start Free Trial",
      href: "/signup",
      featured: true,
    },
    {
      name: "Enterprise",
      sub: "PMO & Programmes",
      price: "Custom",
      note: "contact for pricing",
      features: [
        "All Professional features",
        "Programme layer",
        "Portfolio dashboard",
        "SSO / SAML",
        "Dedicated success manager",
      ],
      cta: "Contact Sales",
      href: "/signup",
      featured: false,
    },
  ];

  return (
    <section id="price" className="border-t border-[#E4E4DC] bg-white px-6 py-24 md:px-11">
      <div className="mx-auto max-w-7xl">
        <DxCaps accent className="mb-3">
          Pricing
        </DxCaps>
        <h2 className={`${dxClass.sectionTitle} mb-12`}>
          One price. <em className="text-[#1C4A2E] not-italic">No hidden complexity.</em>
        </h2>
        <div className="grid gap-px bg-[#E4E4DC] md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`p-9 ${t.featured ? "bg-[#1C4A2E]" : "bg-white"}`}
            >
              <DxCaps className={t.featured ? "text-[#3D9660]" : ""}>{t.name}</DxCaps>
              <div
                className={`${dxClass.display} mt-2 text-2xl ${t.featured ? "text-white" : "text-[#0D0D0B]"}`}
              >
                {t.sub}
              </div>
              <div
                className={`font-[family-name:var(--font-dx-mono)] text-[2rem] font-medium tracking-tight ${t.featured ? "text-white" : "text-[#0D0D0B]"}`}
              >
                {t.price}
              </div>
              <DxCaps className={`mb-6 text-[7px] ${t.featured ? "text-white/40" : ""}`}>
                {t.note}
              </DxCaps>
              <ul className="mb-7 flex flex-col gap-2">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className={`flex gap-2 text-sm ${t.featured ? "text-white/75" : "text-[#2C2C28]"}`}
                  >
                    <span
                      className={`mt-2 h-px w-2.5 shrink-0 ${t.featured ? "bg-[#3D9660]" : "bg-[#1C4A2E]"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              {t.featured ? (
                <Link
                  href={t.href}
                  className="flex w-full items-center justify-center border-[1.5px] border-white bg-white px-5 py-2.5 font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.12em] text-[#1C4A2E]"
                >
                  {t.cta}
                </Link>
              ) : (
                <DxButtonLink href={t.href} variant="ghost" className="w-full">
                  {t.cta}
                </DxButtonLink>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingCta() {
  return (
    <section className="bg-[#0D0D0B] px-6 py-24 text-center md:px-11">
      <DxCaps className="mb-3.5 text-[#3D9660]">Get Started Today</DxCaps>
      <h2 className={`${dxClass.display} mb-3 text-4xl leading-none text-white md:text-6xl`}>
        Ready to deliver like an
        <br />
        <em className="text-[#3D9660] not-italic">intelligent</em> organisation?
      </h2>
      <p className="mb-10 text-base font-light text-white/40">
        30-day free trial. No credit card. Setup in 15 minutes.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/signup"
          className="border-none bg-white px-8 py-3 font-[family-name:var(--font-dx-mono)] text-xs uppercase tracking-[0.12em] text-[#1C4A2E]"
        >
          Start Free Trial
        </Link>
        <Link
          href="/login"
          className="border-[1.5px] border-white/25 bg-transparent px-6 py-3 font-[family-name:var(--font-dx-mono)] text-xs uppercase tracking-[0.12em] text-white"
        >
          Sign In
        </Link>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] bg-[#1A1A17] px-6 py-7 md:px-11">
      <DxCaps className="text-[7px] text-white/20">© 2026 DeliverX Ltd. All rights reserved.</DxCaps>
      <div className="flex gap-5">
        {["Privacy", "Terms", "Security"].map((l) => (
          <Link key={l} href="#" className={`${dxClass.caps} text-[7px] text-white/25`}>
            {l}
          </Link>
        ))}
      </div>
    </footer>
  );
}
