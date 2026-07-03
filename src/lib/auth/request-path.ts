import { headers } from "next/headers";

/** Resolve the current request path for server-side redirect guards. */
export async function getRequestPathFromHeaders(): Promise<string | null> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  const search = headerList.get("x-search") ?? "";
  if (pathname) return `${pathname}${search}`;

  const nextUrl = headerList.get("next-url");
  if (nextUrl?.startsWith("/") && !nextUrl.startsWith("//")) {
    return nextUrl;
  }

  const invokePath = headerList.get("x-invoke-path");
  if (invokePath?.startsWith("/")) {
    return invokePath;
  }

  return null;
}
