import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { LAUNCHPAD_PAGE } from "@/lib/marketing/launchpad-page";

export const metadata: Metadata = {
  title: "Launchpad | Build Professional Experience Before You Are Hired | DeliverX",
  description:
    "Join an AI-powered company, manage realistic products, work with stakeholders and build evidence-backed professional experience.",
  openGraph: {
    title: "Your experience starts here.",
    description:
      "Launchpad gives you a company, a role, a team and the responsibility to deliver.",
  },
};

export default function LaunchpadPage() {
  return <ProductMarketingPage content={LAUNCHPAD_PAGE} />;
}
