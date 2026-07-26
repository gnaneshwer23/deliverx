"use client";

import Link from "next/link";
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
import { roleMissionControlCta, signupHrefForRole } from "@/lib/marketing/role-signup";

export function MarketingHero() {
  const [activeRole, setActiveRole] = useState<RoleId>("sponsor");
  const role = ROLES[activeRole];

  return (
    <section
      id="hero"
      className="relative flex min-h-0 flex-col justify-center overflow-hidden bg-[var(--mkt-ink)] pt-[calc(var(--mkt-navh)+32px)] pb-12 md:pb-14 lg:min-h-[calc(100svh-var(--mkt-navh))] lg:pb-10"
    >
      <div className="pointer-events-none absolute inset-0 z-0 mkt-hero-mesh" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 z-0 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(61,150,96,0.12)_0%,transparent_70%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 z-0 size-[360px] rounded-full bg-[radial-gradient(circle,rgba(28,74,46,0.08)_0%,transparent_70%)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.3] [background-image:linear-gradient(var(--mkt-border)_1px,transparent_1px),linear-gradient(90deg,var(--mkt-border)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <MarketingContainer className="relative z-[1]">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(61,150,96,0.25)] bg-[rgba(61,150,96,0.08)] px-3.5 py-1 font-[family-name:var(--font-mkt-mono)] text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--mkt-green-l)]">
              <span className="size-1.5 rounded-full bg-[var(--mkt-green-l)] shadow-[0_0_8px_rgba(61,150,96,0.6)]" aria-hidden />
              Delivery intelligence platform
            </p>
            <h1 className="mb-5 font-[family-name:var(--font-dx-display)] text-[clamp(2.75rem,5.5vw,4.5rem)] leading-[1.02] tracking-[-0.035em] text-[var(--mkt-text1)]">
              AI suggests.
              <br />
              Humans decide.
              <br />
              <em className="italic text-[#3D9660]">Delivery happens.</em>
            </h1>
            <p className="mb-9 max-w-[480px] text-[clamp(0.9375rem,1.5vw,1.0625rem)] font-light leading-[1.65] text-[var(--mkt-text2)]">
              Teams lose hours reconciling Slack, Jira, and decks that never align. DeliverX connects{" "}
              <span className="font-medium text-[var(--mkt-green)]">seven delivery roles</span> in one
              signal graph. AI drafts updates; your team approves before anything applies.
            </p>
            <div className="mb-9 flex flex-wrap items-center gap-3">
              <MarketingButtonLink href="/signup" variant="primaryLg" className="mkt-card-lift">
                Join the pilot
              </MarketingButtonLink>
              <a
                href="#onboarding"
                className="text-sm font-medium text-[var(--mkt-text2)] underline-offset-4 transition hover:text-[var(--mkt-green-l)] hover:underline"
              >
                Explore role onboarding
              </a>
            </div>
            <TrustChecklist
              pills
              items={["No credit card", "15-minute setup", "GDPR-ready"]}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-0 max-[900px]:order-first">
            <p className="mb-2.5 text-xs font-medium text-[var(--mkt-text3)]">
              Choose your role · example dashboard preview
            </p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {ROLE_ORDER.map((id, index) => {
                const d = ROLES[id];
                const isActive = id === activeRole;
                const isFirst = index === 0;
                return (
                  <Link
                    key={id}
                    href={signupHrefForRole(id)}
                    onClick={(event) => {
                      if (!event.metaKey && !event.ctrlKey && event.button === 0) {
                        event.preventDefault();
                        const prev = activeRole;
                        setActiveRole(id);
                        if (id !== prev) trackRoleChipClick(id, "hero");
                        return;
                      }
                      trackRoleChipClick(id, "hero");
                    }}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 ${
                      isActive
                        ? "border-[#1C4A2E] bg-[#1C4A2E] text-white ring-2 ring-[rgba(61,150,96,0.2)] shadow-[0_8px_24px_-8px_rgba(28,74,46,0.35)]"
                        : "border-[var(--mkt-border)] bg-[var(--mkt-s1)] text-[var(--mkt-text3)] hover:border-[var(--mkt-border-l)] hover:text-[var(--mkt-text2)] hover:shadow-[var(--dx-shadow-sm)]"
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
                  </Link>
                );
              })}
            </div>
            <div className="mkt-hero-float min-w-0 rounded-2xl shadow-[0_32px_80px_-24px_rgba(28,74,46,0.22)]">
              <DashboardPreview role={role} roleId={activeRole} accentBorder={`${role.accent}55`} />
            </div>
            <MarketingButtonLink
              href={signupHrefForRole(activeRole)}
              variant="ghost"
              className="mt-4 w-full justify-center sm:w-auto"
              onClick={() => trackRoleChipClick(activeRole, "hero")}
            >
              {roleMissionControlCta(activeRole)}
            </MarketingButtonLink>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
