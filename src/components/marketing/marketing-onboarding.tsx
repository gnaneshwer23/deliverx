"use client";

import { useState, type CSSProperties } from "react";
import { MarketingBadge } from "@/components/marketing/marketing-badge";
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

export function MarketingOnboardingSection() {
  const [activeRole, setActiveRole] = useState<RoleId>("sponsor");
  const role = ROLES[activeRole];
  const ob = OB_DATA[activeRole];

  return (
    <MarketingSection id="onboarding">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Personalised from day one"
          title={
            <>
              Your role. Your <em>workspace.</em>
            </>
          }
          subtitle="Select your role and DeliverX generates a personalised workspace in under 60 seconds — tailored KPIs, guided tasks, and AI agents calibrated to how you work."
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
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "border-[var(--tab-accent)] bg-[var(--tab-accent-bg)] text-[var(--tab-accent)]"
                    : "border-[#2E2E30] bg-[#18181A] text-[#7A7874] hover:text-[#B8B5AF]"
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
                <span>{d.code}</span>
                {ROLE_PILL_LABELS[id]}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 rounded-2xl border border-[#2E2E30] bg-[#111110] p-5 md:grid-cols-2 md:gap-8 md:p-6">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#7A7874]">
              Onboarding steps — {role.name}
            </p>
            <ol className="space-y-0">
              {ob.steps.map((step) => (
                <li
                  key={step.n}
                  className={`flex gap-4 border-b border-[#2E2E30] py-4 last:border-b-0 ${
                    step.active ? "opacity-100" : step.done ? "opacity-80" : "opacity-60"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      step.active
                        ? "bg-[#3D9660] text-white"
                        : step.done
                          ? "bg-[rgba(61,150,96,.15)] text-[#3D9660]"
                          : "bg-[#222224] text-[#7A7874]"
                    }`}
                  >
                    {step.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#F0EDE8]">{step.title}</p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-[#7A7874]">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-[#2E2E30] bg-[#18181A] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#7A7874]">
              AI outputs preview
            </p>
            <div className="space-y-2">
              {ob.outputs.map((output) => (
                <div
                  key={output.title}
                  className="flex items-start gap-3 rounded-lg border border-[#2E2E30] bg-[#111110] p-3"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ background: output.iconBg, color: output.iconColor }}
                  >
                    {output.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F0EDE8]">{output.title}</p>
                    <p className="mt-0.5 text-[0.75rem] leading-snug text-[#7A7874]">
                      {output.sub}
                    </p>
                  </div>
                  <MarketingBadge tone={output.badgeCls}>{output.badge}</MarketingBadge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
