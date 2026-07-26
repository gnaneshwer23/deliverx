export {
  BILLING_PRODUCTS,
  ACTIVE_SUBSCRIPTION_STATUSES,
  isBillingConfigured,
  isCheckoutReady,
  isBillingEnforceOn,
  productBySku,
  priceIdForSku,
  skuFromPriceId,
  skusThatUnlock,
  marketingPriceForSku,
  type ProductSku,
  type BillingProduct,
  type BillingEnv,
  type GatedProductSurface,
} from "@/lib/billing/catalog";

export {
  listActiveEntitlements,
  userHasProductAccess,
  grantEntitlementsForSku,
  revokeEntitlementsForSubscription,
  subscriptionStatusIsActive,
  type EntitlementRecord,
} from "@/lib/billing/entitlements";

export {
  createCheckoutSession,
  createBillingPortalSession,
  ensureBillingCustomer,
} from "@/lib/billing/checkout";

export {
  constructStripeEvent,
  processStripeWebhookEvent,
  type WebhookProcessResult,
} from "@/lib/billing/webhooks";

export {
  requireProductEntitlement,
  assertApiEntitlement,
} from "@/lib/billing/require-entitlement";
