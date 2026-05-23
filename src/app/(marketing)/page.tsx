import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingHow,
  LandingNav,
  LandingPricing,
  LandingProblem,
} from "@/components/dx/landing-sections";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <LandingNav />
      <LandingHero />
      <LandingProblem />
      <LandingHow />
      <LandingFeatures />
      <LandingPricing />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
