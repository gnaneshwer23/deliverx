import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { MarketingContainer } from "@/components/marketing/marketing-layout";

const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#loop", label: "How it works" },
  { href: "#onboarding", label: "For your role" },
  { href: "#proof", label: "Why DeliverX" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function MarketingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-[200] flex h-[var(--mkt-navh)] items-center border-b border-[var(--mkt-border)] bg-[rgba(12,12,10,.88)] px-5 backdrop-blur-xl md:px-10 lg:px-12">
      <MarketingLogo />
      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-md px-3.5 py-1.5 text-[0.8125rem] text-[var(--mkt-text3)] no-underline transition hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)]"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2 md:ml-3">
        <MarketingButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
          Sign in
        </MarketingButtonLink>
        <MarketingButtonLink href="/signup" variant="primary">
          Start free trial
        </MarketingButtonLink>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--mkt-border)] bg-[var(--mkt-s1)] px-5 py-10 md:px-10 lg:px-12">
      <MarketingContainer className="flex flex-wrap items-center justify-between gap-4">
        <MarketingLogo />
        <nav className="flex flex-wrap gap-6" aria-label="Footer">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.8125rem] text-[var(--mkt-text3)] no-underline transition hover:text-[var(--mkt-text2)]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            className="text-[0.8125rem] text-[var(--mkt-text3)] no-underline transition hover:text-[var(--mkt-text2)]"
          >
            Sign in
          </a>
        </nav>
        <p className="text-xs text-[var(--mkt-text3)]">
          © 2026 DeliverX Ltd · GDPR-ready · EU data practices
        </p>
      </MarketingContainer>
    </footer>
  );
}
