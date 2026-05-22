import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingStatsBand } from "@/components/marketing/marketing-stats-band";
import { MarketingIntro } from "@/components/marketing/marketing-intro";
import { MarketingFeatureCards } from "@/components/marketing/marketing-feature-cards";
import { MarketingProcess } from "@/components/marketing/marketing-process";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function LandingPage() {
  return (
    <div className="bg-[#0a0e14] text-[#f8f6f2]">
      <MarketingHero />
      <MarketingStatsBand />
      <MarketingIntro />
      <MarketingFeatureCards />
      <MarketingProcess />
      <MarketingCta />
      <MarketingFooter />
    </div>
  );
}
