import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/onboarding/organisation";
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    const dest = new URL("/login", url);
    dest.searchParams.set("error", errorDescription ?? error);
    return NextResponse.redirect(dest);
  }

  if (!code) {
    const dest = new URL("/login", url);
    dest.searchParams.set("error", "Missing verification code.");
    return NextResponse.redirect(dest);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const dest = new URL("/login", url);
    dest.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(dest);
  }

  return NextResponse.redirect(new URL(next, url));
}
