import { CareerIntelligenceApp } from "@/components/launchpad/career-intelligence-app";
import { requireLaunchpadAuth } from "@/lib/launchpad/require-auth";

export const dynamic = "force-dynamic";

export default async function CareerIntelligenceHomePage() {
  await requireLaunchpadAuth();
  return <CareerIntelligenceApp activeModule="readiness" />;
}
