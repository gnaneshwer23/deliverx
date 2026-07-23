import type { Metadata } from "next";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";
export const metadata: Metadata = {
  title: "Welcome to Launchpad | DeliverX",
  description: "Your Launchpad account is ready. Explore open roles and start your company experience.",
};

type Search = Promise<{ intent?: string }>;

export default async function StartLaunchpadPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { intent } = await searchParams;
  const exploringRoles = intent === "roles";

  return (
    <main id="main-content">
      <MarketingSection
        tone="green-tint"
        className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
      >
        <MarketingContainer className="max-w-xl">
          <p className={mktClass.label}>Launchpad · Next step</p>
          <h1
            className={`mt-4 text-[clamp(2rem,5vw,3rem)] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
          >
            {exploringRoles ? "Open roles are next." : "Your account is ready."}
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            {exploringRoles
              ? "You’re signed up for Launchpad. Role listings and company offers will land here — for now, continue from the product page."
              : "You’re signed up for Launchpad. Start free preview or explore open roles when you’re ready."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingButtonLink href="/launchpad#pricing" variant="primaryLg">
              {exploringRoles ? "Explore pricing & roles" : "Continue to Launchpad"}
            </MarketingButtonLink>
            <MarketingButtonLink href="/launchpad" variant="ghostLg">
              Back to Launchpad
            </MarketingButtonLink>
          </div>
          <p className="mt-6 text-sm text-[var(--mkt-text3)]">
            Open-roles workspace is the next build step — your account and intent are saved.
          </p>
        </MarketingContainer>
      </MarketingSection>
    </main>
  );
}
