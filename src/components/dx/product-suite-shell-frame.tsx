"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DxLogo } from "@/components/dx/dx-logo";
import { GlobalSearchChrome } from "@/components/dx/global-search-chrome";
import {
  isProductSuiteNavActive,
  productSuiteNav,
} from "@/config/product-suite-nav";

export function ProductSuiteNav({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="DeliverX journey" className="min-w-0">
      <ul className="flex min-w-max items-center gap-1">
        {productSuiteNav.map((item) => {
          const active = isProductSuiteNavActive(item, pathname);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E] ${
                  active
                    ? "bg-[#EEF5F1] text-[#1C4A2E]"
                    : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0D0D0B]"
                } ${compact ? "xl:px-2 xl:text-xs" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ProductSuiteShellFrame({
  children,
  globalSearchEnabled = true,
}: {
  children: ReactNode;
  globalSearchEnabled?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[var(--dx-page)] text-[#0D0D0B]">
      <a
        href="#product-main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-md bg-[#0D0D0B] px-4 py-2 text-sm font-medium text-white transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#3D9660] focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-50 border-b border-[var(--dx-rul)] bg-white/95 shadow-[var(--dx-shadow-nav)] backdrop-blur">
        <div className="flex min-h-[60px] items-center gap-4 px-4 md:px-6">
          <div className="shrink-0 border-r border-[var(--dx-rul)] pr-4">
            <DxLogo href="/profile" />
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ProductSuiteNav />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <GlobalSearchChrome enabled={globalSearchEnabled} />
            <Link
              href="/settings/profile"
              className="hidden min-h-11 shrink-0 items-center rounded-lg px-3 text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0D0D0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E] sm:inline-flex"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>
      <div id="product-main-content" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
