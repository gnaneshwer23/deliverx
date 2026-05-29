import type { ReactNode } from "react";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { DxStepper } from "@/components/dx/dx-stepper";
import { getOnboardingProfile } from "@/lib/auth/onboarding";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getOnboardingProfile();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF5]">
      <header className="flex h-[var(--dx-navh)] shrink-0 items-center justify-between border-b border-[#E4E4DC] bg-white px-6 md:px-11">
        <DxLogo />
        <DxStepper />
        <span className="w-24" aria-hidden />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12">{children}</main>
      <footer className="border-t border-[#E4E4DC] py-4 text-center">
        <DxCaps className="text-[7px] text-[#A8A89E]">{user.email}</DxCaps>
      </footer>
    </div>
  );
}
