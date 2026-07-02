import Link from "next/link";
import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import {
  ROLE_ORDER,
  ROLES,
  ROLE_PILL_LABELS,
} from "@/lib/marketing/landing-data";
import { roleSignupLabel, signupHrefForRole } from "@/lib/marketing/role-signup";

export function MarketingProductSection() {
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
          subtitle="Every role gets a tailored dashboard with a layout built for how they work — not the same KPI grid with different labels. Compare what each persona sees at a glance."
        />

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

        <p className="mt-4 text-center text-xs text-[var(--mkt-text3)]">
          Want a full example dashboard? Pick your role in the hero above.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
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
              desc: "Approved delivery impact events propagate to every relevant dashboard — from BA gaps to Sponsor escalation.",
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

        <MarketingButtonLink href="/signup" variant="primary" className="mt-8">
          Start free trial →
        </MarketingButtonLink>
      </MarketingContainer>
    </MarketingSection>
  );
}
