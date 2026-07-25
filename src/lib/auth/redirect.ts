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
import {
  getPiOnboardingSession,
  needsPiOnboarding,
} from "@/lib/pi-onboarding/store";
import { PI_ONBOARDING_PATH } from "@/lib/pi-onboarding/types";
import { PI_PROFILE_PATH } from "@/lib/pi-profile/paths";

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

function isProfileDestination(path: string): boolean {
  return (
    path === PI_PROFILE_PATH ||
    path.startsWith(`${PI_PROFILE_PATH}/`) ||
    path.startsWith(`${PI_PROFILE_PATH}?`)
  );
}

/**
 * Post-login destination.
 *
 * - Candidate journey (bundle / no product / career products after PI) → /profile
 * - Explicit Experience / Launchpad / Hub deep links preserved
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

  // Explicit hub deep link (still allow after PI onboarding)
  if (safeNext && isHubDestination(safeNext)) {
    return HUB_PATH;
  }

  // Explicit profile deep link
  if (safeNext && isProfileDestination(safeNext)) {
    return safeNext;
  }

  // Allow explicit PI onboarding deep link
  if (
    safeNext &&
    (safeNext === PI_ONBOARDING_PATH ||
      safeNext.startsWith(`${PI_ONBOARDING_PATH}?`))
  ) {
    return PI_ONBOARDING_PATH;
  }

  // Career products: complete Professional Intelligence setup before product apps.
  if (isXperienceUser(sessionUser) || isLaunchpadUser(sessionUser) || product === "bundle") {
    const piSession = await getPiOnboardingSession(supabase, id);
    if (needsPiOnboarding(piSession, product)) {
      return PI_ONBOARDING_PATH;
    }
  }

  // Experience product users skip Professional Workspace org onboarding.
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
    // Candidate centre — Experience remains one hop from Profile.
    return PI_PROFILE_PATH;
  }

  // Launchpad product users skip Professional Workspace org onboarding.
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
    return PI_PROFILE_PATH;
  }

  // Bundle or no strong product intent → Profile centre (Hub stays a secondary chooser)
  if (product === "bundle" || !product) {
    if (safeNext && !safeNext.startsWith("/onboarding") && !isAuthEntryLike(safeNext)) {
      return safeNext;
    }
    return PI_PROFILE_PATH;
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
