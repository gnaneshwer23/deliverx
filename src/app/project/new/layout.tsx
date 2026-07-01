import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { DxLogo } from "@/components/dx/dx-logo";
import { DxStepper } from "@/components/dx/dx-stepper";
import { getOnboardingProfile, isSponsorGatewayComplete } from "@/lib/auth/onboarding";
import { resolveGatewayRedirect } from "@/services/gatewayOnboardingEngine";
import { usesSponsorGateway } from "@/config/persona-onboarding";

export default async function ProjectNewLayout({ children }: { children: ReactNode }) {
  const { user, profile, gatewayStep } = await getOnboardingProfile();

  if (!user) redirect("/login?next=/project/new");
  if (!profile?.organisation_id) redirect("/onboarding/organisation");
  if (!profile?.role) redirect("/onboarding/role");

  if (!usesSponsorGateway(profile.role) && profile.role !== "pm" && !isSponsorGatewayComplete(profile, gatewayStep)) {
    redirect("/onboarding/persona");
  }

  if (!isSponsorGatewayComplete(profile, gatewayStep)) {
    const redirectPath = resolveGatewayRedirect({
      hasOrg: true,
      hasRole: true,
      gatewayStep,
      role: profile.role,
    });
    if (redirectPath && redirectPath !== "/project/new" && profile.role !== "pm") {
      redirect(redirectPath);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--dx-page)]">
      <header className="flex h-[var(--dx-navh)] shrink-0 items-center justify-between border-b border-[#E4E4DC] bg-white px-6 md:px-11">
        <DxLogo href="/workspace/dashboard" showTag />
        <DxStepper role={profile?.role} />
        <Link
          href="/workspace/dashboard"
          className="w-24 text-right font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#6B6B64] hover:text-[#1C4A2E]"
        >
          Skip →
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
