import { LandingFaq } from "@/components/dx/landing-faq";
import { LandingPageShell } from "@/components/dx/landing-layout";
import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingNav,
  LandingPricing,
  LandingProblem,
} from "@/components/dx/landing-sections";
import {
  LandingCapabilities,
  LandingJourney,
  LandingPlatform,
} from "@/components/dx/landing-platform-sections";
import { getLandingPreviewStats } from "@/services/landing";

export default async function LandingPage() {
  const preview = await getLandingPreviewStats();

  return (
    <LandingPageShell>
      <LandingNav />
      <main id="main-content">
        <LandingHero preview={preview} />
        <LandingProblem />
        <LandingJourney />
        <LandingPlatform preview={preview} />
        <LandingFeatures />
        <LandingCapabilities />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
