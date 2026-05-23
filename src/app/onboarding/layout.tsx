import Link from "next/link";
import type { ReactNode } from "react";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { DxStepper } from "@/components/dx/dx-stepper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF5]">
      <header className="flex h-[var(--dx-navh)] shrink-0 items-center justify-between border-b border-[#E4E4DC] bg-white px-6 md:px-11">
        <DxLogo />
        <DxStepper />
        <Link
          href="/workspace/dashboard"
          className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#A8A89E] hover:text-[#1C4A2E]"
        >
          Skip to workspace
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12">{children}</main>
      <footer className="border-t border-[#E4E4DC] py-4 text-center">
        <DxCaps className="text-[7px] text-[#A8A89E]">{user.email}</DxCaps>
      </footer>
    </div>
  );
}
