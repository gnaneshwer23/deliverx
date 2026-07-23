"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";

export type MarketingNavLink = { href: string; label: string };

export const NAV_LINKS: readonly MarketingNavLink[] = [
  { href: "/xperience", label: "Xperience" },
  { href: "/launchpad", label: "Launchpad" },
  { href: "/team-copilot", label: "Team Co-pilot" },
] as const;

function MobileNavDrawer({
  open,
  onClose,
  links,
  primaryCta,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly MarketingNavLink[];
  primaryCta: { href: string; label: string };
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[210] bg-[var(--mkt-text1)]/20 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      <nav
        id="marketing-mobile-nav"
        className="fixed inset-y-0 right-0 z-[220] flex min-h-dvh w-[min(100%,320px)] flex-col border-l border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-6 shadow-2xl md:hidden"
        aria-label="Mobile"
      >
        <div className="mb-8 flex items-center justify-between">
          <MarketingLogo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl border border-[var(--mkt-border)] text-[var(--mkt-text2)] transition hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <a
                href={link.href}
                onClick={onClose}
                className="block rounded-xl px-3 py-2.5 text-[0.9375rem] text-[var(--mkt-text2)] no-underline transition hover:bg-[var(--mkt-s2)] hover:text-[var(--mkt-text1)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--mkt-border)] pt-6">
          <MarketingButtonLink
            href="/login"
            variant="ghost"
            className="w-full justify-center"
            onClick={onClose}
          >
            Sign in
          </MarketingButtonLink>
          <MarketingButtonLink
            href={primaryCta.href}
            variant="primary"
            className="w-full justify-center"
            onClick={onClose}
          >
            {primaryCta.label}
          </MarketingButtonLink>
        </div>
      </nav>
    </>
  );
}

export function MarketingNav({
  links = NAV_LINKS,
  primaryCta = { href: "/signup", label: "Start free trial" },
}: {
  links?: readonly MarketingNavLink[];
  primaryCta?: { href: string; label: string };
} = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[200] flex h-[var(--mkt-navh)] items-center border-b border-[var(--mkt-border)] bg-[rgba(255,255,255,0.88)] px-5 backdrop-blur-xl transition-shadow duration-300 md:px-10 lg:px-12 ${
          scrolled ? "mkt-nav-scrolled" : ""
        }`}
      >
        <MarketingLogo />
        <nav className="mx-auto hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="rounded-lg px-3.5 py-1.5 text-[0.8125rem] text-[var(--mkt-text3)] no-underline transition hover:bg-[var(--mkt-s2)] hover:text-[var(--mkt-text1)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="marketing-mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-xl border border-[var(--mkt-border)] text-[var(--mkt-text2)] transition hover:bg-[var(--mkt-s2)] hover:text-[var(--mkt-text1)] md:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          </button>
          <MarketingButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
            Sign in
          </MarketingButtonLink>
          <MarketingButtonLink href={primaryCta.href} variant="primary" className="mkt-card-lift">
            {primaryCta.label}
          </MarketingButtonLink>
        </div>
      </header>
      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={links}
        primaryCta={primaryCta}
      />
    </>
  );
}
