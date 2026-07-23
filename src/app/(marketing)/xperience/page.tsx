import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { XPERIENCE_PAGE } from "@/lib/marketing/xperience-page";

export const metadata: Metadata = {
  title: "Xperience — Build the experience employers expect | DeliverX",
  description:
    "Join an AI-powered company and work as a Product Manager from day one. £500 for 3 months — Build the experience in the DeliverX journey.",
  openGraph: {
    title: "Xperience — Build the experience | DeliverX",
    description:
      "Build the experience employers expect. £500 · 3 months access.",
  },
};

export default function XperiencePage() {
  return <ProductMarketingPage content={XPERIENCE_PAGE} />;
}
