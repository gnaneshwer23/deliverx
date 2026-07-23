import type { Metadata } from "next";
import type { ReactNode } from "react";
import { marketingFontClassName, mktSans } from "@/lib/marketing/marketing-fonts";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.deliverx.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "DeliverX — Build the experience. Advance your career. Deliver with confidence.",
  description:
    "DeliverX is the complete career intelligence platform: Xperience, Launchpad and Team Co-pilot. Build the experience → Land the opportunity → Succeed in the role.",
  openGraph: {
    title: "DeliverX",
    description:
      "Build the experience → Land the opportunity → Succeed in the role. Xperience, Launchpad and Team Co-pilot.",
    type: "website",
    siteName: "DeliverX",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DeliverX · Complete Career Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeliverX — Build the experience. Advance your career.",
    description:
      "Xperience, Launchpad and Team Co-pilot — build experience, land the opportunity, succeed in the role.",
    images: ["/opengraph-image"],
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${marketingFontClassName} ${mktSans.className}`}>{children}</div>
  );
}
