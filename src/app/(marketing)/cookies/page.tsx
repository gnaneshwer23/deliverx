import Link from "next/link";
import {
  MarketingContainer,
} from "@/components/marketing/marketing-layout";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export const metadata = {
  title: "Cookie Policy | How DeliverX uses cookies",
  description:
    "How DeliverX uses cookies and local storage during the open pilot: essential auth and optional Vercel analytics.",
  alternates: { canonical: "/cookies" },
};

const sections = [
  {
    title: "1. Interim cookie notice",
    body: [
      "This page describes cookies and similar storage DeliverX uses in the open pilot. Marker: interim-pilot-cookies. For privacy requests: privacy@deliverx.dev",
    ],
  },
  {
    title: "2. Essential cookies and storage",
    body: [
      "Authentication session cookies and related storage from Supabase Auth are required to keep you signed in and protect account access. Without them, login and authenticated product surfaces cannot work.",
      "The application may also use browser local or session storage for ordinary UI preferences and client session helpers that are necessary for the product to function.",
    ],
  },
  {
    title: "3. Analytics",
    body: [
      "On production deploys (or when explicitly enabled), DeliverX may load Vercel Web Analytics and Speed Insights. These provide aggregate traffic and performance signals. They are not used to invent capability scores or Verified status.",
      "We do not currently operate a separate third-party advertising cookie stack, and we do not show a consent banner for advertising cookies because we are not setting non-essential marketing trackers beyond this minimal production analytics posture.",
      "If we introduce additional non-essential cookies later, we will update this page and add consent controls where required.",
    ],
  },
  {
    title: "4. Your choices",
    body: [
      "You can clear site cookies and storage in your browser. Doing so will sign you out. Browser controls can also limit analytics scripts where supported.",
      "Essential auth cookies cannot be disabled if you want to use signed-in features.",
    ],
  },
  {
    title: "5. Related policies",
    body: [
      "See the interim Privacy Policy for how Professional Intelligence data is handled, and the Terms for pilot access conditions.",
    ],
  },
] as const;

export default function CookiesPage() {
  return (
    <>
      <main id="main-content" className="pt-[calc(var(--mkt-navh)+64px)] pb-24">
        <MarketingContainer className="max-w-2xl">
          <p className="font-[family-name:var(--font-mkt-mono)] text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[var(--mkt-text3)]">
            DeliverX Ltd · Legal · Interim pilot notice
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-dx-display)] text-[clamp(2rem,4vw,2.75rem)] tracking-[-0.03em] text-[var(--mkt-text1)]">
            Cookie Policy
          </h1>
          <p className="mt-4 text-[0.8125rem] text-[var(--mkt-text3)]">
            Effective for the open pilot · Last updated 25 July 2026 · Marker: interim-pilot-cookies
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
            <Link href="/terms" className="text-[var(--mkt-green-l)] underline-offset-2 hover:underline">
              Terms
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
