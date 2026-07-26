import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isCheckoutReady,
  priceIdForSku,
  type BillingEnv,
  type ProductSku,
  productBySku,
} from "@/lib/billing/catalog";
import { appBaseUrl, getStripe } from "@/lib/billing/stripe";

type DbClient = SupabaseClient;

export async function ensureBillingCustomer(
  admin: DbClient,
  input: { userId: string; email?: string | null },
  env: BillingEnv = process.env as BillingEnv,
): Promise<{ id: string; stripeCustomerId: string }> {
  const { data: existing, error: readErr } = await admin
    .from("billing_customers")
    .select("id, stripe_customer_id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (existing) {
    return {
      id: String(existing.id),
      stripeCustomerId: String(existing.stripe_customer_id),
    };
  }

  const stripe = getStripe(env);
  const customer = await stripe.customers.create({
    email: input.email ?? undefined,
    metadata: { deliverx_user_id: input.userId },
  });

  const { data: inserted, error: insertErr } = await admin
    .from("billing_customers")
    .insert({
      user_id: input.userId,
      stripe_customer_id: customer.id,
      email: input.email ?? null,
    })
    .select("id, stripe_customer_id")
    .single();
  if (insertErr) throw insertErr;
  return {
    id: String(inserted.id),
    stripeCustomerId: String(inserted.stripe_customer_id),
  };
}

export async function createCheckoutSession(input: {
  admin: DbClient;
  userId: string;
  email?: string | null;
  sku: ProductSku;
  env?: BillingEnv;
}): Promise<{ url: string; sessionId: string }> {
  const env = input.env ?? (process.env as BillingEnv);
  if (!isCheckoutReady(env)) {
    throw new Error("Checkout is not ready — Stripe price IDs are not configured");
  }
  const priceId = priceIdForSku(input.sku, env);
  if (!priceId) {
    throw new Error(`Missing Stripe price for SKU ${input.sku}`);
  }

  const customer = await ensureBillingCustomer(
    input.admin,
    { userId: input.userId, email: input.email },
    env,
  );
  const stripe = getStripe(env);
  const base = appBaseUrl(env);
  const product = productBySku(input.sku);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/billing/success?sku=${product.sku}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/pricing?checkout=cancelled&sku=${product.sku}`,
    client_reference_id: input.userId,
    metadata: {
      deliverx_user_id: input.userId,
      deliverx_sku: input.sku,
    },
    subscription_data: {
      metadata: {
        deliverx_user_id: input.userId,
        deliverx_sku: input.sku,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session missing URL");
  }
  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(input: {
  admin: DbClient;
  userId: string;
  email?: string | null;
  env?: BillingEnv;
}): Promise<{ url: string }> {
  const env = input.env ?? (process.env as BillingEnv);
  if (!isCheckoutReady(env) && !env.STRIPE_SECRET_KEY?.trim()) {
    throw new Error("Billing portal requires Stripe configuration");
  }
  const customer = await ensureBillingCustomer(
    input.admin,
    { userId: input.userId, email: input.email },
    env,
  );
  const stripe = getStripe(env);
  const base = appBaseUrl(env);
  const portal = await stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: `${base}/settings/billing`,
  });
  return { url: portal.url };
}
