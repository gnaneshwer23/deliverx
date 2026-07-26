import Link from "next/link";
import {
  MarketingContainer,
} from "@/components/marketing/marketing-layout";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata = {
  title: "Privacy Policy — DeliverX",
  description:
    "Interim pilot privacy policy describing how DeliverX handles Professional Intelligence data, consent, evidence, export and delete.",
};

const sections = [
  {
    title: "1. Interim policy status",
    body: [
      "This is an interim privacy policy for the DeliverX open pilot. It describes practices that are implemented in the product today. It is not a claim of formal GDPR certification, ISO certification, or completed legal counsel review. We will replace or extend this policy when commercial packaging ships or when counsel provides a full draft.",
      "Privacy requests and questions: privacy@deliverx.dev",
    ],
  },
  {
    title: "2. Who we are",
    body: [
      "DeliverX Ltd operates the DeliverX platform (including Experience, Launchpad / Career Intelligence, Professional Workspace, and Professional Intelligence surfaces) at deliverx.dev and related subdomains.",
    ],
  },
  {
    title: "3. What we collect",
    body: [
      "Account data: email, name and authentication records via Supabase Auth when you create an account.",
      "Professional Intelligence (PI) data you create or generate: profile and career goals, evidence ledger entries, artefacts and versions, capability assessments (ScoreRuns) produced by the Capability Engine, SnapshotClaims, Experience planner activity, learning items, real-world outcome notes, Verified Portfolio entries, and related review or notification records.",
      "Workspace and delivery data when you use Professional Workspace: projects, meetings, tasks, decisions, risks, contributions and similar operational records tied to your organisation membership.",
      "Attestation data when you request external verification: attestor contact details and attestation confirm/dispute outcomes for a specific portfolio claim.",
      "Technical logs needed to operate the service (for example request metadata and AI interaction records used for orchestration trust and cost observability).",
    ],
  },
  {
    title: "4. How we use data",
    body: [
      "To provide the product you signed up for — including evidence tracking, capability scoring via the Capability Engine, career readiness views, portfolio packaging and workspace collaboration.",
      "To enforce trust rails: append-only evidence transitions, Capability Engine–only assessment writes, and Verified badges that require independent attestation.",
      "To send in-product notifications about review, intervention or privacy actions you take.",
      "AI features draft suggestions and observations. AI-generated observations are not automatically treated as verified evidence. Consequential changes require human approval where the product enforces that rule.",
    ],
  },
  {
    title: "5. Observation consent (default OFF)",
    body: [
      "Continuous Workspace observation and related coach interventions require explicit consent. If no consent record exists, observation is denied. Observation is not evidence and does not assign capability.",
    ],
  },
  {
    title: "6. Sharing and attestation",
    body: [
      "Evidence is private by default. Public or share-token portfolio views exclude private and confidential evidence and do not expose attestor personal data.",
      "When you request attestation, we share a limited claim summary with the named attestor via a tokenised link so they can confirm or dispute that claim. Self-attestation of your own claim is rejected.",
      "We do not sell personal data. We do not operate an employer marketplace that lists your profile for hire in this pilot.",
    ],
  },
  {
    title: "7. Processors and hosting",
    body: [
      "We use infrastructure providers to run the product, including Supabase (authentication and PostgreSQL) and Vercel (application hosting). On production deploys we may load Vercel Web Analytics and Speed Insights for aggregate product usage — see the Cookies page. We do not use those signals as Professional Intelligence capability truth.",
    ],
  },
  {
    title: "8. Export and delete",
    body: [
      "Signed-in users can export their person PI data and request deletion from account privacy controls (T1). Deletion uses a privileged purge path that removes person PI rows while preserving append-only ledger integrity rules where applicable. Organisation or shared project records may remain where other members still need them.",
    ],
  },
  {
    title: "9. Retention",
    body: [
      "We retain account and PI data while your account is active and as needed to operate the pilot, meet security obligations, and honour export/delete requests. After a successful delete request, person PI data covered by the purge path is removed from the production database.",
    ],
  },
  {
    title: "10. Your choices",
    body: [
      "You may update profile information in product settings, withhold observation consent, avoid requesting attestation, and use export/delete controls. For other privacy requests, email privacy@deliverx.dev.",
    ],
  },
  {
    title: "11. Changes",
    body: [
      "We will update this page when practices change materially. Continued use of the pilot after a published change means you should review the updated text.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <main id="main-content" className="pt-[calc(var(--mkt-navh)+64px)] pb-24">
        <MarketingContainer className="max-w-2xl">
          <p className="font-[family-name:var(--font-mkt-mono)] text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[var(--mkt-text3)]">
            DeliverX Ltd · Legal · Interim pilot policy
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-dx-display)] text-[clamp(2rem,4vw,2.75rem)] tracking-[-0.03em] text-[var(--mkt-text1)]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-[0.8125rem] text-[var(--mkt-text3)]">
            Effective for the open pilot · Last updated 25 July 2026 · Marker: interim-pilot-privacy
          </p>
          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-[family-name:var(--font-dx-display)] text-xl tracking-[-0.02em] text-[var(--mkt-text1)]">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                  {section.body.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-12 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            Related:{" "}
            <Link href="/terms" className="text-[var(--mkt-green-l)] underline-offset-2 hover:underline">
              Terms
            </Link>
            {" · "}
            <Link href="/cookies" className="text-[var(--mkt-green-l)] underline-offset-2 hover:underline">
              Cookies
            </Link>
          </p>
          <Link
            href="/"
            className="mt-8 inline-block text-sm text-[var(--mkt-text3)] no-underline transition hover:text-[var(--mkt-text1)]"
          >
            ← Back to home
          </Link>
        </MarketingContainer>
      </main>
      <MarketingFooter />
    </>
  );
}
