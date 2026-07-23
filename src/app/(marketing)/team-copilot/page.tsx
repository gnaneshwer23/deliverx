import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { TEAM_COPILOT_PAGE } from "@/lib/marketing/team-copilot-data";

export const metadata: Metadata = {
  title: "Team Co-pilot — Deliver with confidence | DeliverX",
  description:
    "AI-powered Product Delivery Operating System for modern product teams. £500 for 3 months — Deliver Products Together.",
  openGraph: {
    title: "Team Co-pilot — Deliver Products Together | DeliverX",
    description: "Deliver with confidence. £500 · 3 months access.",
  },
};

export default function TeamCopilotPage() {
  return <ProductMarketingPage content={TEAM_COPILOT_PAGE} />;
}
