"use client";

import { RolePreview } from "@/components/marketing/role-previews";
import { MarketingContainer } from "@/components/marketing/marketing-layout";
import { ROLE_ORDER, ROLES, ROLE_PILL_LABELS } from "@/lib/marketing/landing-data";

const CAROUSEL_ROLES = ROLE_ORDER.filter((id) => id !== "po");

export function MarketingRoleCarousel() {
  const slides = [...CAROUSEL_ROLES, ...CAROUSEL_ROLES];

  return (
    <div className="relative mt-10 overflow-hidden">
      <div className="mb-5 flex items-end justify-between gap-4 px-5 md:px-10 lg:px-12">
        <div>
          <p className="font-[family-name:var(--font-mkt-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
            See every role
          </p>
          <p className="mt-1 text-sm text-[var(--mkt-text2)]">
            Six tailored dashboards — scroll to compare layouts
          </p>
        </div>
        <span className="hidden rounded-full border border-[var(--mkt-border)] bg-[var(--mkt-s2)] px-3 py-1 font-[family-name:var(--font-mkt-mono)] text-[0.625rem] text-[var(--mkt-text3)] sm:inline">
          Example · NHS EHR programme
        </span>
      </div>

      <div className="marketing-role-carousel-mask relative">
        <div className="marketing-role-carousel-track flex w-max gap-4 px-5 md:gap-5 md:px-10 lg:px-12">
          {slides.map((id, i) => {
            const role = ROLES[id];
            return (
              <div
                key={`${id}-${i}`}
                className="marketing-role-carousel-slide w-[min(85vw,340px)] shrink-0 md:w-[360px]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex size-7 items-center justify-center rounded-lg font-[family-name:var(--font-mkt-mono)] text-[0.6rem] font-semibold"
                    style={{ background: role.accentBg, color: role.accent }}
                  >
                    {role.code}
                  </span>
                  <span className="text-[0.8125rem] font-semibold text-[var(--mkt-text1)]">
                    {ROLE_PILL_LABELS[id]}
                  </span>
                </div>
                <div className="shadow-[0_20px_56px_-20px_rgba(28,74,46,0.18)]">
                  <RolePreview roleId={id} role={role} accentBorder={`${role.accent}44`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MarketingContainer className="mt-4">
        <p className="text-center text-xs text-[var(--mkt-text3)]">
          Auto-scroll pauses when you hover · Respects reduced-motion preferences
        </p>
      </MarketingContainer>
    </div>
  );
}
