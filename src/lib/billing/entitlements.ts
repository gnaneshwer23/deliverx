import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  type GatedProductSurface,
  type ProductSku,
  skusThatUnlock,
} from "@/lib/billing/catalog";

export type EntitlementRecord = {
  id: string;
  userId: string;
  productSku: ProductSku;
  source: "stripe_subscription" | "manual_grant" | "complimentary";
  status: "active" | "revoked" | "expired";
  subscriptionId: string | null;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
};

type DbClient = SupabaseClient;

function mapEntitlement(row: Record<string, unknown>): EntitlementRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    productSku: row.product_sku as ProductSku,
    source: row.source as EntitlementRecord["source"],
    status: row.status as EntitlementRecord["status"],
    subscriptionId: (row.subscription_id as string | null) ?? null,
    grantedAt: String(row.granted_at),
    expiresAt: (row.expires_at as string | null) ?? null,
    revokedAt: (row.revoked_at as string | null) ?? null,
  };
}

export async function listActiveEntitlements(
  supabase: DbClient,
  userId: string,
): Promise<EntitlementRecord[]> {
  const { data, error } = await supabase
    .from("billing_entitlements")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []).map((r) => mapEntitlement(r as Record<string, unknown>));
}

export async function userHasProductAccess(
  supabase: DbClient,
  userId: string,
  surface: GatedProductSurface,
): Promise<boolean> {
  const needed = skusThatUnlock(surface);
  const active = await listActiveEntitlements(supabase, userId);
  return active.some((e) => needed.includes(e.productSku));
}

/**
 * Grant (or refresh) entitlements for a purchased SKU.
 * Professional unlocks experience + launchpad + professional rows.
 */
export async function grantEntitlementsForSku(
  admin: DbClient,
  input: {
    userId: string;
    sku: ProductSku;
    source?: EntitlementRecord["source"];
    subscriptionId?: string | null;
    expiresAt?: string | null;
  },
): Promise<EntitlementRecord[]> {
  const grants: ProductSku[] =
    input.sku === "professional"
      ? ["experience", "launchpad", "professional"]
      : [input.sku];

  const results: EntitlementRecord[] = [];
  for (const productSku of grants) {
    // Revoke any prior active row for this sku, then insert fresh.
    await admin
      .from("billing_entitlements")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
      })
      .eq("user_id", input.userId)
      .eq("product_sku", productSku)
      .eq("status", "active");

    const { data, error } = await admin
      .from("billing_entitlements")
      .insert({
        user_id: input.userId,
        product_sku: productSku,
        source: input.source ?? "stripe_subscription",
        status: "active",
        subscription_id: input.subscriptionId ?? null,
        expires_at: input.expiresAt ?? null,
        revoked_at: null,
      })
      .select("*")
      .single();
    if (error) throw error;
    results.push(mapEntitlement(data as Record<string, unknown>));
  }
  return results;
}

export async function revokeEntitlementsForSubscription(
  admin: DbClient,
  input: { userId: string; subscriptionId: string },
): Promise<number> {
  const { data, error } = await admin
    .from("billing_entitlements")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("user_id", input.userId)
    .eq("subscription_id", input.subscriptionId)
    .eq("status", "active")
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export function subscriptionStatusIsActive(status: string): boolean {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}
