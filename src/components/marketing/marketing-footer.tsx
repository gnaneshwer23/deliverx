import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { MarketingContainer, TrustChecklist } from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";

const GITHUB_REPO = "https://github.com/gnaneshwer23/deliverx";

const FOOTER_LINK_CLASS =
  "text-[0.8125rem] text-white/75 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50";

const FOOTER_COLUMNS = [
  {
    title: "Products",
    links: [
      { href: "/", label: "Home" },
      { href: "/experience", label: "Experience" },
      { href: "/launchpad", label: "Launchpad" },
      { href: "/team-copilot", label: "Team Co-pilot" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#journey", label: "How it works" },
      { href: "/solutions", label: "Solutions" },
      { href: "/resources", label: "Resources" },
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/pricing#bundle", label: "Complete Journey" },
      { href: "/signup", label: "Start your journey" },
      { href: "/login", label: "Log in" },
    ],
  },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: GITHUB_REPO, label: "GitHub", external: true },
] as const;

type FooterCta = {
  title: string;
  subtitle: string;
  href: string;
  label: string;
};

const DEFAULT_FOOTER_CTA: FooterCta = {
  title: "Start with DeliverX",
  subtitle: "Experience, Launchpad or Team Co-pilot — open pricing, or create an account.",
  href: "/pricing",
  label: "View pricing",
};

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} className={FOOTER_LINK_CLASS} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={FOOTER_LINK_CLASS}>
      {label}
    </Link>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string; external?: boolean }[];
}) {
  return (
    <nav aria-label={title}>
      <p className={`${mktClass.label} !text-white/55`}>{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MarketingFooter({
  cta = DEFAULT_FOOTER_CTA,
}: {
  /** Pass `null` to omit the CTA band (e.g. when the page already ends with a strong CTA). */
  cta?: FooterCta | null;
} = {}) {
  return (
    <footer className="overflow-hidden bg-[var(--mkt-green)] text-white">
      {cta ? (
        <div className="border-b border-white/10 bg-[rgba(255,255,255,0.04)]">
          <MarketingContainer className="flex flex-col items-start justify-between gap-5 py-10 md:flex-row md:items-center md:py-12">
            <div className="max-w-md">
              <p className={`${mktClass.serif} text-[1.35rem] tracking-[-0.02em] text-white`}>
                {cta.title}
              </p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-white/70">{cta.subtitle}</p>
            </div>
            <MarketingButtonLink href={cta.href} variant="ctaLight">
              {cta.label}
            </MarketingButtonLink>
          </MarketingContainer>
        </div>
      ) : null}

      <MarketingContainer className="py-12 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] lg:gap-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <MarketingLogo light />
            <p
              className={`mt-5 max-w-sm text-[1.05rem] leading-snug tracking-[-0.015em] text-white ${mktClass.serif}`}
            >
              AI Product Experience Company
            </p>
            <p className="mt-3 max-w-sm text-[0.8125rem] leading-relaxed text-white/60">
              DeliverX Ltd — an AI-powered professional growth platform. Experience, Launchpad and
              Team Co-pilot.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>

        <div
          className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between"
          aria-label="Footer legal"
        >
          <p className="text-xs text-white/45">© 2026 DeliverX Ltd. All rights reserved.</p>
          <TrustChecklist
            light
            items={[
              "GDPR-ready infrastructure",
              "EU data residency practices",
              "Human approval on AI changes",
            ]}
          />
        </div>
      </MarketingContainer>
    </footer>
  );
}
