import { LandingMarketStats } from "@/components/dx/landing-market-stats";
import { LandingPageShell } from "@/components/dx/landing-layout";
import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingNav,
  LandingPricing,
} from "@/components/dx/landing-sections";
import { LandingShift } from "@/components/dx/landing-shift";
import {
  LandingAgents,
  LandingCapabilities,
  LandingPlatform,
} from "@/components/dx/landing-platform-sections";
import { getLandingPageContent } from "@/services/landing";

export default async function LandingPage() {
  const content = await getLandingPageContent();

  return (
    <LandingPageShell>
      <LandingNav />
      <main>
        <LandingHero preview={content.preview} />
        <LandingShift shift={content.shift} />
        <LandingAgents agents={content.agents} />
        <LandingMarketStats stats={content.marketStats} />
        <LandingPlatform />
        <LandingFeatures />
        <LandingCapabilities />
        <LandingPricing />
        <LandingCta />
      </main>
      <LandingFooter />
    </LandingPageShell>
  );
}
