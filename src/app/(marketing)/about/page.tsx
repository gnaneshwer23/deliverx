import type { Metadata } from "next";
import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { MarketingReveal } from "@/components/marketing/marketing-reveal";
import {
  CAREER_PROGRESSION_LINE,
  COMPANY_MISSION,
  COMPANY_POSITIONING,
  PILOT_ACCESS_CADENCE,
} from "@/lib/marketing/career-suite";
import { mktClass } from "@/lib/marketing/landing-theme";

export const metadata: Metadata = {
  title: "About DeliverX | Evidence-driven professional growth",
  description:
    "DeliverX is an AI Product Experience Company. We help Product Managers build practical experience, package evidence into career opportunities, and succeed in real delivery — without treating courses or AI drafts as verified capability.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About DeliverX | Evidence-driven professional growth",
    description: COMPANY_MISSION,
  },
};

const PRINCIPLES = [
  {
    title: "Evidence before claims",
    body: "Self-declared skills and course certificates are not enough. Capability judgements rest on work you actually did — artefacts, decisions, and outcomes recorded with provenance.",
  },
  {
    title: "Observation is not evidence",
    body: "AI may coach, observe, and draft. Observations stay labelled and do not become verified evidence automatically. Observation consent defaults off.",
  },
  {
    title: "Learning is not capability",
    body: "Completing a learning path shows exposure. It does not assign competency levels or light a Verified badge. Judgement happens through the Capability Engine when evidence warrants it.",
  },
  {
    title: "Verified means attestation",
    body: "deliverxVerified is not a score and not lit by assessment alone. It requires external attestation: someone who can confirm what you demonstrated.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <main id="main-content">
        <MarketingSection
          tone="cream"
          className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
        >
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <p className={mktClass.label}>About</p>
              <h1 className={`mt-4 ${mktClass.sectionTitle}`}>DeliverX</h1>
              <p className="mt-3 text-[0.875rem] font-medium text-[var(--mkt-green)]">
                {COMPANY_POSITIONING}
              </p>
              <p className="mt-6 text-[1.0625rem] leading-[1.75] text-[var(--mkt-text1)]">
                {COMPANY_MISSION}
              </p>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                {CAREER_PROGRESSION_LINE}
              </p>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Why we exist
              </h2>
              <div className="mt-6 space-y-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                <p>
                  Professional development is fragmented. Learning platforms teach. Recruitment
                  platforms match keywords. Portfolio tools showcase. Performance tools review.
                  Rarely do they share one honest record of what someone has actually demonstrated.
                </p>
                <p>
                  DeliverX exists to close that gap for Product Managers first. Instead of asking
                  only “Can this person do the job?”, we organise around a harder, more useful
                  question: what has this person consistently demonstrated, how have they grown, and
                  what is the most credible next step?
                </p>
                <p>
                  We are building an evidence-driven professional growth platform — not a job board,
                  not an employer marketplace, and not a generic AI chat. The platform starts with
                  Product Managers in a limited pilot, with room to extend the same model to
                  neighbouring roles when the evidence loop is solid.
                </p>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="cream">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                How the products connect
              </h2>
              <p className="mt-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                Everything either generates Professional Intelligence or consumes it. Three
                connected products sit on that shared record:
              </p>
              <ul className="mt-8 space-y-5">
                <li className={`${mktClass.softPanelLight} p-6`}>
                  <h3 className={`text-[1.15rem] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    Experience
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    Build practical product work inside seeded AI company environments — discovery,
                    strategy, artefacts, and feedback that can feed an evidence ledger. AI coaches
                    draft; you decide what to submit.
                  </p>
                  <Link
                    href="/experience"
                    className="mt-4 inline-block text-[0.8125rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                  >
                    Explore Experience
                  </Link>
                </li>
                <li className={`${mktClass.softPanelLight} p-6`}>
                  <h3 className={`text-[1.15rem] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    Launchpad
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    Turn demonstrated work into career packaging: readiness with labelled sources,
                    evidence-backed CV and portfolio views, STAR interview practice, and application
                    tracking — without inventing scores you cannot explain.
                  </p>
                  <Link
                    href="/launchpad"
                    className="mt-4 inline-block text-[0.8125rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                  >
                    Explore Launchpad
                  </Link>
                </li>
                <li className={`${mktClass.softPanelLight} p-6`}>
                  <h3 className={`text-[1.15rem] text-[var(--mkt-text1)] ${mktClass.serif}`}>
                    Professional Workspace
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                    Deliver with role-based AI teammates on meetings, tasks, artefacts, and
                    decisions. Team Copilot is the product alias for this workspace — not a separate
                    third SKU under the current charter.
                  </p>
                  <Link
                    href="/professional-workspace"
                    className="mt-4 inline-block text-[0.8125rem] font-medium text-[var(--mkt-green)] no-underline underline-offset-4 hover:underline"
                  >
                    Explore Professional Workspace
                  </Link>
                </li>
              </ul>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="white">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Trust rails we will not blur
              </h2>
              <p className="mt-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                Calm professional growth depends on clear language. These boundaries stay fixed even
                when marketing copy gets longer:
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {PRINCIPLES.map((item) => (
                  <li key={item.title} className={`${mktClass.softPanelLight} p-5`}>
                    <h3 className="text-[0.9375rem] font-semibold text-[var(--mkt-text1)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--mkt-text2)]">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>

        <MarketingSection tone="cream">
          <MarketingContainer className="max-w-2xl">
            <MarketingReveal>
              <h2
                className={`text-[clamp(1.35rem,2.5vw,1.75rem)] tracking-[-0.025em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Pilot posture
              </h2>
              <div className="mt-6 space-y-5 text-[0.9375rem] leading-[1.75] text-[var(--mkt-text2)]">
                <p>
                  DeliverX is in an open pilot. Access labels reflect that honesty:{" "}
                  {PILOT_ACCESS_CADENCE}. Paid checkout appears only when Stripe is fully configured;
                  until then we do not present live purchase prices as if payments were live.
                </p>
                <p>
                  We do not run an employer marketplace or promise placement outcomes. Career tools
                  help you package and pursue opportunities you choose — grounded in your evidence
                  record, not in keyword matching theatre.
                </p>
                <p>
                  Privacy is built in: evidence is private by default, observation consent starts
                  off, and people can export or delete their Professional Intelligence data from
                  settings when they need to leave.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <MarketingButtonLink href="/how-it-works" variant="primary">
                  How it works
                </MarketingButtonLink>
                <MarketingButtonLink href="/resources" variant="ghostLg">
                  Resources
                </MarketingButtonLink>
                <MarketingButtonLink href="/pricing" variant="ghostLg">
                  See pilot access
                </MarketingButtonLink>
              </div>
            </MarketingReveal>
          </MarketingContainer>
        </MarketingSection>
      </main>
      <MarketingFooter
        cta={{
          title: "Get started",
          subtitle:
            "Experience, Launchpad and Professional Workspace: one professional growth platform.",
          href: "/signup",
          label: "Start Free",
        }}
      />
    </>
  );
}
