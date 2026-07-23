import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { XPERIENCE_PAGE } from "@/lib/marketing/xperience-page";

export const metadata: Metadata = {
  title: "Xperience — Your first product role starts here | DeliverX",
  description:
    "Join a living AI-powered company, work with realistic teams, make consequential decisions and build evidence of how you perform.",
};

export default function XperiencePage() {
  return <ProductMarketingPage content={XPERIENCE_PAGE} />;
}
