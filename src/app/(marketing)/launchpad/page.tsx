import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { LAUNCHPAD_PAGE } from "@/lib/marketing/launchpad-page";

export const metadata: Metadata = {
  title: "Launchpad — Get career-ready | DeliverX",
  description:
    "Turn experience into career opportunities with Career Twin, portfolio, mock interviews and readiness scoring. £250 for 3 months — Advance Your Career.",
  openGraph: {
    title: "Launchpad — Advance Your Career | DeliverX",
    description: "Get career-ready. £250 · 3 months access.",
  },
};

export default function LaunchpadPage() {
  return <ProductMarketingPage content={LAUNCHPAD_PAGE} />;
}
