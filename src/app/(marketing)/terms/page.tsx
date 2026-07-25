import Link from "next/link";
import {
  MarketingContainer,
  MarketingPageShell,
} from "@/components/marketing/marketing-layout";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata = {
  title: "Terms of Service — DeliverX",
  description:
    "Interim pilot terms for DeliverX open access — no paid checkout, evidence honesty, and acceptable use.",
};

const sections = [
  {
    title: "1. Interim pilot terms",
    body: [
      "These interim terms apply while DeliverX is offered as an open pilot. They are not a finished commercial contract and do not create a paid subscription. Paid plans, entitlements and refund terms will ship only after founder-approved commercial packaging (T9). For legal enquiries: legal@deliverx.dev",
    ],
  },
  {
    title: "2. The service",
    body: [
      "DeliverX provides Professional Intelligence software spanning Experience, Launchpad (Career Intelligence), Professional Workspace and related tools. Features may change during the pilot. Marketing pages describe shipped surfaces; aspirational modules that are not live are labelled or omitted.",
    ],
  },
  {
    title: "3. Accounts and access",
    body: [
      "You must provide accurate account information and keep credentials secure. Access during the pilot is open subject to reasonable abuse controls and any allowlist gates the operator enables. We may suspend accounts that threaten platform integrity or other users.",
    ],
  },
  {
    title: "4. No purchase during the pilot",
    body: [
      "There is no working paid checkout. Displayed access is pilot access, not a priced purchase. There is no money-back guarantee because there is no payment to refund. Do not rely on historical marketing that showed pound prices or refund language — that copy has been removed.",
    ],
  },
  {
    title: "5. Evidence, capability and Verified",
    body: [
      "Evidence before claims is a product principle. AI drafts are not automatically verified evidence. Capability is written only through the Capability Engine. A DeliverX Verified badge lights only when an independent attestor confirms a specific claim through the attestation path — not from a capability assessment alone, self-report or learning completion.",
      "We do not guarantee interviews, job offers or employer outcomes.",
    ],
  },
  {
    title: "6. Acceptable use",
    body: [
      "You may not attempt to bypass access controls, fabricate verification state outside product paths, harass others, misuse attestation flows, probe other users' private data, or use the service for unlawful activity. Observation of workspace activity requires your consent; do not attempt to coerce observation without consent.",
    ],
  },
  {
    title: "7. Your content",
    body: [
      "You retain rights in content you submit. You grant DeliverX a licence to host, process and display that content as needed to operate the service for you and, where you choose, for share or attestation flows you initiate.",
    ],
  },
  {
    title: "8. Privacy",
    body: [
      "Our interim Privacy Policy explains how we handle personal and Professional Intelligence data, including export/delete and observation consent default OFF. See /privacy and /cookies.",
    ],
  },
  {
    title: "9. Disclaimer",
    body: [
      "The pilot is provided as-is without warranties of uninterrupted availability, fitness for a particular hiring outcome, or completeness of every marketing surface. To the extent permitted by law, DeliverX Ltd is not liable for indirect or consequential losses arising from pilot use.",
    ],
  },
  {
    title: "10. Changes and contact",
    body: [
      "We may update these terms as the pilot evolves. Material commercial terms will be republished before paid packaging launches. Contact: legal@deliverx.dev",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <MarketingNav />
      <main id="main-content" className="pt-[calc(var(--mkt-navh)+64px)] pb-24">
        <MarketingContainer className="max-w-2xl">
          <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--mkt-text3)]">
            DeliverX Ltd · Legal · Interim pilot terms
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-dx-display)] text-[clamp(2rem,4vw,2.75rem)] tracking-[-0.03em] text-[var(--mkt-text1)]">
            Terms of Service
          </h1>
          <p className="mt-4 text-[0.8125rem] text-[var(--mkt-text3)]">
            Effective for the open pilot · Last updated 25 July 2026 · Marker: interim-pilot-terms
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
            <Link href="/privacy" className="text-[var(--mkt-green-l)] underline-offset-2 hover:underline">
              Privacy
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
    </MarketingPageShell>
  );
}
