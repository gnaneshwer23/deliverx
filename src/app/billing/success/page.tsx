import Link from "next/link";
import type { Metadata } from "next";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer, MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { mktClass } from "@/lib/marketing/landing-theme";
import { productBySku, type ProductSku } from "@/lib/billing/catalog";

export const metadata: Metadata = {
  title: "Checkout complete | DeliverX",
  description: "Your DeliverX subscription checkout completed.",
};

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string }>;
}) {
  const params = await searchParams;
  let productName = "DeliverX";
  try {
    if (params.sku) productName = productBySku(params.sku as ProductSku).name;
  } catch {
    /* keep default */
  }

  return (
    <MarketingPageShell>
      <MarketingNav />
      <main id="main-content" className="pt-[calc(var(--mkt-navh)+72px)] pb-24">
        <MarketingContainer className="max-w-xl text-center">
          <p className={mktClass.label}>Billing</p>
          <h1
            className={`mt-4 text-[clamp(1.75rem,4vw,2.5rem)] tracking-[-0.03em] text-[var(--mkt-text1)] ${mktClass.serif}`}
          >
            Checkout received
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
            Thanks — Stripe is confirming your {productName} subscription. Access unlocks
            once the webhook grants your entitlement (usually within a few seconds).
          </p>
          <p className="mt-3 text-[0.8125rem] text-[var(--mkt-text3)]">
            There is no money-back guarantee. Manage or cancel anytime via the customer portal
            in Settings → Billing.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <MarketingButtonLink href="/settings/billing" variant="primary">
              View billing
            </MarketingButtonLink>
            <Link
              href="/hub"
              className="text-[0.875rem] font-medium text-[var(--mkt-green)] underline-offset-4 hover:underline"
            >
              Go to Hub
            </Link>
          </div>
        </MarketingContainer>
      </main>
    </MarketingPageShell>
  );
}
