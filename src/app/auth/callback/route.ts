import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function redirectWithError(request: NextRequest, message: string) {
  const dest = new URL("/login", request.url);
  dest.searchParams.set("error", message);
  return NextResponse.redirect(dest);
}

function sanitizeNext(next: string | null) {
  const fallback = "/onboarding/organisation";
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

function redirectSuccess(request: NextRequest, next: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return new URL(next, request.url);
  }

  if (forwardedHost) {
    return new URL(next, `https://${forwardedHost}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return new URL(next, appUrl);
  }

  return new URL(next, request.url);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = sanitizeNext(url.searchParams.get("next"));

  const oauthError = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  if (oauthError) {
    return redirectWithError(request, errorDescription ?? oauthError);
  }

  const tokenHash = url.searchParams.get("token_hash");
  const otpType = url.searchParams.get("type");
  const code = url.searchParams.get("code");

  if (!tokenHash && !code) {
    return redirectWithError(request, "Missing verification credentials.");
  }

  const response = NextResponse.redirect(redirectSuccess(request, next));
  const supabase = createRouteHandlerClient(request, response);

  if (tokenHash && otpType) {
    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as EmailOtpType,
    });

    if (otpError) {
      return redirectWithError(request, otpError.message);
    }

    return response;
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code!);

  if (exchangeError) {
    const isPkce = exchangeError.message.includes("PKCE code verifier");
    const isRecovery = next.includes("reset");
    const message = isPkce
      ? isRecovery
        ? "Open the reset link in the same browser where you clicked Send reset link. Copy the link from your email if your mail app opens a different browser."
        : "Open the verification link in the same browser you used to sign up. If you already verified, try signing in."
      : exchangeError.message;
    return redirectWithError(request, message);
  }

  return response;
}
