import type { Metadata } from "next";
import { ProductMarketingPage } from "@/components/marketing/product-marketing-page";
import { LAUNCHPAD_PAGE } from "@/lib/marketing/launchpad-page";

export const metadata: Metadata = {
  title: "Launchpad | Turn your experience into opportunities | DeliverX",
  description:
    "Career Intelligence: labelled readiness, evidence-backed CV packaging, interview lab and application tracking. Open pilot access.",
  alternates: { canonical: "/launchpad" },
  openGraph: {
    title: "Launchpad | Land the opportunity | DeliverX",
    description:
      "Turn your experience into opportunities. Pilot access; paid plans not yet live.",
  },
};

export default function LaunchpadPage() {
  return <ProductMarketingPage content={LAUNCHPAD_PAGE} />;
}
