import { CareerIntelligenceApp } from "@/components/launchpad/career-intelligence-app";
import { requireLaunchpadAuth } from "@/lib/launchpad/require-auth";
import type { CareerModuleId } from "@/lib/career-intelligence/types";

export const dynamic = "force-dynamic";

const MODULE_PAGES: Record<string, CareerModuleId> = {
  roadmap: "roadmap",
  cv: "cv",
  profile: "profile",
  interview: "interview",
  opportunities: "opportunities",
  companies: "companies",
  applications: "applications",
  networking: "networking",
  "hiring-managers": "hiring_managers",
  events: "events",
  promotion: "promotion",
};

export default async function CareerModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  await requireLaunchpadAuth();
  const { module: mod } = await params;
  const active = MODULE_PAGES[mod] ?? "readiness";
  return <CareerIntelligenceApp activeModule={active} />;
}
