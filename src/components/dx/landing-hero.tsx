import { HeroCopyItem, LandingHeroMotion } from "@/components/dx/landing-hero-motion";
import { LandingMockupScene } from "@/components/dx/landing-layout";
import { PpButtonLink, PpSectionLabel, PpTrustStrip } from "@/components/dx/landing-pp-ui";
import { ppClass } from "@/lib/policy-pilot-theme";
import type { LandingPreviewStats } from "@/services/landing";

export function LandingHero({ preview }: { preview: LandingPreviewStats }) {
  return (
    <LandingHeroMotion
      left={
        <>
          <HeroCopyItem>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#6ee7c7]/25 bg-[#6ee7c7]/10 px-4 py-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#6ee7c7] opacity-40" />
                <span className="relative size-2 rounded-full bg-[#6ee7c7]" />
              </span>
              <PpSectionLabel>AI-native delivery operations</PpSectionLabel>
            </div>
          </HeroCopyItem>

          <HeroCopyItem>
            <h1
              className={`${ppClass.display} mb-6 max-w-xl text-[2.75rem] leading-[1.05] text-[#f8f6f2] md:text-[3.5rem] lg:text-[4rem]`}
            >
              Status in minutes.
              <br />
              <span className="text-[#6ee7c7]">Not weeks.</span>
            </h1>
          </HeroCopyItem>

          <HeroCopyItem>
            <p className="mb-8 max-w-md text-lg font-light leading-relaxed text-white/55 md:text-xl">
              DeliverX replaces tool-hopping with one operations workspace — AI agents surface
              risks, draft reports, and route changes. Autonomously proposed. Always
              human-approved.
            </p>
          </HeroCopyItem>

          <HeroCopyItem>
            <div className="flex flex-wrap items-center gap-3">
              <PpButtonLink href="/signup">Start free trial</PpButtonLink>
              <PpButtonLink href="#shift" variant="ghost">
                See the shift
              </PpButtonLink>
            </div>
          </HeroCopyItem>

          <HeroCopyItem>
            <PpTrustStrip className="mt-10" />
          </HeroCopyItem>
        </>
      }
      right={<LandingMockupScene preview={preview} />}
    />
  );
}
