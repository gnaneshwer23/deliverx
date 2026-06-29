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
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-[calc(var(--mkt-navh)+40px)] pb-10"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(61,150,96,0.12)_0%,transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35] [background-image:linear-gradient(var(--mkt-border)_1px,transparent_1px),linear-gradient(90deg,var(--mkt-border)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <MarketingContainer className="relative z-[1]">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(61,150,96,.35)] bg-[rgba(61,150,96,.08)] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.06em] text-[var(--mkt-green-l)]">
              <span className="size-1.5 animate-pulse rounded-full bg-[var(--mkt-green-l)]" aria-hidden />
              AI-native delivery OS
            </div>
            <h1 className="mb-5 font-[family-name:var(--font-dx-display)] text-[clamp(2.5rem,5vw,4rem)] leading-[1.06] tracking-[-0.03em] text-[var(--mkt-text1)]">
              Delivery clarity
              <br />
              for every <em className="not-italic text-[var(--mkt-green-l)]">role</em>
              <br />
              on your team.
            </h1>
            <p className="mb-9 max-w-[480px] text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-[1.7] text-[var(--mkt-text2)]">
              DeliverX is the AI-native delivery OS where Sponsors, Project Managers, Product
              Managers, Business Analysts, Engineers, QA, and Scrum Masters share one live picture.
              The Delivery Brain surfaces risks and drafts reports. Every change routes through the
              AI Review Queue before it applies.
            </p>
            <div className="mb-9 flex flex-wrap items-center gap-3">
              <MarketingButtonLink href="/signup" variant="primaryLg">
                Start free trial
              </MarketingButtonLink>
              <MarketingButtonLink href="#platform" variant="ghostLg">
                See the platform
              </MarketingButtonLink>
            </div>
            <TrustChecklist
              items={["No credit card", "15-minute setup", "GDPR ready"]}
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
                        : "border-[var(--mkt-border)] bg-[var(--mkt-s2)] text-[var(--mkt-text3)] hover:border-[var(--mkt-border-l)] hover:text-[var(--mkt-text2)]"
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
                    <span className="flex size-4 items-center justify-center rounded font-[family-name:var(--font-mkt-mono)] text-[0.55rem] font-semibold leading-none">
                      {d.code}
                    </span>
                    {ROLE_PILL_LABELS[id]}
                  </button>
                );
              })}
            </div>
            <DashboardPreview role={role} accentBorder={`${role.accent}55`} />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
