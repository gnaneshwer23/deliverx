import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { XPERIENCE_PAGE } from "@/lib/marketing/xperience-page";

export const metadata: Metadata = {
  title: "Xperience — AI Experience Company | DeliverX",
  description:
    "Join a living AI-powered company. Build professional capability through consequential work — not a course or interview-prep programme.",
  openGraph: {
    title: "Xperience — Join a living company | DeliverX",
    description:
      "An AI Experience Company where people build capability by working inside persistent organisations.",
  },
};

export default function XperiencePage() {
  return <ProductMarketingPage content={XPERIENCE_PAGE} />;
}
