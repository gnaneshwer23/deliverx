import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { LAUNCHPAD_PAGE } from "@/lib/marketing/launchpad-page";

export const metadata: Metadata = {
  title: "Launchpad — Turn your experience into opportunities | DeliverX",
  description:
    "Turn experience into career opportunities with Career Twin, portfolio, mock interviews and salary insights. £250 for 3 months — Land the opportunity.",
  openGraph: {
    title: "Launchpad — Land the opportunity | DeliverX",
    description:
      "Turn your experience into opportunities. £250 · 3 months access.",
  },
};

export default function LaunchpadPage() {
  return <ProductMarketingPage content={LAUNCHPAD_PAGE} />;
}
