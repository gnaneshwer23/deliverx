import type { NextRequest } from "next/server";

/** True when a Supabase auth cookie is present (skip session refresh when absent). */
export function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (cookie) => cookie.name.includes("-auth-token") && cookie.value.length > 0,
  );
}
