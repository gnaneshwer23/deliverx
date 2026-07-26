import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  skuFromPriceId,
  type BillingEnv,
  type ProductSku,
} from "@/lib/billing/catalog";
import {
  grantEntitlementsForSku,
  revokeEntitlementsForSubscription,
  subscriptionStatusIsActive,
} from "@/lib/billing/entitlements";
import { getStripe } from "@/lib/billing/stripe";

type DbClient = SupabaseClient;

export type WebhookProcessResult = {
  ok: boolean;
  duplicate?: boolean;
  status: "processed" | "ignored" | "failed";
  summary: string;
  errorMessage?: string;
};

function digestPayload(rawBody: string): string {
  // Lightweight integrity marker — not a cryptographic claim for auth.
  let hash = 0;
  for (let i = 0; i < rawBody.length; i += 1) {
    hash = (hash * 31 + rawBody.charCodeAt(i)) | 0;
  }
  return `djb2:${hash.toString(16)}:len:${rawBody.length}`;
}

export function constructStripeEvent(
  rawBody: string,
  signature: string | null,
  env: BillingEnv = process.env as BillingEnv,
): Stripe.Event {
  const secret = env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  if (!signature) {
    throw new Error("Missing Stripe-Signature header");
  }
  const stripe = getStripe(env);
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

async function findUserIdForCustomer(
  admin: DbClient,
  stripeCustomerId: string,
  metadataUserId?: string | null,
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  const { data } = await admin
    .from("billing_customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  return data ? String(data.user_id) : null;
}

async function upsertSubscriptionRow(
  admin: DbClient,
  input: {
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    productSku: ProductSku;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  },
): Promise<string> {
  const { data: customer, error: custErr } = await admin
    .from("billing_customers")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (custErr) throw custErr;

  let customerId = customer ? String(customer.id) : null;
  if (!customerId) {
    const { data: inserted, error: insErr } = await admin
      .from("billing_customers")
      .insert({
        user_id: input.userId,
        stripe_customer_id: input.stripeCustomerId,
      })
      .select("id")
      .single();
    if (insErr) throw insErr;
    customerId = String(inserted.id);
  }

  const { data: existing } = await admin
    .from("billing_subscriptions")
    .select("id")
    .eq("stripe_subscription_id", input.stripeSubscriptionId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("billing_subscriptions")
      .update({
        stripe_price_id: input.stripePriceId,
        product_sku: input.productSku,
        status: input.status,
        current_period_end: input.currentPeriodEnd,
        cancel_at_period_end: input.cancelAtPeriodEnd,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return String(existing.id);
  }

  const { data: created, error } = await admin
    .from("billing_subscriptions")
    .insert({
      user_id: input.userId,
      customer_id: customerId,
      stripe_subscription_id: input.stripeSubscriptionId,
      stripe_price_id: input.stripePriceId,
      product_sku: input.productSku,
      status: input.status,
      current_period_end: input.currentPeriodEnd,
      cancel_at_period_end: input.cancelAtPeriodEnd,
    })
    .select("id")
    .single();
  if (error) throw error;
  return String(created.id);
}

function priceIdFromSubscription(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

function periodEndIso(sub: Stripe.Subscription): string | null {
  const end = sub.items?.data?.[0]?.current_period_end;
  if (!end) return null;
  return new Date(end * 1000).toISOString();
}

async function syncSubscriptionEntitlements(
  admin: DbClient,
  env: BillingEnv,
  sub: Stripe.Subscription,
): Promise<string> {
  const stripeCustomerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const metaUserId = sub.metadata?.deliverx_user_id?.trim() || null;
  const userId = await findUserIdForCustomer(admin, stripeCustomerId, metaUserId);
  if (!userId) {
    return `ignored: no user for customer ${stripeCustomerId}`;
  }

  const priceId = priceIdFromSubscription(sub);
  if (!priceId) return "ignored: subscription missing price";

  const metaSku = sub.metadata?.deliverx_sku?.trim() as ProductSku | undefined;
  const sku =
    (metaSku && ["experience", "launchpad", "professional"].includes(metaSku)
      ? metaSku
      : null) ?? skuFromPriceId(priceId, env);
  if (!sku) return `ignored: unmapped price ${priceId}`;

  const subRowId = await upsertSubscriptionRow(admin, {
    userId,
    stripeCustomerId,
    stripeSubscriptionId: sub.id,
    stripePriceId: priceId,
    productSku: sku,
    status: sub.status,
    currentPeriodEnd: periodEndIso(sub),
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
  });

  if (subscriptionStatusIsActive(sub.status)) {
    await grantEntitlementsForSku(admin, {
      userId,
      sku,
      source: "stripe_subscription",
      subscriptionId: subRowId,
      expiresAt: periodEndIso(sub),
    });
    return `granted ${sku} for user ${userId} (${sub.status})`;
  }

  const revoked = await revokeEntitlementsForSubscription(admin, {
    userId,
    subscriptionId: subRowId,
  });
  return `revoked ${revoked} entitlements for ${sub.id} (${sub.status})`;
}

async function handleCheckoutCompleted(
  admin: DbClient,
  env: BillingEnv,
  session: Stripe.Checkout.Session,
): Promise<string> {
  if (session.mode !== "subscription") {
    return "ignored: non-subscription checkout";
  }
  const subRef = session.subscription;
  if (!subRef) return "ignored: checkout missing subscription";

  const stripe = getStripe(env);
  const subId = typeof subRef === "string" ? subRef : subRef.id;
  const sub = await stripe.subscriptions.retrieve(subId);
  // Ensure metadata from session lands on subscription if Stripe omitted it.
  if (!sub.metadata?.deliverx_user_id && session.metadata?.deliverx_user_id) {
    await stripe.subscriptions.update(subId, {
      metadata: {
        deliverx_user_id: session.metadata.deliverx_user_id,
        deliverx_sku: session.metadata.deliverx_sku ?? "",
      },
    });
    const refreshed = await stripe.subscriptions.retrieve(subId);
    return syncSubscriptionEntitlements(admin, env, refreshed);
  }
  return syncSubscriptionEntitlements(admin, env, sub);
}

export async function processStripeWebhookEvent(input: {
  admin: DbClient;
  event: Stripe.Event;
  rawBody: string;
  env?: BillingEnv;
}): Promise<WebhookProcessResult> {
  const env = input.env ?? (process.env as BillingEnv);
  const admin = input.admin;
  const event = input.event;

  const { data: prior } = await admin
    .from("billing_webhook_events")
    .select("id, processing_status, result_summary")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (prior) {
    return {
      ok: true,
      duplicate: true,
      status: prior.processing_status as WebhookProcessResult["status"],
      summary: String(prior.result_summary ?? "duplicate"),
    };
  }

  let status: WebhookProcessResult["status"] = "processed";
  let summary = "";
  let errorMessage: string | undefined;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        summary = await handleCheckoutCompleted(
          admin,
          env,
          event.data.object as Stripe.Checkout.Session,
        );
        if (summary.startsWith("ignored:")) status = "ignored";
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        summary = await syncSubscriptionEntitlements(
          admin,
          env,
          event.data.object as Stripe.Subscription,
        );
        if (summary.startsWith("ignored:")) status = "ignored";
        break;
      }
      default: {
        status = "ignored";
        summary = `ignored: unhandled type ${event.type}`;
      }
    }
  } catch (err) {
    status = "failed";
    errorMessage = err instanceof Error ? err.message : "webhook handler failed";
    summary = "failed";
  }

  const { error: insertErr } = await admin.from("billing_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    livemode: Boolean(event.livemode),
    processing_status: status,
    result_summary: summary,
    payload_digest: digestPayload(input.rawBody),
    error_message: errorMessage ?? null,
  });

  // Unique violation = concurrent duplicate — treat as success idempotent.
  if (insertErr) {
    if (insertErr.code === "23505") {
      return {
        ok: true,
        duplicate: true,
        status: "processed",
        summary: "duplicate concurrent insert",
      };
    }
    throw insertErr;
  }

  return {
    ok: status !== "failed",
    status,
    summary,
    errorMessage,
  };
}
