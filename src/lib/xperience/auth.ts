import type { User } from "@supabase/supabase-js";
import { parseSuiteProduct, type SuiteProduct } from "@/lib/marketing/product-intent";

export const XPERIENCE_APP_PATH = "/xperience/app";
export const XPERIENCE_START_PATH = "/start/xperience";

/** Suite products that should use the Experience app surface (not Team Co-pilot org onboarding). */
export function isXperienceProduct(product: SuiteProduct | null | undefined): boolean {
  return product === "xperience";
}

export function suiteProductFromUser(user: User | null | undefined): SuiteProduct | null {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return parseSuiteProduct(typeof meta?.product === "string" ? meta.product : null);
}

export function isXperienceUser(user: User | null | undefined): boolean {
  return isXperienceProduct(suiteProductFromUser(user));
}
