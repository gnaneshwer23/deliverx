import type { Metadata } from "next";
import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import { COMPANY_MISSION } from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";

export const metadata: Metadata = {
  title: "Resources | PM portfolio, evidence and STAR practice | DeliverX",
  description:
    "Starting points for building a Product Manager portfolio employers can evaluate, packaging evidence and STAR stories, and practising AI product experience — without treating learning as capability.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Resources | PM portfolio, evidence and STAR practice | DeliverX",
    description:
      "Guides and product paths for evidence-backed PM growth: Experience, Launchpad, Professional Workspace, and trust rails.",
  },
};

const PRODUCT_PATHS = [
  {
    title: "Start with Experience",
    body: "Build practical Product Management experience inside seeded AI companies before you apply. Work produces artefacts; you decide what becomes evidence.",
    href: "/experience",
    label: "Explore Experience",
  },
  {
    title: "Prepare with Launchpad",
    body: "Turn experience into interviews with Career Intelligence, evidence-backed CV packaging, portfolio views, and an Interview Lab for STAR practice.",
    href: "/launchpad",
    label: "Explore Launchpad",
  },
  {
    title: "Deliver with Professional Workspace",
    body: "Work with role-based AI teammates on meetings, artefacts, decisions and evidence. Team Copilot is the Workspace alias — not a third SKU. AI drafts; you decide.",
    href: "/professional-workspace",
    label: "Explore Professional Workspace",
  },
  {
    title: "Pilot access & Complete Journey",
    body: "Open pilot access across stages, or explore the full connected path. Purchasable prices appear only when Stripe Checkout is configured.",
    href: "/pricing",
    label: "See pilot access",
  },
] as const;

const GUIDES = [
  {
    id: "portfolio",
    title: "How to build a PM portfolio employers can evaluate",
    body: "A strong Product Manager portfolio is not a gallery of certificates. It is a trail of work: problem framing, decisions, artefacts, and outcomes someone else can inspect. Prefer PRDs, discovery notes, trade-off memos, and delivery records over self-declared skill lists. Label what is self-reported versus demonstrated. DeliverX Experience is designed so completed work can feed that trail; Launchpad packages it for applications without inventing unexplained scores.",
    href: "/launchpad",
    linkLabel: "See Launchpad packaging",
  },
  {
    id: "evidence",
    title: "Evidence vs claims vs learning",
    body: "Knowledge is exposure. Evidence is a provenance-backed record of work. Capability is a judgement over evidence — not a course completion tick. AI observations and coach drafts are assistants, not verified proof. In DeliverX, learning paths never light Verified and never write competency levels. That separation keeps career packaging honest when you talk to hiring managers.",
    href: "/how-it-works",
    linkLabel: "Read how DeliverX works",
  },
  {
    id: "star",
    title: "STAR interview stories grounded in real artefacts",
    body: "STAR works best when Situation, Task, Action, and Result point to something you actually produced. Vague stories collapse under follow-up questions. Build stories from artefacts and decisions in your evidence record, then practise in Launchpad Interview Lab. Avoid fabricating placement outcomes or claiming Verified status without external attestation.",
    href: "/launchpad",
    linkLabel: "Open Launchpad",
  },
  {
    id: "ai-experience",
    title: "AI product experience without theatre",
    body: "Simulated company work can develop judgement when the loop is explicit: realistic challenges, human decisions, and an append-oriented evidence ledger. It is not a shortcut that turns AI chat into a job offer. Observation consent defaults off. Recommendations explain their rationale. Readiness bands say whether they come from assessment, mixed sources, or heuristics — so you always know what you are looking at.",
    href: "/experience",
    linkLabel: "Explore Experience",
  },
  {
    id: "trust",
    title: "What Verified means here",
    body: "deliverxVerified is an attestation signal, not a vanity badge and not the output of a ScoreRun alone. External attestation is the path that can light Verified. Privacy stays least-privilege: evidence private by default, export and delete available for your Professional Intelligence data. We do not sell employer marketplace liquidity in the current pilot.",
    href: "/about",
    linkLabel: "About DeliverX",
  },
] as const;

const QUICK_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pilot access" },
  { href: "/privacy", label: "Privacy" },
] as const;

export default function ResourcesPage() {
  return (
    <>
      <main id="main-content">
        <MarketingSection
          tone="cream"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <p className={mktClass.label}>Resources</p>
              <h1 className={`mt-4 ${mktClass.sectionTitle}`}>
                Evidence-backed starting points.
              </h1>
              <p className="mt-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                Short paths into the DeliverX products, plus charter-honest guides on PM portfolios,
                evidence, STAR practice, and AI product experience. No job-board listings, no
                unexplained readiness percentages, and no claim that finishing a course equals
                capability.
              </p>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white">
          <MarketingContainer>
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Product paths
              </h2>
              <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                Build the experience → land the opportunity → succeed in the role. Pick the stage
                that matches where you are.
              </p>
            </MarketingReveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5">
              {PRODUCT_PATHS.map((item, index) => (
                <li key={item.href}>
                  <MarketingReveal delay={index * 0.04}>
                    <div className={`${mktClass.softPanelLight} flex h-full flex-col p-7 md:p-8`}>
                      <h3
                        className={`text-[1.35rem] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                      >
                        {item.title}
                      </h3>
                      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                        {item.body}
                      </p>
                      <MarketingButtonLink href={item.href} variant="ghost" className="mt-6 self-start">
                        {item.label}
                      </MarketingButtonLink>
                    </div>
                  </MarketingReveal>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="cream">
          <MarketingContainer className="max-w-3xl">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Guides
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                Practical framing aligned to Professional Intelligence. These are orientation guides
                — not placement guarantees or marketplace pitches.
              </p>
            </MarketingReveal>
            <ol className="mt-10 space-y-8">
              {GUIDES.map((guide, index) => (
                <li key={guide.id} id={guide.id}>
                  <MarketingReveal delay={index * 0.03}>
                    <article className={`${mktClass.softPanelLight} p-7 md:p-8`}>
                      <p className={`${mktClass.mono} text-[0.65rem] text-[var(--mkt-green-m)]`}>
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3
                        className={`mt-3 text-[1.25rem] tracking-[-0.02em] text-[var(--mkt-text1)] ${mktClass.serif}`}
                      >
                        {guide.title}
                      </h3>
                      <p className="mt-4 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                        {guide.body}
                      </p>
                      <Link
                        href={guide.href}
                        className="mt-5 inline-block text-[0.8125rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                      >
                        {guide.linkLabel} →
                      </Link>
                    </article>
                  </MarketingReveal>
                </li>
              ))}
            </ol>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Also useful
              </h2>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.9375rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-[0.875rem] leading-relaxed text-[var(--mkt-text3)]">
                Deeper flagship articles (full portfolio walkthroughs, Interview Lab deep dives) will
                land here as the pilot publishes them. Until then, product pages and the guides above
                are the source of truth.
              </p>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>
      <MarketingFooter
        cta={{
          title: "Ready to begin?",
          subtitle: COMPANY_MISSION,
          href: "/signup",
          label: "Start Free",
        }}
      />
    </>
  );
}
