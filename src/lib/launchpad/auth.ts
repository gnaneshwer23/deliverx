import type { User } from "@supabase/supabase-js";
import { parseSuiteProduct, type SuiteProduct } from "@/lib/marketing/product-intent";

export const LAUNCHPAD_APP_PATH = "/launchpad/app";
export const LAUNCHPAD_START_PATH = "/start/launchpad";

/** Suite products that should use the Launchpad app surface (not Professional Workspace org onboarding). */
export function isLaunchpadProduct(product: SuiteProduct | null | undefined): boolean {
  return product === "launchpad";
}

export function suiteProductFromUser(user: User | null | undefined): SuiteProduct | null {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return parseSuiteProduct(typeof meta?.product === "string" ? meta.product : null);
}

export function isLaunchpadUser(user: User | null | undefined): boolean {
  return isLaunchpadProduct(suiteProductFromUser(user));
}
