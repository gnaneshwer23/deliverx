import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import {
  BILLING_PRODUCTS,
  isBillingEnforceOn,
  isCheckoutReady,
  marketingPriceForSku,
  priceIdForSku,
  skuFromPriceId,
  skusThatUnlock,
  type BillingEnv,
} from "@/lib/billing/catalog";
import { subscriptionStatusIsActive } from "@/lib/billing/entitlements";
import { careerTiersForEnv } from "@/lib/marketing/career-suite";

const READY_ENV: BillingEnv = {
  STRIPE_SECRET_KEY: "sk_test_fixture",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture",
  STRIPE_PRICE_EXPERIENCE: "price_exp",
  STRIPE_PRICE_LAUNCHPAD: "price_launch",
  STRIPE_PRICE_PROFESSIONAL: "price_pro",
  DELIVERX_BILLING_ENFORCE: "on",
};

describe("T9 billing catalog", () => {
  it("shows real prices only with a fully wired checkout", () => {
    expect(isCheckoutReady({})).toBe(false);
    expect(marketingPriceForSku("experience", {}).price).toBe("Pilot access");

    expect(isCheckoutReady(READY_ENV)).toBe(true);
    expect(marketingPriceForSku("experience", READY_ENV)).toEqual({
      price: "£39",
      cadence: "per month",
      checkoutReady: true,
    });
    expect(marketingPriceForSku("professional", READY_ENV).price).toBe("£59");
  });

  it("maps price IDs to SKUs and keeps IDs in env", () => {
    expect(priceIdForSku("launchpad", READY_ENV)).toBe("price_launch");
    expect(skuFromPriceId("price_pro", READY_ENV)).toBe("professional");
    expect(skuFromPriceId("price_unknown", READY_ENV)).toBeNull();
    expect(BILLING_PRODUCTS.every((p) => p.envPriceIdKey.startsWith("STRIPE_PRICE_"))).toBe(true);
  });

  it("professional grants the connected journey; workspace is not a separate sale SKU", () => {
    expect(skusThatUnlock("experience")).toEqual(["experience", "professional"]);
    expect(skusThatUnlock("launchpad")).toEqual(["launchpad", "professional"]);
    expect(BILLING_PRODUCTS.map((p) => p.sku)).toEqual([
      "experience",
      "launchpad",
      "professional",
    ]);
  });

  it("gates only when DELIVERX_BILLING_ENFORCE=on", () => {
    expect(isBillingEnforceOn({ DELIVERX_BILLING_ENFORCE: "off" })).toBe(false);
    expect(isBillingEnforceOn(READY_ENV)).toBe(true);
  });

  it("treats active/trialing/past_due as access and revokes terminal states", () => {
    for (const status of ["active", "trialing", "past_due"]) {
      expect(subscriptionStatusIsActive(status), status).toBe(true);
    }
    for (const status of ["canceled", "unpaid", "incomplete_expired", "paused"]) {
      expect(subscriptionStatusIsActive(status), status).toBe(false);
    }
  });
});

describe("T9 marketing honesty", () => {
  it("pairs every real £ price with a working checkout CTA", () => {
    const commercial = careerTiersForEnv(READY_ENV);
    expect(commercial.checkoutReady).toBe(true);
    for (const tier of [...commercial.tiers, commercial.bundle]) {
      if (tier.price.startsWith("£")) {
        expect(tier.checkoutReady).toBe(true);
        expect(tier.cta).toBe("Start checkout");
        expect(tier.ctaHref).toMatch(/^\/billing\/checkout\?sku=/);
      }
    }
  });

  it("falls back to pilot labels when any checkout dependency is missing", () => {
    const incomplete = careerTiersForEnv({
      STRIPE_SECRET_KEY: "sk_test_fixture",
      STRIPE_PRICE_EXPERIENCE: "price_exp",
    });
    expect(incomplete.checkoutReady).toBe(false);
    for (const tier of [...incomplete.tiers, incomplete.bundle]) {
      expect(tier.price).not.toMatch(/^£\d+/);
      expect(tier.cta.toLowerCase()).not.toContain("buy");
    }
  });
});

describe("T9 webhook and schema trust rails", () => {
  it("Stripe signatures reject tampering", () => {
    const stripe = new Stripe("sk_test_fixture");
    const payload = JSON.stringify({ id: "evt_1", object: "event" });
    const header = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: "whsec_fixture",
    });
    expect(() =>
      stripe.webhooks.constructEvent(payload, header, "whsec_fixture"),
    ).not.toThrow();
    expect(() =>
      stripe.webhooks.constructEvent(`${payload}tampered`, header, "whsec_fixture"),
    ).toThrow();
  });

  it("migration has idempotency, owner-read RLS, service writes, and privacy purge", () => {
    const sql = readFileSync(
      new URL("../../../supabase/migrations/0097_stripe_entitlements.sql", import.meta.url),
      "utf8",
    );
    expect(sql).toMatch(/stripe_event_id\s+text not null unique/i);
    expect(sql).toMatch(/billing_entitlements_own_select/i);
    expect(sql).toMatch(/grant all on table public\.billing_webhook_events to service_role/i);
    expect(sql).toMatch(/revoke all on table public\.billing_webhook_events from anon, authenticated/i);
    expect(sql).toMatch(/delete from public\.billing_entitlements where user_id = p_user_id/i);
    expect(sql).toMatch(/set search_path = public/i);
    expect(sql).toMatch(/revoke all on function public\.pi_privacy_purge_person_data\(uuid, uuid\)/i);
    expect(sql).not.toMatch(/\bpan\b.*(text|varchar)/i);
  });
});
