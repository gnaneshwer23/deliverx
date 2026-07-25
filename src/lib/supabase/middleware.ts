import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthenticatedPath } from "@/lib/auth/redirect";
import {
  buildLoginRedirectPath,
  isAuthEntryPath,
  isHubPath,
  isLaunchpadAppPath,
  isOnboardingPath,
  isSettingsPath,
  isWorkspacePath,
  isXperienceAppPath,
  requestPathWithSearch,
  resolveSignupOnboardingNext,
} from "@/lib/auth/route-guards";
import { hasSupabaseAuthCookie } from "@/lib/supabase/auth-cookies";

const MARKETING_PUBLIC_PATHS = ["/", "/privacy", "/terms"];

function isMarketingPublicPath(pathname: string): boolean {
  return MARKETING_PUBLIC_PATHS.includes(pathname);
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-search", request.nextUrl.search);

  const passThrough = (response: NextResponse) => {
    requestHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    response.headers.set("x-dx-proxy", "1");
    return response;
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return passThrough(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Anonymous visitors on marketing/auth entry pages skip a Supabase round-trip.
  if (
    !hasSupabaseAuthCookie(request) &&
    (isMarketingPublicPath(pathname) || isAuthEntryPath(pathname))
  ) {
    return passThrough(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Protect app shells — preserve query params in login redirect.
  if (
    !hasSupabaseAuthCookie(request) &&
    (isOnboardingPath(pathname) ||
      isXperienceAppPath(pathname) ||
      isLaunchpadAppPath(pathname) ||
      isHubPath(pathname) ||
      isWorkspacePath(pathname) ||
      isSettingsPath(pathname))
  ) {
    const redirectResponse = NextResponse.redirect(
      new URL(buildLoginRedirectPath(requestPathWithSearch(request)), request.url),
    );
    redirectResponse.headers.set("x-dx-proxy", "anon-redirect");
    return redirectResponse;
  }

  // No auth cookies anywhere — nothing to refresh.
  if (!hasSupabaseAuthCookie(request)) {
    return passThrough(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // IMPORTANT: Do not run code between createServerClient and getUser().
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && isAuthEntryPath(pathname)) {
      const next =
        request.nextUrl.searchParams.get("next") ?? resolveSignupOnboardingNext(request);
      const dest = await resolveAuthenticatedPath(supabase, next, user.id);
      return NextResponse.redirect(new URL(dest, request.url));
    }
  } catch {
    return passThrough(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  return passThrough(supabaseResponse);
}
