"use client";

import { useState, type CSSProperties } from "react";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { RolePreview } from "@/components/marketing/role-previews";
import {
  ROLE_ORDER,
  ROLES,
  ROLE_PILL_LABELS,
  type RoleId,
} from "@/lib/marketing/landing-data";

export function MarketingProductSection() {
  const [activeRole, setActiveRole] = useState<RoleId>("sponsor");
  const role = ROLES[activeRole];

  return (
    <MarketingSection id="platform" className="border-y border-[var(--mkt-border)] bg-[var(--mkt-s1)]">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Platform overview"
          title={
            <>
              One workspace. <em>Seven perspectives.</em>
            </>
          }
          subtitle="Every role gets a tailored dashboard with a layout built for how they work — not the same KPI grid with different labels. One signal updates all seven views instantly."
        />

        <div className="mt-6 flex flex-wrap gap-1.5">
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
                    ? "border-[#1C4A2E] bg-[#1C4A2E] text-white ring-2 ring-[rgba(61,150,96,0.2)]"
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

        <div className="mt-4">
          <RolePreview roleId={activeRole} role={role} accentBorder={`${role.accent}55`} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Role-specific layouts",
              desc: "Founder sees a board memo. Engineer sees stories and PRs. QA sees release readiness. Each layout matches how that role actually works.",
            },
            {
              title: "AI Review Queue",
              desc: "Proposals, reports, and workspace updates require explicit approval before they apply.",
            },
            {
              title: "Connected team sync",
              desc: "One signal updates every relevant dashboard, from BA gap to Sponsor escalation.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-5"
            >
              <h3 className="text-[0.9375rem] font-semibold text-[var(--mkt-text1)]">{item.title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
