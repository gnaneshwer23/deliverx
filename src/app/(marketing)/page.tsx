import { DeliverXTicker } from "@/components/marketing/deliverx-ticker";
import { MarketingCtaSection } from "@/components/marketing/marketing-cta";
import { MarketingFoundationSection } from "@/components/marketing/marketing-foundation";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPricingSection } from "@/components/marketing/marketing-pricing";
import { MarketingProductSection } from "@/components/marketing/marketing-product";
import { MarketingProofSection } from "@/components/marketing/marketing-proof";
import { MarketingQuickStartStrip } from "@/components/marketing/marketing-quick-start";
import { MarketingSocialProofSection } from "@/components/marketing/marketing-social-proof";
import { MarketingOnboardingSection } from "@/components/marketing/marketing-onboarding";
import { MarketingWhatWorksSection } from "@/components/marketing/marketing-what-works";
import { MarketingWorkflowSection } from "@/components/marketing/marketing-workflow";

export default function LandingPage() {
  return (
    <MarketingPageShell>
      <MarketingNav />
      <main id="main-content">
        <MarketingHero />
        <MarketingQuickStartStrip />
        <DeliverXTicker />
        <MarketingFoundationSection />
        <MarketingWorkflowSection />
        <MarketingProductSection />
        <MarketingOnboardingSection />
        <MarketingWhatWorksSection />
        <MarketingProofSection />
        <MarketingSocialProofSection />
        <MarketingPricingSection />
        <MarketingCtaSection />
      </main>
      <MarketingFooter />
    </MarketingPageShell>
  );
}
