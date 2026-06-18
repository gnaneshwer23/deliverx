"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { MarketingContainer } from "@/components/marketing/marketing-layout";

export const NAV_LINKS = [
  { href: "#platform", label: "Platform" },
  { href: "#loop", label: "How it works" },
  { href: "#onboarding", label: "For your role" },
  { href: "#proof", label: "Why DeliverX" },
  { href: "#pricing", label: "Pricing" },
] as const;

function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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
        className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      <nav
        id="marketing-mobile-nav"
        className="fixed inset-y-0 right-0 z-[200] flex w-[min(100%,320px)] flex-col border-l border-[var(--mkt-border)] bg-[rgba(12,12,10,.98)] p-6 shadow-2xl md:hidden"
        aria-label="Mobile"
      >
        <div className="mb-8 flex items-center justify-between">
          <MarketingLogo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-md border border-[var(--mkt-border)] text-[var(--mkt-text2)] transition hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={onClose}
                className="block rounded-md px-3 py-2.5 text-[0.9375rem] text-[var(--mkt-text2)] no-underline transition hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)]"
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
            href="/signup"
            variant="primary"
            className="w-full justify-center"
            onClick={onClose}
          >
            Start free trial
          </MarketingButtonLink>
        </div>
      </nav>
    </>
  );
}

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="marketing-mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-md border border-[var(--mkt-border)] text-[var(--mkt-text2)] transition hover:bg-[var(--mkt-s3)] hover:text-[var(--mkt-text1)] md:hidden"
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
        <MarketingButtonLink href="/signup" variant="primary">
          Start free trial
        </MarketingButtonLink>
      </div>
      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
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
          <a
            href="/privacy"
            className="text-[0.8125rem] text-[var(--mkt-text3)] no-underline transition hover:text-[var(--mkt-text2)]"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-[0.8125rem] text-[var(--mkt-text3)] no-underline transition hover:text-[var(--mkt-text2)]"
          >
            Terms of Service
          </a>
        </nav>
        <p className="text-xs text-[var(--mkt-text3)]">
          © 2026 DeliverX Ltd · GDPR-ready · EU data practices
        </p>
      </MarketingContainer>
    </footer>
  );
}
