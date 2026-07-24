import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";
import { createClient } from "@/lib/supabase/server";
import { XPERIENCE_APP_PATH } from "@/lib/xperience/auth";

export const metadata: Metadata = {
  title: "Welcome to Experience | DeliverX",
  description: "Your Experience account is ready. Continue into your company experience.",
};

export default async function StartXperiencePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(XPERIENCE_APP_PATH);
  }

  return (
    <main id="main-content">
      <MarketingSection
        tone="green-tint"
        className="pt-[calc(var(--mkt-navh)+48px)] md:pt-[calc(var(--mkt-navh)+72px)]"
      >
        <MarketingContainer className="max-w-xl">
          <p className={mktClass.label}>Experience · Next step</p>
          <h1
            className={`mt-4 text-[clamp(2rem,5vw,3rem)] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
          >
            Sign in to enter Experience.
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            Your account is ready for Experience — Build the experience. Continue to
            onboarding and your MediFlow company workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingButtonLink
              href={`/login?next=${encodeURIComponent(XPERIENCE_APP_PATH)}&product=xperience`}
              variant="primaryLg"
            >
              Continue to Experience
            </MarketingButtonLink>
            <MarketingButtonLink href="/experience" variant="ghostLg">
              Back to Experience
            </MarketingButtonLink>
          </div>
          <p className="mt-6 text-sm text-[var(--mkt-text3)]">
            {/* TODO(payment): Stripe £500 checkout / entitlement gate */}
            Payment entitlement can be added later — access is open for this build.
          </p>
        </MarketingContainer>
      </MarketingSection>
    </main>
  );
}
