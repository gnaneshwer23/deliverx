import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { LAUNCHPAD_APP_PATH } from "@/lib/launchpad/auth";
import { isBillingEnforceOn } from "@/lib/billing/catalog";
import { mktClass } from "@/lib/marketing/landing-theme";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Welcome to Launchpad | DeliverX",
  description: "Your Launchpad account is ready. Continue into career readiness.",
};

type Search = Promise<{ intent?: string }>;

export default async function StartLaunchpadPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { intent } = await searchParams;
  if (user) {
    const qs = intent ? `?intent=${encodeURIComponent(intent)}` : "";
    redirect(`${LAUNCHPAD_APP_PATH}${qs}`);
  }

  const exploringRoles = intent === "roles";
  const loginNext = exploringRoles
    ? `${LAUNCHPAD_APP_PATH}?intent=roles`
    : LAUNCHPAD_APP_PATH;

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
            Sign in to enter Launchpad.
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            {exploringRoles
              ? "Your account is ready for Launchpad — Land the opportunity. Continue to readiness, evidence packaging and interview prep."
              : "Your account is ready for Launchpad — Land the opportunity. Continue to onboarding and your career readiness workspace."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingButtonLink
              href={`/login?next=${encodeURIComponent(loginNext)}&product=launchpad`}
              variant="primaryLg"
            >
              Continue to Launchpad
            </MarketingButtonLink>
            <MarketingButtonLink href="/launchpad" variant="ghostLg">
              Back to Launchpad
            </MarketingButtonLink>
          </div>
          <p className="mt-6 text-sm text-[var(--mkt-text3)]">
            {isBillingEnforceOn()
              ? "An active Launchpad or Complete Journey entitlement is required."
              : "Pilot access is open; paid entitlement enforcement is currently off."}
          </p>
        </MarketingContainer>
      </MarketingSection>
    </main>
  );
}
