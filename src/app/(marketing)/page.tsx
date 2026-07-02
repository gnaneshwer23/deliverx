import dynamic from "next/dynamic";
import { DeliverXTicker } from "@/components/marketing/deliverx-ticker";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingQuickStartStrip } from "@/components/marketing/marketing-quick-start";

const sectionFallback = (minHeight: string) =>
  function SectionFallback() {
    return <div className={minHeight} aria-hidden />;
  };

const MarketingFoundationSection = dynamic(
  () =>
    import("@/components/marketing/marketing-foundation").then((m) => ({
      default: m.MarketingFoundationSection,
    })),
  { loading: sectionFallback("min-h-[28rem]") },
);

const MarketingWorkflowSection = dynamic(
  () =>
    import("@/components/marketing/marketing-workflow").then((m) => ({
      default: m.MarketingWorkflowSection,
    })),
  { loading: sectionFallback("min-h-[32rem]") },
);

const MarketingProductSection = dynamic(
  () =>
    import("@/components/marketing/marketing-product").then((m) => ({
      default: m.MarketingProductSection,
    })),
  { loading: sectionFallback("min-h-[28rem]") },
);

const MarketingOnboardingSection = dynamic(
  () =>
    import("@/components/marketing/marketing-onboarding").then((m) => ({
      default: m.MarketingOnboardingSection,
    })),
  { loading: sectionFallback("min-h-[32rem]") },
);

const MarketingWhatWorksSection = dynamic(
  () =>
    import("@/components/marketing/marketing-what-works").then((m) => ({
      default: m.MarketingWhatWorksSection,
    })),
  { loading: sectionFallback("min-h-[36rem]") },
);

const MarketingProofSection = dynamic(
  () =>
    import("@/components/marketing/marketing-proof").then((m) => ({
      default: m.MarketingProofSection,
    })),
  { loading: sectionFallback("min-h-[20rem]") },
);

const MarketingSocialProofSection = dynamic(
  () =>
    import("@/components/marketing/marketing-social-proof").then((m) => ({
      default: m.MarketingSocialProofSection,
    })),
  { loading: sectionFallback("min-h-[16rem]") },
);

const MarketingPricingSection = dynamic(
  () =>
    import("@/components/marketing/marketing-pricing").then((m) => ({
      default: m.MarketingPricingSection,
    })),
  { loading: sectionFallback("min-h-[24rem]") },
);

const MarketingCtaSection = dynamic(
  () =>
    import("@/components/marketing/marketing-cta").then((m) => ({
      default: m.MarketingCtaSection,
    })),
  { loading: sectionFallback("min-h-[20rem]") },
);

const MarketingFooter = dynamic(
  () =>
    import("@/components/marketing/marketing-footer").then((m) => ({
      default: m.MarketingFooter,
    })),
  { loading: sectionFallback("min-h-[16rem]") },
);

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
