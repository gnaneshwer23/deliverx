import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { TEAM_COPILOT_PAGE } from "@/lib/marketing/team-copilot-data";

export const metadata: Metadata = {
  title: "Team Co-pilot — AI delivery OS for product teams | DeliverX",
  description:
    "Collaborative Product Delivery Operating System for real teams — PM, delivery, eng, QA and leadership in one workspace. £500 for 3 months.",
  openGraph: {
    title: "Team Co-pilot — Deliver Products Together | DeliverX",
    description:
      "The AI delivery OS for real product teams. £500 · 3 months access.",
  },
};

export default function TeamCopilotPage() {
  return <ProductMarketingPage content={TEAM_COPILOT_PAGE} />;
}
