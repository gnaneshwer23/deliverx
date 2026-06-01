import { DxButtonLink } from "@/components/dx/dx-button";
import { DxCaps } from "@/components/dx/dx-logo";
import { HeroCopyItem, LandingHeroMotion } from "@/components/dx/landing-hero-motion";
import {
  LandingMockupScene,
  SocialProofStrip,
} from "@/components/dx/landing-layout";
import { dxClass } from "@/lib/dx-theme";
import type { LandingPreviewStats } from "@/services/landing";

export function LandingHero({ preview }: { preview: LandingPreviewStats }) {
  return (
    <LandingHeroMotion
      left={
        <>
          <HeroCopyItem>
            <div className="mb-6 inline-flex items-center gap-2.5 border border-[#C6DDD0]/80 bg-white/70 px-3.5 py-2 shadow-[0_8px_30px_-12px_rgba(28,74,46,0.25)] backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#3D9660] opacity-40" />
                <span className="relative size-2 rounded-full bg-[#1C4A2E]" />
              </span>
              <DxCaps accent className="!text-[9px]">
                AI-native delivery OS
              </DxCaps>
            </div>
          </HeroCopyItem>

          <HeroCopyItem>
            <h1
              className={`${dxClass.sectionTitle} mb-6 text-[2.75rem] leading-[1.05] md:text-[3.5rem] lg:text-[3.75rem]`}
            >
              The operating system for{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#1C4A2E]">intelligent</span>
                <span
                  className="absolute -bottom-1 left-0 right-0 h-3 bg-[#C6DDD0]/60 -skew-x-3"
                  aria-hidden
                />
              </span>{" "}
              delivery.
            </h1>
          </HeroCopyItem>

          <HeroCopyItem>
            <p className="mb-4 max-w-md text-lg font-light leading-relaxed text-[#6B6B64] md:text-xl">
              Replace the tool patchwork with one command centre: portfolio health, RAID,
              reports, and AI coaching — with human approval on every change.
            </p>
            <p className="mb-8 max-w-md text-sm font-medium text-[#1C4A2E]">
              From business case → delivery → governance → closure, without losing context.
            </p>
          </HeroCopyItem>

          <HeroCopyItem>
            <div className="flex flex-wrap items-center gap-3">
              <DxButtonLink href="/signup">Start free trial</DxButtonLink>
              <DxButtonLink href="#platform" variant="ghost">
                Watch it work
              </DxButtonLink>
            </div>
          </HeroCopyItem>

          <HeroCopyItem>
            <SocialProofStrip className="mt-8" />
          </HeroCopyItem>
        </>
      }
      right={<LandingMockupScene preview={preview} />}
    />
  );
}
