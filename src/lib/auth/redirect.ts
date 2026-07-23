import type { SupabaseClient, User } from "@supabase/supabase-js";
import { resolveRoleHomePath } from "@/config/role-home-routing";
import {
  isLaunchpadUser,
  LAUNCHPAD_APP_PATH,
  LAUNCHPAD_START_PATH,
} from "@/lib/launchpad/auth";
import {
  isXperienceUser,
  XPERIENCE_APP_PATH,
  XPERIENCE_START_PATH,
} from "@/lib/xperience/auth";

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
