"use client";

import type { ReactNode } from "react";
import { HeroItem, HeroMotion, MockFloat } from "@/components/dx/landing-motion";
import { ppClass } from "@/lib/policy-pilot-theme";

export function LandingHeroMotion({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <section className={`${ppClass.hero} relative min-h-[100svh] pt-[var(--dx-navh)]`}>
      <div className="landing-pp-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-grain pointer-events-none absolute inset-0 opacity-20" aria-hidden />

      <div className="relative mx-auto grid min-h-[calc(100svh-var(--dx-navh))] w-full max-w-[1080px] items-center gap-12 px-6 py-14 md:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-20">
        <HeroMotion className="z-10 max-w-xl">{left}</HeroMotion>
        <MockFloat className="relative z-10 lg:pt-6">{right}</MockFloat>
      </div>
    </section>
  );
}

export function HeroCopyItem({ children }: { children: ReactNode }) {
  return <HeroItem>{children}</HeroItem>;
}
