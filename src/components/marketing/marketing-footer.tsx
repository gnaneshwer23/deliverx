import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { MarketingContainer, TrustChecklist } from "@/components/marketing/marketing-layout";
import {
  DEFAULT_FOOTER_CTA,
  FOOTER_COLUMNS,
  FOOTER_LEGAL_LINKS,
} from "@/lib/marketing/footer-data";
import { mktClass } from "@/lib/marketing/landing-theme";

const FOOTER_LINK_CLASS =
  "text-[0.8125rem] text-white/75 no-underline transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50";

type FooterCta = {
  title: string;
  subtitle: string;
  href: string;
  label: string;
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
  id,
  title,
  links,
}: {
  id: string;
  title: string;
  links: readonly { href: string; label: string; note?: string; external?: boolean }[];
}) {
  const headingId = `footer-${id}`;
  return (
    <nav aria-labelledby={headingId}>
      <h3 id={headingId} className={`${mktClass.label} !text-white/55`}>
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <FooterLink href={link.href} label={link.label} external={link.external} />
            {"note" in link && link.note ? (
              <p className="mt-0.5 text-[0.6875rem] leading-snug text-white/40">{link.note}</p>
            ) : null}
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
    <footer className="overflow-hidden bg-[var(--mkt-green)] text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

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
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] xl:gap-12">
          <div className="sm:col-span-2 xl:col-span-1">
            <MarketingLogo light />
            <p
              className={`mt-5 max-w-sm text-[1.05rem] leading-snug tracking-[-0.015em] text-white ${mktClass.serif}`}
            >
              AI Product Experience Company
            </p>
            <p className="mt-3 max-w-sm text-[0.8125rem] leading-relaxed text-white/60">
              DeliverX Ltd — an evidence-driven professional growth platform. Experience, Launchpad
              and Professional Workspace share one Professional Intelligence record.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 xl:hidden" aria-label="Legal">
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn
              key={column.id}
              id={column.id}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-8 md:flex-row md:items-start md:justify-between lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
            <p className="text-xs text-white/45">© 2026 DeliverX Ltd. All rights reserved.</p>
            <ul className="hidden flex-wrap gap-x-4 gap-y-2 xl:flex" aria-label="Legal">
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={`bar-${link.href}`}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 max-w-full md:max-w-md lg:max-w-none">
            <TrustChecklist
              light
              items={[
                "Privacy export and delete",
                "Observation consent default OFF",
                "Human approval on AI changes",
              ]}
            />
          </div>
        </div>
      </MarketingContainer>
    </footer>
  );
}
