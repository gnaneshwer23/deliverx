import type { NextRequest } from "next/server";
import { appendRoleToPath, parseSignupRoleParam } from "@/lib/marketing/role-signup";

const AUTH_ENTRY_PATHS = ["/login", "/signup"];
const ONBOARDING_PREFIX = "/onboarding";

export function isAuthEntryPath(pathname: string): boolean {
  return AUTH_ENTRY_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isOnboardingPath(pathname: string): boolean {
  return pathname === ONBOARDING_PREFIX || pathname.startsWith(`${ONBOARDING_PREFIX}/`);
}

/** Preserve full path (including ?role=) when sending users to login. */
export function buildLoginRedirectPath(nextPath: string): string {
  const params = new URLSearchParams();
  params.set("next", nextPath);
  return `/login?${params.toString()}`;
}

/** Map /signup?role= deep links to the personalised onboarding entry path. */
export function resolveSignupOnboardingNext(request: Pick<NextRequest, "nextUrl">): string | null {
  const explicit = request.nextUrl.searchParams.get("next");
  if (explicit?.startsWith("/") && !explicit.startsWith("//")) {
    return explicit;
  }

  if (!request.nextUrl.pathname.startsWith("/signup")) {
    return null;
  }

  const preselectedRole = parseSignupRoleParam(request.nextUrl.searchParams.get("role"));
  return preselectedRole
    ? appendRoleToPath("/onboarding/organisation", preselectedRole)
    : null;
}

export function requestPathWithSearch(request: Pick<NextRequest, "nextUrl">): string {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}
