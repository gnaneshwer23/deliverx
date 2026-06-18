"use client";

import { useState, type CSSProperties } from "react";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer, TrustChecklist } from "@/components/marketing/marketing-layout";
import {
  ROLE_ORDER,
  ROLES,
  ROLE_PILL_LABELS,
  type RoleId,
} from "@/lib/marketing/landing-data";

export function MarketingHero() {
  const [activeRole, setActiveRole] = useState<RoleId>("sponsor");
  const role = ROLES[activeRole];

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-[calc(var(--mkt-navh)+40px)] pb-16"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(28,74,46,.35)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(#2E2E30_1px,transparent_1px),linear-gradient(90deg,#2E2E30_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <MarketingContainer className="relative z-[1]">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(61,150,96,.3)] bg-[rgba(61,150,96,.1)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.06em] text-[#3D9660]"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-[#3D9660]" aria-hidden />
              AI Delivery Intelligence
            </div>
            <h1 className="mb-5 font-[family-name:var(--font-dx-display)] text-[clamp(2.5rem,5vw,4rem)] leading-[1.06] tracking-[-0.03em] text-[#F0EDE8]">
              Every role.
              <br />
              One <em className="not-italic text-[#3D9660]">connected</em>
              <br />
              workspace.
            </h1>
            <p className="mb-9 max-w-[480px] text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-[1.7] text-[#B8B5AF]">
              From business case to closure — AI surfaces risks, drafts reports, and keeps
              Sponsors, PMs, BAs, Engineers, QA, and Scrum Masters in sync. Human approval on
              every change.
            </p>
            <div className="mb-9 flex flex-wrap items-center gap-3">
              <MarketingButtonLink href="/signup" variant="primaryLg">
                Start free trial
              </MarketingButtonLink>
              <MarketingButtonLink href="#loop" variant="ghostLg">
                See how it works
              </MarketingButtonLink>
            </div>
            <TrustChecklist
              items={["No credit card", "15-min setup", "GDPR ready"]}
            />
          </div>

          <div className="flex flex-col gap-0 max-[900px]:order-first">
            <div className="mb-4 flex flex-wrap gap-1.5">
              {ROLE_ORDER.map((id) => {
                const d = ROLES[id];
                const isActive = id === activeRole;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveRole(id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 ${
                      isActive
                        ? "border-[var(--pill-accent)] bg-[var(--pill-accent-bg)] text-[var(--pill-accent)]"
                        : "border-[#2E2E30] bg-[#18181A] text-[#7A7874] hover:border-[#3A3A3C] hover:text-[#B8B5AF]"
                    }`}
                    style={
                      isActive
                        ? ({
                            "--pill-accent": d.accent,
                            "--pill-accent-bg": d.accentBg,
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    <span className="text-[0.9rem] leading-none">{d.code}</span>
                    {ROLE_PILL_LABELS[id]}
                  </button>
                );
              })}
            </div>
            <DashboardPreview role={role} accentBorder={`${role.accent}44`} />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
