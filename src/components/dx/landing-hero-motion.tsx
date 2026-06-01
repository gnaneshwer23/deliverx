"use client";

import type { ReactNode } from "react";
import { HeroItem, HeroMotion, MockFloat } from "@/components/dx/landing-motion";

export function LandingHeroMotion({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <section className="landing-hero relative min-h-[100svh] overflow-hidden pt-[var(--dx-navh)]">
      <div className="landing-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="landing-grain pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-var(--dx-navh))] w-full max-w-[1080px] items-center gap-12 px-6 py-14 md:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-20">
        <HeroMotion className="z-10 max-w-xl">{left}</HeroMotion>
        <MockFloat className="relative z-10 lg:pt-6">{right}</MockFloat>
      </div>
      <a
        href="#problem"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.2em] text-[#A8A89E] transition hover:text-[#1C4A2E] md:flex"
      >
        <span className="landing-scroll-hint block h-8 w-px bg-gradient-to-b from-[#1C4A2E]/40 to-transparent" />
        Explore
      </a>
    </section>
  );
}

export function HeroCopyItem({ children }: { children: ReactNode }) {
  return <HeroItem>{children}</HeroItem>;
}
