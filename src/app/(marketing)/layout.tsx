import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "DeliverX — AI Delivery Operating System",
  description:
    "One workspace from business case to closure. AI surfaces risks, drafts reports, and routes governance — your team approves every change.",
  openGraph: {
    title: "DeliverX — AI Delivery Operating System",
    description:
      "Deliver projects with shared context, human-approved AI, and a single command centre.",
    type: "website",
    siteName: "DeliverX",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return children;
}
