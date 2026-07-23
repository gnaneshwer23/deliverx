import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { TEAM_COPILOT_PAGE } from "@/lib/marketing/team-copilot-data";

export const metadata: Metadata = {
  title: "Team Co-pilot — Delivery workspace for real teams | DeliverX",
  description:
    "Team Co-pilot by DeliverX: delivery intelligence for every role. AI suggests. Humans decide. Start a 30-day free trial.",
  openGraph: {
    title: "Team Co-pilot — AI suggests. Humans decide. | DeliverX",
    description:
      "Shared delivery truth for real teams already in the job. 30-day free trial — separate from Xperience and Launchpad.",
  },
};

export default function TeamCopilotPage() {
  return <ProductMarketingPage content={TEAM_COPILOT_PAGE} />;
}
