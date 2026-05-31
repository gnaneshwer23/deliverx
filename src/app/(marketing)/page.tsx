import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingHow,
  LandingNav,
  LandingPricing,
  LandingProblem,
} from "@/components/dx/landing-sections";
import {
  LandingDashboardPreview,
  LandingDeliveryLoops,
  LandingIntelligence,
  LandingOnboardingPath,
  LandingOsStack,
  LandingWorkspaceMap,
} from "@/components/dx/landing-platform-sections";
import { getLandingPreviewStats } from "@/services/landing";

export default async function LandingPage() {
  const preview = await getLandingPreviewStats();

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <LandingNav />
      <LandingHero preview={preview} />
      <LandingProblem />
      <LandingOsStack />
      <LandingDeliveryLoops />
      <LandingHow />
      <LandingDashboardPreview />
      <LandingIntelligence />
      <LandingWorkspaceMap />
      <LandingOnboardingPath />
      <LandingFeatures />
      <LandingPricing />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
