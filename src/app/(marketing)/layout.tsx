import type { Metadata } from "next";
import type { ReactNode } from "react";
import { marketingFontClassName, mktSans } from "@/lib/marketing/marketing-fonts";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.deliverx.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "DeliverX — AI suggests. Humans decide.",
  description:
    "AI surfaces risks, drafts reports, and flags blockers. Nothing applies until the team approves. Seven roles, one live picture.",
  openGraph: {
    title: "DeliverX — AI suggests. Humans decide.",
    description:
      "AI surfaces risks, drafts reports, and flags blockers. Nothing applies until the team approves. Seven roles, one live picture.",
    type: "website",
    siteName: "DeliverX",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DeliverX · AI Delivery Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeliverX — AI suggests. Humans decide.",
    description:
      "AI surfaces risks, drafts reports, and flags blockers. Nothing applies until the team approves. Seven roles, one live picture.",
    images: ["/opengraph-image"],
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${marketingFontClassName} ${mktSans.className}`}>{children}</div>
  );
}
