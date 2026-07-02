"use client";

import { useState, type CSSProperties } from "react";
import { MarketingBadge } from "@/components/marketing/marketing-badge";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import {
  OB_DATA,
  ROLE_ORDER,
  ROLES,
  ROLE_PILL_LABELS,
  type RoleId,
} from "@/lib/marketing/landing-data";
import { roleSignupLabel, signupHrefForRole } from "@/lib/marketing/role-signup";

export function MarketingOnboardingSection() {
  const [activeRole, setActiveRole] = useState<RoleId>("sponsor");
  const role = ROLES[activeRole];
  const ob = OB_DATA[activeRole];

  return (
    <MarketingSection id="onboarding" tone="green-tint">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Personalised from day one"
          title={
            <>
              Your role. Your <em>workspace.</em>
            </>
          }
          subtitle="Honest paths per role: Sponsor starts at /project/new (business case GO gate) · PM uploads a brief at /workspace/pm-mission?onboard=1 · BA joins via a PM invite link. Select a role to see the real steps."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {ROLE_ORDER.map((id) => {
            const d = ROLES[id];
            const isActive = id === activeRole;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveRole(id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition duration-200 ${
                  isActive
                    ? "border-[var(--tab-accent)] bg-[var(--tab-accent-bg)] text-[var(--tab-accent)] shadow-[0_4px_16px_-4px_rgba(28,74,46,0.15)]"
                    : "border-[var(--mkt-border)] bg-[var(--mkt-s1)] text-[var(--mkt-text3)] hover:border-[var(--mkt-border-l)] hover:text-[var(--mkt-text2)] hover:shadow-[var(--dx-shadow-sm)]"
                }`}
                style={
                  isActive
                    ? ({
                        "--tab-accent": d.accent,
                        "--tab-accent-bg": d.accentBg,
                      } as CSSProperties)
                    : undefined
                }
              >
                <span className="font-[family-name:var(--font-mkt-mono)] text-[0.65rem] font-semibold">
                  {d.code}
                </span>
                {ROLE_PILL_LABELS[id]}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="mkt-card mkt-card-gradient p-5 md:p-6">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
              Get started path — {role.name}
            </p>
            <ol className="mkt-onboarding-path space-y-0 pl-1">
              {ob.steps.map((step) => (
                <li
                  key={step.n}
                  className={`relative flex gap-4 py-4 pl-8 first:pt-0 last:pb-0 ${
                    step.active ? "opacity-100" : step.done ? "opacity-90" : "opacity-75"
                  }`}
                >
                  <span
                    className={`absolute left-0 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-[var(--dx-shadow-sm)] ${
                      step.active
                        ? "bg-[var(--mkt-green-l)] text-white ring-4 ring-[rgba(61,150,96,0.15)]"
                        : step.done
                          ? "bg-[rgba(61,150,96,.15)] text-[var(--mkt-green-l)]"
                          : "border border-[var(--mkt-border)] bg-[var(--mkt-s1)] text-[var(--mkt-text3)]"
                    }`}
                  >
                    {step.n}
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-4 transition duration-200 hover:border-[var(--mkt-border-l)] hover:shadow-[var(--dx-shadow-sm)]">
                    <p className="text-sm font-semibold text-[var(--mkt-text1)]">{step.title}</p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mkt-card mkt-card-lift p-5 md:p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mkt-text3)]">
              AI outputs preview
            </p>
            <div className="space-y-2.5">
              {ob.outputs.map((output) => (
                <div
                  key={output.title}
                  className="flex items-start gap-3 rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-3 transition duration-200 hover:border-[var(--mkt-border-l)] hover:shadow-[var(--dx-shadow-sm)]"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg font-[family-name:var(--font-mkt-mono)] text-[0.6rem] font-semibold"
                    style={{ background: output.iconBg, color: output.iconColor }}
                  >
                    {output.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--mkt-text1)]">{output.title}</p>
                    <p className="mt-0.5 text-[0.75rem] leading-snug text-[var(--mkt-text2)]">
                      {output.sub}
                    </p>
                  </div>
                  <MarketingBadge tone={output.badgeCls}>{output.badge}</MarketingBadge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <MarketingButtonLink
            href={signupHrefForRole(activeRole)}
            variant="primary"
            className="mkt-card-lift"
          >
            {roleSignupLabel(activeRole)} →
          </MarketingButtonLink>
          <MarketingButtonLink href="/login" variant="ghost">
            Sign in
          </MarketingButtonLink>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
