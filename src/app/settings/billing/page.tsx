import { createClient } from "@/lib/supabase/server";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { SettingsNav } from "@/components/settings/settings-nav";
import { BillingPortalButton } from "@/components/settings/billing-portal-button";
import { isOrgAdmin } from "@/lib/org-admin";
import { hasDeveloperAccess } from "@/lib/developer-access";
import {
  BILLING_PRODUCTS,
  isBillingConfigured,
  isBillingEnforceOn,
  isCheckoutReady,
  listActiveEntitlements,
} from "@/lib/billing";
import { dxClass } from "@/lib/dx-theme";
import Link from "next/link";

export default async function BillingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .single();

  const admin = isOrgAdmin(profile?.role);
  const developer = hasDeveloperAccess(profile?.role, user);
  const entitlements = user
    ? await listActiveEntitlements(supabase, user.id).catch(() => [])
    : [];
  const checkoutReady = isCheckoutReady();
  const configured = isBillingConfigured();
  const enforce = isBillingEnforceOn();

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Settings"
        title="Billing"
        titleEm="& entitlements"
      />
      <div className="space-y-6 p-6 md:p-8">
        <SettingsNav isAdmin={admin} isDeveloper={developer} />

        <section className={dxClass.cardPad}>
          <h2 className="mb-2 font-semibold">Active entitlements</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Access is granted by Stripe subscription webhooks. Cards are handled by
            Stripe — DeliverX never stores full card numbers. Enforcement mode:{" "}
            <strong>{enforce ? "on" : "off"}</strong>
            {enforce
              ? " (Experience and Launchpad apps require an active entitlement)."
              : " (products remain open until DELIVERX_BILLING_ENFORCE=on)."}
          </p>
          {entitlements.length === 0 ? (
            <p className="text-sm text-[#6B6B64]">No active paid entitlements yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {entitlements.map((e) => (
                <li key={e.id} className="flex justify-between gap-4 border-b border-[#E4E4DC] py-2">
                  <span className="font-medium capitalize">{e.productSku}</span>
                  <span className="text-[#6B6B64]">{e.source.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={dxClass.cardPad}>
          <h2 className="mb-2 font-semibold">Plans</h2>
          <ul className="mb-4 space-y-3 text-sm">
            {BILLING_PRODUCTS.map((p) => (
              <li key={p.sku} className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-[#6B6B64]">{p.summary}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {checkoutReady ? `${p.displayPrice} ${p.cadence}` : "Checkout pending config"}
                  </p>
                  {checkoutReady ? (
                    <Link
                      href={`/billing/checkout?sku=${p.sku}`}
                      className="text-[#1C4A2E] underline-offset-2 hover:underline"
                    >
                      Start checkout
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm text-[#6B6B64]">
            Professional Workspace is not a separate paid SKU — it is included with Complete
            Journey. There is no money-back guarantee.
          </p>
        </section>

        <section className={dxClass.cardPad}>
          <h2 className="mb-4 font-semibold">Customer portal</h2>
          <BillingPortalButton enabled={configured} />
        </section>
      </div>
    </>
  );
}
