"use client";

import { useState, type CSSProperties } from "react";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingContainer, TrustChecklist } from "@/components/marketing/marketing-layout";
import { trackRoleChipClick } from "@/lib/marketing/analytics";
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
            <h1 className="mb-5 font-[family-name:var(--font-dx-display)] text-[clamp(2.5rem,5vw,4rem)] leading-[1.06] tracking-[-0.03em] text-[var(--mkt-text1)]">
              AI suggests.
              <br />
              Humans decide.
              <br />
              <em className="italic text-[#3D9660]">Delivery happens.</em>
            </h1>
            <p className="mb-9 max-w-[480px] text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-[1.7] text-[var(--mkt-text2)]">
              AI surfaces risks, drafts reports, and flags blockers. Nothing applies until the team
              approves. Seven roles, one live picture.
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
            <p className="mb-2.5 text-xs font-medium text-[var(--mkt-text3)]">
              Pick your role · see your dashboard →
            </p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {ROLE_ORDER.map((id, index) => {
                const d = ROLES[id];
                const isActive = id === activeRole;
                const isFirst = index === 0;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (id !== activeRole) trackRoleChipClick(id, "hero");
                      setActiveRole(id);
                    }}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 ${
                      isActive
                        ? "border-[#1C4A2E] bg-[#1C4A2E] text-white ring-2 ring-[rgba(61,150,96,0.2)]"
                        : "border-[var(--mkt-border)] bg-[var(--mkt-s2)] text-[var(--mkt-text3)] hover:border-[var(--mkt-border-l)] hover:text-[var(--mkt-text2)]"
                    } ${isFirst ? "mkt-role-chip-pulse" : ""}`}
                    style={
                      isActive
                        ? ({
                            "--pill-accent": d.accent,
                            "--pill-accent-bg": d.accentBg,
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    <span
                      className={`flex size-4 items-center justify-center rounded font-[family-name:var(--font-mkt-mono)] text-[0.55rem] font-semibold leading-none ${
                        isActive ? "bg-white/15 text-white" : ""
                      }`}
                    >
                      {d.code}
                    </span>
                    {ROLE_PILL_LABELS[id]}
                  </button>
                );
              })}
            </div>
            <DashboardPreview role={role} roleId={activeRole} accentBorder={`${role.accent}55`} />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
