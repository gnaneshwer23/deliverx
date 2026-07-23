"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { MarketingButtonLink } from "@/components/marketing/marketing-buttons";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { PRODUCT_LINKS, SITE_NAV } from "@/lib/marketing/suite-data";

export type MarketingNavLink = { href: string; label: string };

export const NAV_LINKS: readonly MarketingNavLink[] = [
  ...SITE_NAV.links,
] as const;

function ProductsDropdown({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-[0.8125rem] text-[var(--mkt-text3)] transition-colors hover:text-[var(--mkt-text1)]"
      >
        Products
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 min-w-[240px] border border-[var(--mkt-border)] bg-[var(--mkt-s1)] py-2 shadow-[0_12px_40px_rgba(13,13,11,0.08)]"
        >
          {PRODUCT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => onOpenChange(false)}
              className="block px-4 py-2.5 no-underline transition-colors hover:bg-[rgba(61,150,96,0.05)]"
            >
              <span className="block text-[0.875rem] text-[var(--mkt-text1)]">{link.label}</span>
              <span className="mt-0.5 block text-[0.75rem] text-[var(--mkt-text3)]">
                {link.stage}
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileNavDrawer({
  open,
  onClose,
  links,
  primaryCta,
  showProducts = true,
}: {
  open: boolean;
  onClose: () => void;
  links: readonly MarketingNavLink[];
  primaryCta: { href: string; label: string };
  showProducts?: boolean;
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
        className="fixed inset-0 z-[210] bg-[var(--mkt-text1)]/15 backdrop-blur-[2px] md:hidden"
        onClick={onClose}
      />
      <nav
        id="marketing-mobile-nav"
        className="fixed inset-y-0 right-0 z-[220] flex min-h-dvh w-[min(100%,300px)] flex-col border-l border-[var(--mkt-border)] bg-[var(--mkt-s1)] p-6 md:hidden"
        aria-label="Mobile"
      >
        <div className="mb-10 flex items-center justify-between">
          <MarketingLogo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex size-9 items-center justify-center text-[var(--mkt-text2)] transition hover:text-[var(--mkt-text1)]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ul className="flex flex-col gap-0.5">
          {showProducts ? (
            <li className="mb-3 border-b border-[var(--mkt-border)] pb-3">
              <p className="px-1 pb-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--mkt-text3)]">
                Products
              </p>
              {PRODUCT_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="block px-1 py-2 text-[0.9375rem] text-[var(--mkt-text2)] no-underline transition hover:text-[var(--mkt-text1)]"
                >
                  {link.label}
                  <span className="mt-0.5 block text-[0.75rem] text-[var(--mkt-text3)]">
                    {link.stage}
                  </span>
                </a>
              ))}
            </li>
          ) : null}
          {links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <a
                href={link.href}
                onClick={onClose}
                className="block px-1 py-2.5 text-[0.9375rem] text-[var(--mkt-text2)] no-underline transition hover:text-[var(--mkt-text1)]"
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
            Sign In
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
  primaryCta = { href: "/signup", label: "Start Free" },
  showProductsDropdown = true,
}: {
  links?: readonly MarketingNavLink[];
  primaryCta?: { href: string; label: string };
  /** When false, only render the provided flat links (e.g. product pages). */
  showProductsDropdown?: boolean;
} = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const useSiteNav = links === undefined;
  const resolvedLinks = useSiteNav ? NAV_LINKS : links;
  const dropdown = useSiteNav && showProductsDropdown;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[200] flex h-[var(--mkt-navh)] items-center border-b px-5 transition-[background-color,border-color,box-shadow] duration-300 md:px-10 lg:px-12 ${
          scrolled
            ? "mkt-nav-scrolled border-[var(--mkt-border)] bg-[rgba(255,255,255,0.92)] backdrop-blur-xl"
            : "border-transparent bg-[rgba(247,249,247,0.72)] backdrop-blur-md"
        }`}
      >
        <MarketingLogo />
        <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {dropdown ? <ProductsDropdown open={productsOpen} onOpenChange={setProductsOpen} /> : null}
          {resolvedLinks.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="px-3 py-1.5 text-[0.8125rem] text-[var(--mkt-text3)] no-underline transition-colors hover:text-[var(--mkt-text1)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 md:ml-3">
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="marketing-mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-9 items-center justify-center text-[var(--mkt-text2)] transition hover:text-[var(--mkt-text1)] md:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          </button>
          <MarketingButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
            Sign In
          </MarketingButtonLink>
          <MarketingButtonLink href={primaryCta.href} variant="primary">
            {primaryCta.label}
          </MarketingButtonLink>
        </div>
      </header>
      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={resolvedLinks}
        primaryCta={primaryCta}
        showProducts={dropdown}
      />
    </>
  );
}
