import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
  "https://www.deliverx.dev";

/**
 * Invite-only pilot: index marketing; keep product/auth surfaces out of crawl budgets.
 * Tokenised share/attest URLs are omitted from the sitemap and disallowed here.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/workspace",
        "/project",
        "/profile",
        "/settings",
        "/onboarding",
        "/start",
        "/pi",
        "/brain",
        "/billing",
        "/career",
        "/learning",
        "/hub",
        "/help",
        "/portfolio",
        "/share",
        "/invite",
        "/experience/app",
        "/launchpad/app",
        "/login",
        "/signup",
        "/join",
        "/verify",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
