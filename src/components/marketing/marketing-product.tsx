import {
  MarketingContainer,
  MarketingSection,
  MarketingSectionIntro,
} from "@/components/marketing/marketing-layout";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { ROLE_ORDER, ROLES } from "@/lib/marketing/landing-data";

const CAPABILITIES = [
  {
    title: "Role-specific layouts",
    desc: "Founder sees portfolio health. Engineer sees stories and PRs. QA sees release readiness. Each layout matches how that role actually works.",
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
    title: "Delivery signal graph",
    desc: "After PM approval, delivery impact events propagate to every relevant dashboard — from BA gaps to Sponsor escalation.",
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
          label="Platform capabilities"
          title={
            <>
              Approval-gated AI. <em>Role-ready views.</em>
            </>
          }
          subtitle="Requirements register, meeting intel, RAID, and persona mission controls — live on main today. Choose a role in the hero to preview an example dashboard."
        />

        <div className="mt-10 grid gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4">
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

        <MarketingButtonLink href="/signup" variant="primary" className="mt-10">
          Start free trial
        </MarketingButtonLink>
      </MarketingContainer>
    </MarketingSection>
  );
}
