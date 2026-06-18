import { MarketingCtaSection } from "@/components/marketing/marketing-cta";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingDivider, MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingLoopSection } from "@/components/marketing/marketing-loop";
import { MarketingNav, MarketingFooter } from "@/components/marketing/marketing-nav";
import { MarketingOnboardingSection } from "@/components/marketing/marketing-onboarding";
import { MarketingPricingSection } from "@/components/marketing/marketing-pricing";
import { MarketingProofSection } from "@/components/marketing/marketing-proof";

export default function LandingPage() {
  return (
    <MarketingPageShell>
      <MarketingNav />
      <main id="main-content">
        <MarketingHero />
        <MarketingLoopSection />
        <MarketingDivider />
        <MarketingOnboardingSection />
        <MarketingDivider />
        <MarketingProofSection />
        <MarketingDivider />
        <MarketingPricingSection />
        <MarketingCtaSection />
      </main>
      <MarketingFooter />
    </MarketingPageShell>
  );
}
