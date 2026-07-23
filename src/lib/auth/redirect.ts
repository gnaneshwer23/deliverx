import type { SupabaseClient, User } from "@supabase/supabase-js";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import {
  isLaunchpadUser,
  LAUNCHPAD_APP_PATH,
  LAUNCHPAD_START_PATH,
} from "@/lib/launchpad/auth";
import { parseSuiteProduct } from "@/lib/marketing/product-intent";
import {
  isXperienceUser,
  XPERIENCE_APP_PATH,
  XPERIENCE_START_PATH,
} from "@/lib/xperience/auth";

const HUB_PATH = "/hub";

function isSafeNext(next?: string | null): next is string {
  return Boolean(next && next.startsWith("/") && !next.startsWith("//"));
}

function isXperienceDestination(path: string): boolean {
  return (
    path === XPERIENCE_APP_PATH ||
    path.startsWith(`${XPERIENCE_APP_PATH}/`) ||
    path === XPERIENCE_START_PATH ||
    path.startsWith(`${XPERIENCE_START_PATH}?`)
  );
}

function isLaunchpadDestination(path: string): boolean {
  return (
    path === LAUNCHPAD_APP_PATH ||
    path.startsWith(`${LAUNCHPAD_APP_PATH}/`) ||
    path.startsWith(`${LAUNCHPAD_APP_PATH}?`) ||
    path === LAUNCHPAD_START_PATH ||
    path.startsWith(`${LAUNCHPAD_START_PATH}?`)
  );
}

function suiteProductFromUser(user: User | null | undefined) {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return parseSuiteProduct(typeof meta?.product === "string" ? meta.product : null);
}

function isHubDestination(path: string): boolean {
  return path === HUB_PATH || path.startsWith(`${HUB_PATH}/`) || path.startsWith(`${HUB_PATH}?`);
}

/**
 * Post-login destination.
 *
 * - xperience / launchpad users → their apps (unless safeNext is another non-onboarding path)
 * - bundle / no product intent → /hub
 * - team-copilot (and users with org) → existing workspace / onboarding flow
 * Deep links via `next` are preserved when safe.
 */
export async function resolveAuthenticatedPath(
  supabase: SupabaseClient,
  next?: string | null,
  userId?: string,
): Promise<string> {
  const safeNext = isSafeNext(next) ? next : null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const id = userId ?? user?.id;
  if (!id) return "/login";

  // Prefer session user for metadata; fall back when id was supplied explicitly.
  const sessionUser =
    user && (!userId || user.id === userId) ? user : (user as User | null);

  const product = suiteProductFromUser(sessionUser);

  // Explicit hub deep link
  if (safeNext && isHubDestination(safeNext)) {
    return HUB_PATH;
  }

  // Xperience product users skip Team Co-pilot org onboarding.
  if (isXperienceUser(sessionUser)) {
    if (safeNext && isXperienceDestination(safeNext)) {
      return safeNext === XPERIENCE_START_PATH ||
        safeNext.startsWith(`${XPERIENCE_START_PATH}?`)
        ? XPERIENCE_APP_PATH
        : safeNext;
    }
    if (safeNext && !safeNext.startsWith("/onboarding")) {
      return safeNext;
    }
    return XPERIENCE_APP_PATH;
  }

  // Launchpad product users skip Team Co-pilot org onboarding.
  if (isLaunchpadUser(sessionUser)) {
    if (safeNext && isLaunchpadDestination(safeNext)) {
      if (
        safeNext === LAUNCHPAD_START_PATH ||
        safeNext.startsWith(`${LAUNCHPAD_START_PATH}?`)
      ) {
        return LAUNCHPAD_APP_PATH;
      }
      return safeNext;
    }
    if (safeNext && !safeNext.startsWith("/onboarding")) {
      return safeNext;
    }
    return LAUNCHPAD_APP_PATH;
  }

  // Bundle or no strong product intent → DeliverX Hub (unless deep-linked elsewhere)
  if (product === "bundle" || !product) {
    if (safeNext && !safeNext.startsWith("/onboarding") && !isAuthEntryLike(safeNext)) {
      return safeNext;
    }
    return HUB_PATH;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, role")
    .eq("id", id)
    .maybeSingle();

  if (!profile?.organisation_id) {
    return safeNext?.startsWith("/onboarding") ? safeNext : "/onboarding/organisation";
  }

  if (safeNext) return safeNext;

  return resolveRoleHomePath(profile.role);
}

function isAuthEntryLike(path: string): boolean {
  return (
    path === "/login" ||
    path.startsWith("/login?") ||
    path === "/signup" ||
    path.startsWith("/signup?")
  );
}
