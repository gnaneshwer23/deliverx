import Link from "next/link";
import {
  MarketingContainer,
  MarketingPageShell,
} from "@/components/marketing/marketing-layout";
import { MarketingFooter, MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata = {
  title: "Privacy Policy — DeliverX",
  description: "DeliverX privacy policy.",
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <MarketingNav />
      <main id="main-content" className="pt-[calc(var(--mkt-navh)+48px)] pb-20">
        <MarketingContainer className="max-w-2xl">
          <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
            Legal
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-dx-display)] text-3xl tracking-[-0.02em] text-[var(--mkt-text1)]">
            Privacy Policy
          </h1>
          <p className="mt-6 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            This page is a placeholder while our full privacy policy is being finalised.
            DeliverX is built with GDPR-ready practices and EU data residency in mind.
            For privacy enquiries, contact{" "}
            <a
              href="mailto:privacy@deliverx.dev"
              className="text-[var(--mkt-green-l)] underline-offset-2 hover:underline"
            >
              privacy@deliverx.dev
            </a>
            .
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
