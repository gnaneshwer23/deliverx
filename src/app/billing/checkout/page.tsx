import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createCheckoutSession,
  isCheckoutReady,
  type ProductSku,
} from "@/lib/billing";

const SKUS = new Set(["experience", "launchpad", "professional"]);

/**
 * Server entry for honest checkout CTAs.
 * Requires auth; creates Stripe Checkout session and redirects.
 */
export default async function BillingCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string }>;
}) {
  const params = await searchParams;
  const sku = (params.sku ?? "").trim() as ProductSku;
  if (!SKUS.has(sku)) {
    redirect("/pricing?error=unknown_sku");
  }

  if (!isCheckoutReady()) {
    redirect(`/pricing?error=checkout_not_ready&sku=${sku}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/billing/checkout?sku=${sku}`)}`);
  }

  let url: string;
  try {
    const admin = createAdminClient();
    const session = await createCheckoutSession({
      admin,
      userId: user.id,
      email: user.email,
      sku,
    });
    url = session.url;
  } catch (error) {
    console.error("[billing/checkout page]", error);
    redirect(`/pricing?error=checkout_failed&sku=${sku}`);
  }

  redirect(url);
}
