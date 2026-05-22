import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { Grain } from "@/components/marketing/grain";
import { SovereignFonts } from "@/components/sovereign/sovereign-fonts";
import { SovereignStepper } from "@/components/sovereign/sovereign-stepper";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SovereignFonts className="flex min-h-screen flex-col bg-[#0a0e14] text-[#f8f6f2]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2838] via-[#0a0e14] to-[#050608]" aria-hidden />
      <Grain />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-xl tracking-tight md:text-2xl"
          >
            DeliverX
          </Link>
          <span className="text-[11px] uppercase tracking-[0.15em] text-[#9ca3af]">
            {user.email}
          </span>
        </div>
        <div className="mx-auto max-w-4xl overflow-x-auto px-6 pb-5">
          <SovereignStepper />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center bg-[#f5f2ed] px-4 py-10 text-[#1a1a1a]">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </SovereignFonts>
  );
}
