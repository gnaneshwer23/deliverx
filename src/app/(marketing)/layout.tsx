import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { marketingFontClassName, mktSans } from "@/lib/marketing/marketing-fonts";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.deliverx.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "DeliverX | AI Product Experience Company",
  description:
    "DeliverX is an evidence-driven professional growth platform that supports Product Managers from their first practical experience through to successful product delivery in real organisations.",
  // Image URLs come from `opengraph-image.tsx` (file convention). Do not set
  // `/opengraph-image` literally — that path 404s; Next serves a hashed route.
  openGraph: {
    title: "DeliverX | AI Product Experience Company",
    description:
      "Build the experience → Land the opportunity → Succeed in the role. Experience, Launchpad and Professional Workspace.",
    type: "website",
    siteName: "DeliverX",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeliverX | AI Product Experience Company",
    description:
      "Experience, Launchpad and Professional Workspace: build the experience, land the opportunity, succeed in the role.",
  },
};

/**
 * Shared marketing chrome — shell + sticky header live here so primary nav
 * does not remount (and jump) between routes.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${marketingFontClassName} ${mktSans.className}`}>
      <MarketingPageShell>
        <MarketingNav />
        {children}
      </MarketingPageShell>
    </div>
  );
}
