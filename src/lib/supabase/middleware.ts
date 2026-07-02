import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthenticatedPath } from "@/lib/auth/redirect";
import { hasSupabaseAuthCookie } from "@/lib/supabase/auth-cookies";

const AUTH_ENTRY_PATHS = ["/login", "/signup"];

function isAuthEntryPath(pathname: string): boolean {
  return AUTH_ENTRY_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  // Anonymous visitors on public auth pages skip a Supabase round-trip.
  if (!hasSupabaseAuthCookie(request) && isAuthEntryPath(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  // No auth cookies anywhere — nothing to refresh.
  if (!hasSupabaseAuthCookie(request)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
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
      const next = request.nextUrl.searchParams.get("next");
      const dest = await resolveAuthenticatedPath(supabase, next, user.id);
      return NextResponse.redirect(new URL(dest, request.url));
    }
  } catch {
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
