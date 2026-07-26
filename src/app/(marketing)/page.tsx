import type { Metadata } from "next";
import { HomeHero } from "@/components/marketing/home/home-hero";
import {
  HomeBuiltFor,
  HomeExperienceRecord,
  HomeFaq,
  HomeFinalCta,
  HomeGuarantee,
  HomeJourney,
  HomeOutcomes,
  HomePlatformPreview,
  HomeProblem,
  HomeProducts,
  HomeStories,
} from "@/components/marketing/home/home-sections";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import {
  CAREER_PROGRESSION_LINE,
  COMPANY_MISSION,
} from "@/lib/marketing/career-suite";
import { HOME_SUPPORT } from "@/lib/marketing/homepage-data";

export const metadata: Metadata = {
  title: "DeliverX — Experience, Launchpad and Professional Workspace",
  description: HOME_SUPPORT,
  openGraph: {
    title: "DeliverX — AI Product Experience Company",
    description: CAREER_PROGRESSION_LINE || COMPANY_MISSION,
  },
};

export default function SuiteHomePage() {
  return (
    <>
      <main id="main-content">
        <HomeHero />
        <HomeBuiltFor />
        <HomeProblem />
        <HomeProducts />
        <HomeJourney />
        <HomePlatformPreview />
        <HomeExperienceRecord />
        <HomeOutcomes />
        <HomeGuarantee />
        <HomeStories />
        <HomeFaq />
        <HomeFinalCta />
      </main>

      <MarketingFooter cta={null} />
    </>
  );
}
