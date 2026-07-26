"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { PRIMARY_NAV } from "@/lib/marketing/suite-data";

export type MarketingNavLink = { href: string; label: string };

export const NAV_LINKS: readonly MarketingNavLink[] = PRIMARY_NAV;

const DEFAULT_PRIMARY_CTA = { href: "/signup", label: "Start" } as const;

function normalizePath(path: string) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function isNavActive(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return current === target;
}

function MobileNavDrawer({
  open,
  onClose,
  links,
  pathname,
  primaryCta,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly MarketingNavLink[];
  pathname: string;
  primaryCta: { href: string; label: string };
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-[210] bg-[var(--mkt-text1)]/15 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
      />
      <nav
        id="marketing-mobile-nav"
        className="fixed inset-y-0 right-0 z-[220] flex min-h-dvh w-[min(100%,300px)] flex-col border-l border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-6 lg:hidden"
        aria-label="Mobile"
      >
        <div className="mb-10 flex items-center justify-between gap-3">
          <MarketingLogo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-11 shrink-0 items-center justify-center text-[var(--mkt-text2)] transition hover:text-[var(--mkt-text1)]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ul className="flex flex-col gap-0.5">
          {links.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <li key={`${link.href}-${link.label}`}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`block px-1 py-3 text-[0.9375rem] no-underline transition ${
                    active
                      ? "font-medium text-[var(--mkt-text1)]"
                      : "text-[var(--mkt-text2)] hover:text-[var(--mkt-text1)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
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
  links,
  primaryCta = DEFAULT_PRIMARY_CTA,
}: {
  links?: readonly MarketingNavLink[];
  primaryCta?: { href: string; label: string };
  /** @deprecated Products dropdown removed — primary IA is flat. */
  showProductsDropdown?: boolean;
} = {}) {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonId = useId();

  const resolvedLinks = links ?? NAV_LINKS;
  const resolvedCta = primaryCta ?? DEFAULT_PRIMARY_CTA;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[200] flex h-[var(--mkt-navh)] items-center border-b px-4 transition-[background-color,border-color,box-shadow] duration-300 sm:px-5 md:px-10 lg:px-12 ${
          scrolled
            ? "mkt-nav-scrolled border-[var(--mkt-border)] bg-[rgba(255,255,255,0.92)] backdrop-blur-xl"
            : "border-transparent bg-[rgba(246,248,246,0.72)] backdrop-blur-md"
        }`}
      >
        <MarketingLogo />
        <nav
          className="mx-auto hidden min-w-0 items-center justify-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {resolvedLinks.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap px-2.5 py-1.5 text-[0.8125rem] no-underline transition-colors lg:px-3 ${
                  active
                    ? "font-medium text-[var(--mkt-text1)]"
                    : "text-[var(--mkt-text3)] hover:text-[var(--mkt-text1)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-3 md:gap-1.5">
          <button
            type="button"
            id={menuButtonId}
            aria-expanded={mobileOpen}
            aria-controls="marketing-mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-11 items-center justify-center text-[var(--mkt-text2)] transition hover:text-[var(--mkt-text1)] lg:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          </button>
          <MarketingButtonLink href="/login" variant="ghost" className="hidden lg:inline-flex">
            Sign in
          </MarketingButtonLink>
          <MarketingButtonLink
            href={resolvedCta.href}
            variant="primary"
            className="min-w-[4.75rem] justify-center"
          >
            {resolvedCta.label}
          </MarketingButtonLink>
        </div>
      </header>
      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={resolvedLinks}
        pathname={pathname}
        primaryCta={resolvedCta}
      />
    </>
  );
}
