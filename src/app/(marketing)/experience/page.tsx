import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { XPERIENCE_PAGE } from "@/lib/marketing/xperience-page";

export const metadata: Metadata = {
  title: "Experience — Build the experience employers expect | DeliverX",
  description:
    "Join an AI-powered company and work as a Product Manager from day one. Open pilot access — Build the experience in the DeliverX journey.",
  openGraph: {
    title: "Experience — Build the experience | DeliverX",
    description:
      "Build the experience employers expect. Pilot access — paid plans not yet live.",
  },
};

export default function XperiencePage() {
  return <ProductMarketingPage content={XPERIENCE_PAGE} />;
}
