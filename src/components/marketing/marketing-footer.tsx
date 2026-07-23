import Link from "next/link";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { MarketingContainer, TrustChecklist } from "@/components/marketing/marketing-layout";
import { mktClass } from "@/lib/marketing/landing-theme";

const GITHUB_REPO = "https://github.com/gnaneshwer23/deliverx";

const FOOTER_LINK_CLASS =
  "rounded-sm text-[0.8125rem] text-[var(--mkt-text2)] no-underline transition hover:text-[var(--mkt-green-l)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mkt-green-l)]";

const FOOTER_COLUMNS = [
  {
    title: "Products",
    links: [
      { href: "/", label: "DeliverX" },
      { href: "/xperience", label: "Xperience" },
      { href: "/#pricing", label: "DeliverX pricing" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/#foundation", label: "Workspace" },
      { href: "/#workflow", label: "How it works" },
      { href: "/#onboarding", label: "Get started" },
      { href: "/#features-live", label: "What's live" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: GITHUB_REPO, label: "GitHub", external: true },
    ],
  },
] as const;

type FooterCta = {
  title: string;
  subtitle: string;
  href: string;
  label: string;
};

const DEFAULT_FOOTER_CTA: FooterCta = {
  title: "Start your free trial",
  subtitle: "30-day trial, no credit card. First project live in 15 minutes.",
  href: "/signup",
  label: "Start free trial",
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
      <a
        href={href}
        className={FOOTER_LINK_CLASS}
        target="_blank"
        rel="noopener noreferrer"
      >
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
    <div>
      <p className={mktClass.label}>{title}</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingFooter({ cta = DEFAULT_FOOTER_CTA }: { cta?: FooterCta } = {}) {
  return (
    <footer className="border-t border-[var(--mkt-border)] bg-[var(--mkt-s2)]">
      <div className="border-b border-[var(--mkt-border)] bg-gradient-to-r from-[#EEF5F1] to-[var(--mkt-s1)]">
        <MarketingContainer className="flex flex-col items-start justify-between gap-5 py-8 md:flex-row md:items-center md:py-10">
          <div className="max-w-md">
            <p className={`${mktClass.serif} text-xl tracking-[-0.02em] text-[var(--mkt-text1)]`}>
              {cta.title}
            </p>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--mkt-text2)]">
              {cta.subtitle}
            </p>
          </div>
          <MarketingButtonLink href={cta.href} variant="primary" className="mkt-card-lift">
            {cta.label}
          </MarketingButtonLink>
        </MarketingContainer>
      </div>

      <MarketingContainer className="py-10 md:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <MarketingLogo />
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-[var(--mkt-text2)]">
              <span className={`${mktClass.serif} text-[var(--mkt-text1)]`}>
                Build experience. Deliver with intelligence.
              </span>{" "}
              DeliverX platform — Xperience, Launchpad, and delivery workspace.
            </p>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DeliverX on GitHub (opens in new tab)"
              className="mt-5 inline-flex size-9 items-center justify-center rounded-xl border border-[var(--mkt-border-l)] bg-[var(--mkt-s1)] text-[var(--mkt-text2)] no-underline transition hover:border-[var(--mkt-green-l)] hover:text-[var(--mkt-green)] hover:shadow-[var(--dx-shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mkt-green-l)]"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.178 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.021C22 6.484 17.522 2 12 2Z" />
              </svg>
            </a>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>

        <div
          className="mt-10 flex flex-col gap-4 border-t border-[var(--mkt-border)] pt-8 md:flex-row md:items-center md:justify-between"
          aria-label="Footer legal"
        >
          <p className="text-xs text-[var(--mkt-text3)]">
            © 2026 DeliverX Ltd. All rights reserved.
          </p>
          <TrustChecklist
            items={["GDPR-ready infrastructure", "EU data residency practices", "Human approval on AI changes"]}
          />
        </div>
      </MarketingContainer>
    </footer>
  );
}
