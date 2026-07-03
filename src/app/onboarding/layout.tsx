import type { ReactNode } from "react";
import { DxCaps, DxLogo } from "@/components/dx/dx-logo";
import { DxStepper } from "@/components/dx/dx-stepper";
import { buildLoginRedirectPath } from "@/lib/auth/route-guards";
import { getOnboardingProfile } from "@/lib/auth/onboarding";
import { getRequestPathFromHeaders } from "@/lib/auth/request-path";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getOnboardingProfile();

  if (!user) {
    const nextPath = (await getRequestPathFromHeaders()) ?? "/onboarding/organisation";
    redirect(buildLoginRedirectPath(nextPath));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FB]">
      <header className="flex h-[var(--dx-navh)] shrink-0 items-center justify-between border-b border-[#E4E4DC] bg-white px-6 md:px-11">
        <DxLogo />
        <DxStepper role={profile?.role} />
        <span className="w-24" aria-hidden />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-12">{children}</main>
      <footer className="border-t border-[#E4E4DC] py-4 text-center">
        <DxCaps className="text-[7px] text-[#A8A89E]">{user.email}</DxCaps>
      </footer>
    </div>
  );
}
