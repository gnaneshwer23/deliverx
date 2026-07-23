import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { TEAM_COPILOT_PAGE } from "@/lib/marketing/team-copilot-data";

export const metadata: Metadata = {
  title: "Team Co-pilot — Delivery intelligence for every role | DeliverX",
  description:
    "Team Co-pilot by DeliverX connects seven delivery roles in one signal graph. AI suggests. Humans decide. Delivery happens.",
};

export default function TeamCopilotPage() {
  return <ProductMarketingPage content={TEAM_COPILOT_PAGE} />;
}
