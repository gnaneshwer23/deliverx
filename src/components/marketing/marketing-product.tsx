"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { RolePreview } from "@/components/marketing/role-previews";
import { trackRoleChipClick } from "@/lib/marketing/analytics";
import {
  ROLE_ORDER,
  ROLES,
  ROLE_PILL_LABELS,
  type RoleId,
} from "@/lib/marketing/landing-data";
import { MarketingRoleCarousel } from "@/components/marketing/marketing-role-carousel";
import { roleSignupLabel, signupHrefForRole } from "@/lib/marketing/role-signup";

const CAPABILITIES = [
  {
    title: "Role-specific layouts",
    desc: "Founder sees a board memo. Engineer sees stories and PRs. QA sees release readiness. Each layout matches how that role actually works.",
    span: "md:col-span-2 md:row-span-2",
    accent: "#1C4A2E",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="4" rx="1.5" />
        <rect x="14" y="10" width="7" height="11" rx="1.5" />
        <rect x="3" y="13" width="7" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    title: "AI Review Queue",
    desc: "Proposals, reports, and workspace updates require explicit approval before they apply.",
    span: "",
    accent: "#3D9660",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    ),
  },
  {
    title: "Connected team sync",
    desc: "Approved delivery impact events propagate to every relevant dashboard — from BA gaps to Sponsor escalation.",
    span: "",
    accent: "#60A5FA",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 12h4M14 7.5l2-1M14 16.5l2 1" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function MarketingProductSection() {
  const [activeRole, setActiveRole] = useState<RoleId>("sponsor");
  const role = ROLES[activeRole];

  return (
    <MarketingSection id="platform" tone="white">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Platform overview"
          title={
            <>
              One workspace. <em>Seven perspectives.</em>
            </>
          }
          subtitle="Every role gets a tailored dashboard with a layout built for how they work — not the same KPI grid with different labels. After PM approval, signals propagate across all seven views."
        />

        {/* Bento: vertical role rail + large preview */}
        <div className="mt-10 grid gap-4 lg:grid-cols-[220px_1fr] lg:gap-6">
          <nav
            className="flex flex-row gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
            aria-label="Role dashboards"
          >
            {ROLE_ORDER.map((id) => {
              const d = ROLES[id];
              const isActive = id === activeRole;
              return (
                <Link
                  key={id}
                  href={signupHrefForRole(id)}
                  onClick={(event) => {
                    if (!event.metaKey && !event.ctrlKey && event.button === 0) {
                      event.preventDefault();
                      const prev = activeRole;
                      setActiveRole(id);
                      if (id !== prev) trackRoleChipClick(id, "platform");
                      return;
                    }
                    trackRoleChipClick(id, "platform");
                  }}
                  className={`group flex shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition duration-200 lg:w-full lg:px-4 lg:py-3 ${
                    isActive
                      ? "border-[#1C4A2E] bg-[#1C4A2E] text-white shadow-[0_8px_32px_-8px_rgba(28,74,46,0.35)]"
                      : "border-[var(--mkt-border)] bg-[var(--mkt-s1)] hover:border-[var(--mkt-border-l)] hover:bg-white hover:shadow-[var(--dx-shadow-sm)] mkt-card-lift"
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-mkt-mono)] text-[0.65rem] font-semibold transition ${
                      isActive ? "bg-white/15 text-white" : ""
                    }`}
                    style={
                      !isActive
                        ? ({ background: d.accentBg, color: d.accent } as CSSProperties)
                        : undefined
                    }
                  >
                    {d.code}
                  </span>
                  <span className="min-w-0 hidden sm:block lg:block">
                    <span
                      className={`block text-[0.8125rem] font-semibold leading-tight ${
                        isActive ? "text-white" : "text-[var(--mkt-text1)]"
                      }`}
                    >
                      {ROLE_PILL_LABELS[id]}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-[0.625rem] ${
                        isActive ? "text-white/70" : "text-[var(--mkt-text3)]"
                      }`}
                    >
                      {d.kpis[0].val} · {d.kpis[0].label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="relative min-w-0">
            <div
              className="pointer-events-none absolute -inset-3 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(61,150,96,0.08)_0%,transparent_70%)]"
              aria-hidden
            />
            <div className="marketing-platform-preview relative shadow-[0_32px_80px_-24px_rgba(28,74,46,0.18)]">
              <RolePreview roleId={activeRole} role={role} accentBorder={`${role.accent}55`} />
            </div>
            <MarketingButtonLink
              href={signupHrefForRole(activeRole)}
              variant="primary"
              className="mt-5"
              onClick={() => trackRoleChipClick(activeRole, "platform")}
            >
              {roleSignupLabel(activeRole)} →
            </MarketingButtonLink>
          </div>
        </div>

        <MarketingRoleCarousel />

        {/* Capability bento grid */}
        <div className="mt-16 grid gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4">
          {CAPABILITIES.map((item, i) => (
            <div
              key={item.title}
              className={`mkt-card mkt-card-lift group relative overflow-hidden p-5 md:p-6 ${item.span} ${
                i === 0 ? "bg-gradient-to-br from-[#EEF5F1] to-[var(--mkt-s1)]" : ""
              }`}
            >
              <div
                className="mb-4 flex size-10 items-center justify-center rounded-xl transition group-hover:scale-105"
                style={{ background: `${item.accent}14`, color: item.accent }}
              >
                {item.icon}
              </div>
              <h3 className="text-[0.9375rem] font-semibold text-[var(--mkt-text1)] md:text-base">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">{item.desc}</p>
              {i === 0 ? (
                <div className="mt-5 flex flex-wrap gap-1.5" aria-hidden>
                  {ROLE_ORDER.slice(0, 4).map((id) => {
                    const d = ROLES[id];
                    return (
                      <span
                        key={id}
                        className="rounded-md px-2 py-1 font-[family-name:var(--font-mkt-mono)] text-[0.55rem] font-semibold"
                        style={{ background: d.accentBg, color: d.accent }}
                      >
                        {d.code}
                      </span>
                    );
                  })}
                  <span className="rounded-md bg-[var(--mkt-s3)] px-2 py-1 font-[family-name:var(--font-mkt-mono)] text-[0.55rem] text-[var(--mkt-text3)]">
                    +3 more
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
