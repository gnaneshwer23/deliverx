import Link from "next/link";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { ROLE_ORDER, ROLES, ROLE_PILL_LABELS } from "@/lib/marketing/landing-data";
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
  return (
    <MarketingSection id="platform" tone="white">
      <MarketingContainer>
        <MarketingSectionIntro
          label="Platform overview"
          title={
            <>
              Seven perspectives. <em>One platform.</em>
            </>
          }
          subtitle="Scroll through tailored dashboards for each delivery role — layouts built for how they work, not the same KPI grid with different labels."
        />

        <MarketingRoleCarousel />

        <p className="mt-4 text-center text-xs text-[var(--mkt-text3)]">
          Want to interact with a dashboard?{" "}
          <Link href="#hero" className="font-medium text-[var(--mkt-green-l)] hover:underline">
            Pick your role in the hero
          </Link>
          .
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 min-[901px]:grid-cols-4 min-[1200px]:grid-cols-7">
          {ROLE_ORDER.map((id) => {
            const role = ROLES[id];
            const headlineKpi = role.kpis[0];
            return (
              <Link
                key={id}
                href={signupHrefForRole(id)}
                className="group flex flex-col rounded-xl border border-[var(--mkt-border)] bg-[var(--mkt-s2)] p-3 transition hover:border-[var(--mkt-border-l)] hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)] min-[1200px]:p-4"
              >
                <span
                  className="mb-2.5 flex size-9 items-center justify-center self-start rounded-lg font-[family-name:var(--font-mkt-mono)] text-[0.65rem] font-semibold"
                  style={{ background: role.accentBg, color: role.accent }}
                >
                  {role.code}
                </span>
                <p className="text-[0.8125rem] font-semibold leading-tight text-[var(--mkt-text1)]">
                  {ROLE_PILL_LABELS[id]}
                </p>
                <p className="mt-1 line-clamp-2 text-[0.6875rem] leading-snug text-[var(--mkt-text3)]">
                  {role.tagline}
                </p>
                <p className="mt-auto pt-3 font-[family-name:var(--font-mkt-mono)] text-[0.625rem] text-[var(--mkt-text3)]">
                  <span className="font-semibold text-[var(--mkt-text2)]">{headlineKpi.val}</span>{" "}
                  {headlineKpi.label}
                </p>
                <span className="mt-2 text-[0.6875rem] font-medium text-[var(--mkt-green-l)] opacity-0 transition group-hover:opacity-100">
                  {roleSignupLabel(id)} →
                </span>
              </Link>
            );
          })}
        </div>

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

        <MarketingButtonLink href="/signup" variant="primary" className="mt-8">
          Start free trial →
        </MarketingButtonLink>
      </MarketingContainer>
    </MarketingSection>
  );
}
