import type { Metadata } from "next";
import type { ReactNode } from "react";
import { marketingFontClassName, mktSans } from "@/lib/marketing/marketing-fonts";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.deliverx.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "DeliverX — AI Product Experience Company",
  description:
    "DeliverX is an AI-powered professional growth platform that supports Product Managers from their first practical experience through to successful product delivery in real organisations.",
  openGraph: {
    title: "DeliverX — AI Product Experience Company",
    description:
      "Build the experience → Land the opportunity → Succeed in the role. Experience, Launchpad and Team Co-pilot.",
    type: "website",
    siteName: "DeliverX",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DeliverX · AI Product Experience Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeliverX — AI Product Experience Company",
    description:
      "Experience, Launchpad and Team Co-pilot — build the experience, land the opportunity, succeed in the role.",
    images: ["/opengraph-image"],
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${marketingFontClassName} ${mktSans.className}`}>{children}</div>
  );
}
