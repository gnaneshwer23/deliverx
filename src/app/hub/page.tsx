import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingPageShell,
  MarketingSection,
} from "@/components/marketing/marketing-layout";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { mktClass } from "@/lib/marketing/landing-theme";
import { marketingFontClassName, mktSans } from "@/lib/marketing/marketing-fonts";
import { createClient } from "@/lib/supabase/server";
import { parseSuiteProduct, productDisplayName } from "@/lib/marketing/product-intent";

export const metadata: Metadata = {
  title: "DeliverX Hub",
  description: "Your DeliverX journey — Experience, Career and Team in one place.",
};

export const dynamic = "force-dynamic";

const HUB_JOURNEY = [
  {
    id: "experience",
    stage: "Build the experience",
    name: "Experience",
    progress: "Continue your journey",
    href: "/experience/app",
    cta: "Open Experience",
  },
  {
    id: "evidence",
    stage: "See what you demonstrated",
    name: "Evidence & ScoreRun",
    progress: "Ledger evidence → capability projection",
    href: "/workspace/evidence",
    cta: "Open Evidence",
  },
  {
    id: "career",
    stage: "Land the opportunity",
    name: "Launchpad",
    progress: "Career Intelligence — evidence-backed readiness",
    href: "/launchpad/app",
    cta: "Open Career Intelligence",
  },
  {
    id: "portfolio",
    stage: "Evidence-linked record",
    name: "Verified Portfolio",
    progress: "Package claims with evidence",
    href: "/portfolio",
    cta: "Open Portfolio",
  },
  {
    id: "team",
    stage: "Succeed in the role",
    name: "Professional Workspace",
    progress: "Continue your journey",
    href: "/workspace",
    onboardingHref: "/onboarding/organisation",
    cta: "Open Workspace",
  },
] as const;

function displayNameFromUser(meta: Record<string, unknown> | undefined, email: string | undefined) {
  const name =
    (typeof meta?.name === "string" && meta.name.trim()) ||
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    null;
  if (name) return name.split(/\s+/)[0] ?? name;
  if (email) return email.split("@")[0] ?? "there";
  return "there";
}

export default async function HubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/hub")}`);
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const firstName = displayNameFromUser(meta, user.email);
  const product = parseSuiteProduct(typeof meta?.product === "string" ? meta.product : null);

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("id", user.id)
    .maybeSingle();

  const hasOrg = Boolean(profile?.organisation_id);

  return (
    <div className={`${marketingFontClassName} ${mktSans.className}`}>
      <MarketingPageShell>
        <header className="flex h-[var(--mkt-navh)] items-center justify-between border-b border-[var(--mkt-border)] px-5 md:px-10 lg:px-12">
          <MarketingLogo href="/hub" />
          <div className="flex items-center gap-3">
            <span className="hidden text-[0.8125rem] text-[var(--mkt-text3)] sm:inline">
              DeliverX Hub
            </span>
            <MarketingButtonLink href="/pricing" variant="ghost">
              Pricing
            </MarketingButtonLink>
          </div>
        </header>

        <main id="main-content">
          <MarketingSection
            tone="cream"
            className="!pt-12 md:!pt-16"
          >
            <MarketingContainer className="max-w-2xl">
              <p className={mktClass.label}>DeliverX Hub</p>
              <h1
                className={`mt-4 text-[clamp(2rem,5vw,3rem)] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
              >
                Welcome back, {firstName}.
              </h1>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
                Build the experience → Land the opportunity → Succeed in the role. Pick up any stage
                of your journey.
              </p>
              {product ? (
                <p className="mt-3 text-[0.8125rem] text-[var(--mkt-text3)]">
                  Signed up for{" "}
                  <span className="text-[var(--mkt-text2)]">
                    {productDisplayName(product)}
                  </span>
                  .
                </p>
              ) : null}
            </MarketingContainer>
          </MarketingSection>

          <MarketingSection tone="white">
            <MarketingContainer>
              <ul>
                {HUB_JOURNEY.map((item, index) => {
                  const href =
                    item.id === "team"
                      ? hasOrg
                        ? item.href
                        : item.onboardingHref
                      : item.href;

                  return (
                    <li key={item.id}>
                      <Link
                        href={href}
                        className="mkt-product-row group grid gap-4 border-t border-[var(--mkt-border)] py-10 no-underline md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12"
                      >
                        <div>
                          <p className={`${mktClass.label} text-[var(--mkt-green)]`}>
                            {String(index + 1).padStart(2, "0")} · {item.stage}
                          </p>
                          <h2
                            className={`mt-3 text-[clamp(1.75rem,3.5vw,2.25rem)] tracking-[-0.03em] text-[var(--mkt-text1)] transition-colors group-hover:text-[var(--mkt-green)] ${mktClass.serif}`}
                          >
                            {item.name}
                          </h2>
                          <p className="mt-2 text-[0.875rem] text-[var(--mkt-text3)]">
                            {item.progress}
                          </p>
                        </div>
                        <span className="text-[0.875rem] font-medium text-[var(--mkt-green)] transition-transform group-hover:translate-x-1">
                          {item.cta} →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </MarketingContainer>
          </MarketingSection>
        </main>
      </MarketingPageShell>
    </div>
  );
}
