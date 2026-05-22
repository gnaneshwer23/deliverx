"use client";

import Link from "next/link";
import { useState } from "react";
import { ClientClock } from "@/components/marketing/client-clock";
import { marketing } from "@/lib/marketing-theme";

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#cta", label: "Get started" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[#f8f6f2] md:text-2xl"
        >
          Deliver<span className="opacity-90">X</span>
        </Link>

        <ClientClock
          dotColor={marketing.teal}
          className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#f8f6f2]/80 md:flex"
        />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#f8f6f2]"
        >
          {open ? "Close" : "Menu"}
          <span className="size-1.5 rounded-full" style={{ backgroundColor: marketing.teal }} />
        </button>
      </header>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex flex-col justify-end bg-[#0a0e14]/95 px-8 pb-16 pt-24 backdrop-blur-md md:px-16"
          role="dialog"
          aria-label="Navigation menu"
        >
          <nav className="flex flex-col gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-display)] text-4xl text-[#f8f6f2] transition hover:text-[#6ee7c7] md:text-5xl"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:gap-6">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-[#f8f6f2]/70 hover:text-[#f8f6f2]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.2em] text-[#6ee7c7]"
              >
                Start free trial
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
