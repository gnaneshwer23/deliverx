import { DeliverXTicker } from "@/components/marketing/deliverx-ticker";
import { MarketingCtaSection } from "@/components/marketing/marketing-cta";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingDivider, MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingNav, MarketingFooter } from "@/components/marketing/marketing-nav";
import { MarketingPricingSection } from "@/components/marketing/marketing-pricing";
import { MarketingProductSection } from "@/components/marketing/marketing-product";
import { MarketingProofSection } from "@/components/marketing/marketing-proof";
import { MarketingSocialProofSection } from "@/components/marketing/marketing-social-proof";
import { MarketingWorkflowSection } from "@/components/marketing/marketing-workflow";

export default function LandingPage() {
  return (
    <MarketingPageShell>
      <MarketingNav />
      <main id="main-content">
        <MarketingHero />
        <DeliverXTicker />
        <MarketingProductSection />
        <MarketingDivider />
        <MarketingWorkflowSection />
        <MarketingDivider />
        <MarketingProofSection />
        <MarketingSocialProofSection />
        <MarketingDivider />
        <MarketingPricingSection />
        <MarketingCtaSection />
      </main>
      <MarketingFooter />
    </MarketingPageShell>
  );
}
