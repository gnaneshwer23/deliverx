"use client";

import Link from "next/link";
import { useState } from "react";
import { DxButtonLink } from "@/components/dx/dx-button";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#platform", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
  { href: "#price", label: "Pricing" },
] as const;

export function LandingMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="landing-mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center border border-[#E4E4DC] bg-white font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wider text-[#0D0D0B]"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open ? (
        <nav
          id="landing-mobile-menu"
          className="absolute left-4 right-4 top-[calc(var(--dx-navh)+4px)] z-50 border border-[#E4E4DC] bg-white/95 p-4 shadow-[0_20px_60px_-20px_rgba(13,13,11,0.2)] backdrop-blur-xl"
          aria-label="Mobile"
        >
          <ul className="space-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block font-[family-name:var(--font-dx-mono)] text-[11px] uppercase tracking-[0.16em] text-[#6B6B64] hover:text-[#0D0D0B]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-[#F0F0E8] pt-4">
            <DxButtonLink href="/signup" className="w-full justify-center">
              Join the pilot
            </DxButtonLink>
            <Link
              href="/login"
              className="text-center font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-[0.14em] text-[#6B6B64]"
            >
              Sign in
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
