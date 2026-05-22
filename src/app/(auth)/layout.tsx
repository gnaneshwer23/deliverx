import Link from "next/link";
import type { ReactNode } from "react";
import { Grain } from "@/components/marketing/grain";
import { marketingFontClassName, marketingSans } from "@/lib/marketing-fonts";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-hidden bg-[#0a0e14] text-[#f8f6f2] ${marketingFontClassName} ${marketingSans.className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2838] via-[#0a0e14] to-[#050608]" aria-hidden />
      <Grain />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight md:text-2xl"
        >
          DeliverX
        </Link>
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.2em] text-[#9ca3af] transition hover:text-[#6ee7c7]"
        >
          ← Home
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
