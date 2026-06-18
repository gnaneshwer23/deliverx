import type { Metadata } from "next";
import type { ReactNode } from "react";
import { marketingFontClassName, mktSans } from "@/lib/marketing/marketing-fonts";

export const metadata: Metadata = {
  title: "DeliverX — AI Delivery Intelligence",
  description:
    "DeliverX — AI delivery intelligence for every role. Every project, every stakeholder, one connected workspace.",
  openGraph: {
    title: "DeliverX — AI Delivery Intelligence",
    description:
      "From business case to closure. AI that surfaces risks, drafts reports, and keeps 7 roles in sync — with human approval on every change.",
    type: "website",
    siteName: "DeliverX",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${marketingFontClassName} ${mktSans.className}`}>{children}</div>
  );
}
