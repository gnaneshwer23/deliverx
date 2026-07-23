import type { Metadata } from "next";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";

export const metadata: Metadata = {
  title: "Welcome to the Complete Career Bundle | DeliverX",
  description:
    "Your DeliverX account is ready for the Complete Career Bundle — Xperience, Launchpad and Team Co-pilot.",
};

export default function StartBundlePage() {
  return (
    <main id="main-content">
      <MarketingSection
        tone="green-tint"
        className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
      >
        <MarketingContainer className="max-w-xl">
          <p className={mktClass.label}>Complete Career Bundle · Next step</p>
          <h1
            className={`mt-4 text-[clamp(2rem,5vw,3rem)] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
          >
            Your path is ready.
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            You&apos;re signed up for the Complete Career Bundle — Experience, Career and Delivery
            for 12 months. Complete payment when prompted to unlock full access.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingButtonLink href="/pricing#bundle" variant="primaryLg">
              Review bundle details
            </MarketingButtonLink>
            <MarketingButtonLink href="/xperience" variant="ghostLg">
              Start with Xperience
            </MarketingButtonLink>
          </div>
          <p className="mt-6 text-sm text-[var(--mkt-text3)]">
            Checkout is the next build step — your account and bundle intent are saved.
          </p>
        </MarketingContainer>
      </MarketingSection>
    </main>
  );
}
