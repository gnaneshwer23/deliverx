import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  isBillingEnforceOn,
  type BillingEnv,
  type GatedProductSurface,
} from "@/lib/billing/catalog";
import { userHasProductAccess } from "@/lib/billing/entitlements";

/**
 * When DELIVERX_BILLING_ENFORCE=on, require an active entitlement for the surface.
 * Otherwise allow (pilot / pre-Stripe ops). Unauthenticated callers still redirect to login.
 */
export async function requireProductEntitlement(
  surface: GatedProductSurface,
  options?: {
    loginNext: string;
    env?: BillingEnv;
    /** Injected for unit tests. */
    user?: User | null;
    hasAccess?: boolean;
  },
): Promise<{ user: User }> {
  const env = options?.env ?? (process.env as BillingEnv);

  let user = options?.user ?? null;
  if (!user) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(options?.loginNext ?? "/")}`);
  }

  if (!isBillingEnforceOn(env)) {
    return { user };
  }

  let allowed = options?.hasAccess;
  if (allowed === undefined) {
    const supabase = await createClient();
    allowed = await userHasProductAccess(supabase, user.id, surface);
  }

  if (!allowed) {
    redirect(`/pricing?need=${surface}&reason=entitlement_required`);
  }

  return { user };
}

/** API-friendly entitlement check — returns 402 JSON shape when unpaid under enforce. */
export async function assertApiEntitlement(input: {
  userId: string;
  surface: GatedProductSurface;
  env?: BillingEnv;
  hasAccess?: boolean;
}): Promise<{ allowed: true } | { allowed: false; status: 402; error: string }> {
  const env = input.env ?? (process.env as BillingEnv);
  if (!isBillingEnforceOn(env)) {
    return { allowed: true };
  }
  let allowed = input.hasAccess;
  if (allowed === undefined) {
    const supabase = await createClient();
    allowed = await userHasProductAccess(supabase, input.userId, input.surface);
  }
  if (!allowed) {
    return {
      allowed: false,
      status: 402,
      error: `Active ${input.surface} entitlement required. Complete checkout on /pricing.`,
    };
  }
  return { allowed: true };
}
