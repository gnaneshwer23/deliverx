import { LandingFaq } from "@/components/dx/landing-faq";
import { LandingPageShell, LandingSectionBridge } from "@/components/dx/landing-layout";
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
        <LandingSectionBridge
          headline={
            <>
              Stop reconciling twelve tools.{" "}
              <span className="text-[#1C4A2E]">Run delivery on one signal graph.</span>
            </>
          }
          sub="Every risk, task, report, and decision links to the same project — so status is always current and AI never acts without approval."
        />
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
