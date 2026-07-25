import { headers } from "next/headers";

/**
 * Resolve the current request path for server-side redirect guards.
 *
 * Prefer proxy-injected `x-pathname` / `x-search`. When those are absent
 * (known residual when anonymous edge guards do not run), fall back to
 * platform headers so deep links like `/workspace/coach` survive login.
 */
export async function getRequestPathFromHeaders(): Promise<string | null> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  const search = headerList.get("x-search") ?? "";
  if (pathname?.startsWith("/") && !pathname.startsWith("//")) {
    return `${pathname}${search}`;
  }

  const nextUrl = headerList.get("next-url");
  if (nextUrl?.startsWith("/") && !nextUrl.startsWith("//")) {
    return nextUrl;
  }

  const invokePath = headerList.get("x-invoke-path");
  if (invokePath?.startsWith("/") && !invokePath.startsWith("//")) {
    return invokePath;
  }

  // Vercel sets this on the matched App Router path even when proxy headers are missing.
  const matchedPath = headerList.get("x-matched-path");
  if (matchedPath?.startsWith("/") && !matchedPath.startsWith("//")) {
    // Ignore internal RSC / flight matched paths.
    if (
      matchedPath.startsWith("/_next") ||
      matchedPath.includes(".rsc") ||
      matchedPath.includes(".segments")
    ) {
      return null;
    }
    return `${matchedPath}${search}`;
  }

  return null;
}

/** Pure helper for unit tests — same precedence as getRequestPathFromHeaders. */
export function resolveRequestPathFromHeaderMap(
  headerMap: Record<string, string | null | undefined>,
): string | null {
  const pathname = headerMap["x-pathname"];
  const search = headerMap["x-search"] ?? "";
  if (pathname?.startsWith("/") && !pathname.startsWith("//")) {
    return `${pathname}${search}`;
  }

  const nextUrl = headerMap["next-url"];
  if (nextUrl?.startsWith("/") && !nextUrl.startsWith("//")) {
    return nextUrl;
  }

  const invokePath = headerMap["x-invoke-path"];
  if (invokePath?.startsWith("/") && !invokePath.startsWith("//")) {
    return invokePath;
  }

  const matchedPath = headerMap["x-matched-path"];
  if (matchedPath?.startsWith("/") && !matchedPath.startsWith("//")) {
    if (
      matchedPath.startsWith("/_next") ||
      matchedPath.includes(".rsc") ||
      matchedPath.includes(".segments")
    ) {
      return null;
    }
    return `${matchedPath}${search}`;
  }

  return null;
}
