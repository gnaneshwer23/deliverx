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
import { getLandingPreviewStats } from "@/services/landing";

export default async function LandingPage() {
  const preview = await getLandingPreviewStats();

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <LandingNav />
      <LandingHero preview={preview} />
      <LandingProblem />
      <LandingHow />
      <LandingFeatures />
      <LandingPricing />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
