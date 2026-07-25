import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { TEAM_COPILOT_PAGE } from "@/lib/marketing/team-copilot-data";

export const metadata: Metadata = {
  title: "Professional Workspace — Deliver with AI teammates | DeliverX",
  description:
    "Multidisciplinary Professional Workspace for real work with AI teammates — meetings, stakeholders, artefacts, decisions, risks and evidence. Open pilot access.",
  openGraph: {
    title: "Professional Workspace — Succeed in the role | DeliverX",
    description: "AI drafts. Humans decide. Pilot access — paid plans not yet live.",
  },
};

export default function ProfessionalWorkspaceMarketingPage() {
  return <ProductMarketingPage content={TEAM_COPILOT_PAGE} />;
}
