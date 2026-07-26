/**
 * T9 commercial catalog — honest prices only when Stripe checkout is configured.
 * Price IDs live in env (STRIPE_PRICE_*), never hardcoded secrets.
 */

export type ProductSku = "experience" | "launchpad" | "professional";

export type BillingProduct = {
  sku: ProductSku;
  name: string;
  summary: string;
  /** Display price — GBP monthly pilot commercial model. */
  displayPrice: string;
  cadence: string;
  /** Products unlocked by this SKU. */
  grants: readonly ProductSku[];
  envPriceIdKey: string;
};

/** Pilot commercial model (PD-2026-07-26d). */
export const BILLING_PRODUCTS: readonly BillingProduct[] = [
  {
    sku: "experience",
    name: "Experience",
    summary: "Build practical PM experience inside AI company workspaces.",
    displayPrice: "£39",
    cadence: "per month",
    grants: ["experience"],
    envPriceIdKey: "STRIPE_PRICE_EXPERIENCE",
  },
  {
    sku: "launchpad",
    name: "Launchpad",
    summary: "Career Intelligence — readiness, packaging, interview lab, applications.",
    displayPrice: "£39",
    cadence: "per month",
    grants: ["launchpad"],
    envPriceIdKey: "STRIPE_PRICE_LAUNCHPAD",
  },
  {
    sku: "professional",
    name: "Complete Journey",
    summary:
      "Experience + Launchpad + Professional Workspace access in one subscription.",
    displayPrice: "£59",
    cadence: "per month",
    grants: ["experience", "launchpad", "professional"],
    envPriceIdKey: "STRIPE_PRICE_PROFESSIONAL",
  },
] as const;

export const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

export type BillingEnv = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_PRICE_EXPERIENCE?: string;
  STRIPE_PRICE_LAUNCHPAD?: string;
  STRIPE_PRICE_PROFESSIONAL?: string;
  /** When "on", unpaid Experience/Launchpad apps redirect to pricing. Default off. */
  DELIVERX_BILLING_ENFORCE?: string;
  NEXT_PUBLIC_APP_URL?: string;
};

export function isBillingConfigured(env: BillingEnv = process.env as BillingEnv): boolean {
  return Boolean(env.STRIPE_SECRET_KEY?.trim());
}

export function isCheckoutReady(env: BillingEnv = process.env as BillingEnv): boolean {
  if (!isBillingConfigured(env)) return false;
  return BILLING_PRODUCTS.every((p) => Boolean(env[p.envPriceIdKey as keyof BillingEnv]?.trim()));
}

export function isBillingEnforceOn(env: BillingEnv = process.env as BillingEnv): boolean {
  return (env.DELIVERX_BILLING_ENFORCE ?? "").toLowerCase() === "on";
}

export function productBySku(sku: ProductSku): BillingProduct {
  const found = BILLING_PRODUCTS.find((p) => p.sku === sku);
  if (!found) throw new Error(`Unknown product SKU: ${sku}`);
  return found;
}

export function priceIdForSku(
  sku: ProductSku,
  env: BillingEnv = process.env as BillingEnv,
): string | null {
  const product = productBySku(sku);
  const id = env[product.envPriceIdKey as keyof BillingEnv]?.trim();
  return id || null;
}

export function skuFromPriceId(
  priceId: string,
  env: BillingEnv = process.env as BillingEnv,
): ProductSku | null {
  const trimmed = priceId.trim();
  for (const product of BILLING_PRODUCTS) {
    const configured = env[product.envPriceIdKey as keyof BillingEnv]?.trim();
    if (configured && configured === trimmed) return product.sku;
  }
  return null;
}

/** Surfaces gated by commercial entitlement when enforce is on. */
export type GatedProductSurface = "experience" | "launchpad";

export function skusThatUnlock(surface: GatedProductSurface): readonly ProductSku[] {
  if (surface === "experience") return ["experience", "professional"];
  return ["launchpad", "professional"];
}

/**
 * Marketing may show £ prices only when checkout can create a Stripe session.
 * Otherwise fall back to pilot access labels (Batch 2 honesty).
 */
export function marketingPriceForSku(
  sku: ProductSku,
  env: BillingEnv = process.env as BillingEnv,
): { price: string; cadence: string; checkoutReady: boolean } {
  const product = productBySku(sku);
  if (isCheckoutReady(env)) {
    return {
      price: product.displayPrice,
      cadence: product.cadence,
      checkoutReady: true,
    };
  }
  return {
    price: "Pilot access",
    cadence: "Checkout not configured yet",
    checkoutReady: false,
  };
}
