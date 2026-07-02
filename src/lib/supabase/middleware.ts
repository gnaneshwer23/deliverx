import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthenticatedPath } from "@/lib/auth/redirect";
import {
  buildLoginRedirectPath,
  isAuthEntryPath,
  isOnboardingPath,
  requestPathWithSearch,
  resolveSignupOnboardingNext,
} from "@/lib/auth/route-guards";
import { hasSupabaseAuthCookie } from "@/lib/supabase/auth-cookies";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-search", request.nextUrl.search);

  const passThrough = (response: NextResponse) => {
    requestHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return passThrough(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Anonymous visitors on public auth pages skip a Supabase round-trip.
  if (!hasSupabaseAuthCookie(request) && isAuthEntryPath(request.nextUrl.pathname)) {
    return passThrough(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  // Protect onboarding routes — preserve ?role= and other query params in login redirect.
  if (!hasSupabaseAuthCookie(request) && isOnboardingPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(
      new URL(buildLoginRedirectPath(requestPathWithSearch(request)), request.url),
    );
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

    if (user && isAuthEntryPath(request.nextUrl.pathname)) {
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
