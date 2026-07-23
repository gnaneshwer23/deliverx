import type { Metadata } from "next";
import { HomeHero } from "@/components/marketing/home/home-hero";
import {
  HomeAiCompany,
  HomeBuiltFor,
  HomeExperienceRecord,
  HomeFaq,
  HomeFinalCta,
  HomeGuarantee,
  HomeJourney,
  HomeOutcomes,
  HomeOutputs,
  HomePlatformPreview,
  HomePricing,
  HomeProblem,
  HomeProducts,
  HomeStories,
  HomeTeamCopilotPreview,
} from "@/components/marketing/home/home-sections";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingPageShell } from "@/components/marketing/marketing-layout";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import {
  CAREER_PROGRESSION_LINE,
  COMPANY_MISSION,
} from "@/lib/marketing/career-suite";
import { HOME_SUPPORT } from "@/lib/marketing/homepage-data";

export const metadata: Metadata = {
  title: "DeliverX — Complete Career Intelligence Platform",
  description: HOME_SUPPORT,
  openGraph: {
    title: "DeliverX — AI Product Experience Company",
    description: CAREER_PROGRESSION_LINE || COMPANY_MISSION,
  },
};

export default function SuiteHomePage() {
  return (
    <MarketingPageShell>
      <MarketingNav primaryCta={{ href: "/signup", label: "Start your journey" }} />

      <main id="main-content">
        <HomeHero />
        <HomeBuiltFor />
        <HomeProblem />
        <HomeProducts />
        <HomeJourney />
        <HomePlatformPreview />
        <HomeOutputs />
        <HomeAiCompany />
        <HomeExperienceRecord />
        <HomeTeamCopilotPreview />
        <HomeOutcomes />
        <HomePricing />
        <HomeGuarantee />
        <HomeStories />
        <HomeFaq />
        <HomeFinalCta />
      </main>

      {/* Page already ends with HomeFinalCta — omit duplicate footer CTA band */}
      <MarketingFooter cta={null} />
    </MarketingPageShell>
  );
}
