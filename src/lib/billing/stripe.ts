import "server-only";
import Stripe from "stripe";
import type { BillingEnv } from "@/lib/billing/catalog";
import { isBillingConfigured } from "@/lib/billing/catalog";

let stripeSingleton: Stripe | null = null;

export function getStripe(env: BillingEnv = process.env as BillingEnv): Stripe {
  if (!isBillingConfigured(env)) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY!.trim(), {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }
  return stripeSingleton;
}

/** Test helper — reset singleton between suite runs. */
export function resetStripeSingletonForTests(): void {
  stripeSingleton = null;
}

export function appBaseUrl(env: BillingEnv = process.env as BillingEnv): string {
  const raw = env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
