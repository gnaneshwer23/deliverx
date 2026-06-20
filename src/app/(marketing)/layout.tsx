import type { Metadata } from "next";
import type { ReactNode } from "react";
import { marketingFontClassName, mktSans } from "@/lib/marketing/marketing-fonts";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://www.deliverx.dev";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "DeliverX — AI Delivery Intelligence Platform",
  description:
    "DeliverX is the delivery intelligence platform for every role. One connected workspace from business case to closure — with human approval on every AI change.",
  openGraph: {
    title: "DeliverX — AI Delivery Intelligence Platform",
    description:
      "Role-specific dashboards, live team sync, and AI that surfaces risks and drafts reports — with human approval on every change.",
    type: "website",
    siteName: "DeliverX",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DeliverX — AI Delivery Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeliverX — AI Delivery Intelligence Platform",
    description:
      "Role-specific dashboards, live team sync, and AI that surfaces risks and drafts reports — with human approval on every change.",
    images: ["/opengraph-image"],
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${marketingFontClassName} ${mktSans.className}`}>{children}</div>
  );
}
