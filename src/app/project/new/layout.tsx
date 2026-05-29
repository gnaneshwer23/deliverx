import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { DxLogo } from "@/components/dx/dx-logo";
import { getOnboardingProfile } from "@/lib/auth/onboarding";

export default async function ProjectNewLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getOnboardingProfile();

  if (!user) redirect("/login?next=/project/new");
  if (!profile?.organisation_id) redirect("/onboarding/organisation");
  if (!profile?.role) redirect("/onboarding/role");

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <header className="flex h-[var(--dx-navh)] items-center justify-between border-b border-[#E4E4DC] bg-white px-6 md:px-8">
        <DxLogo href="/workspace/dashboard" showTag />
        <Link
          href="/workspace/dashboard"
          className="font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#6B6B64] hover:text-[#1C4A2E]"
        >
          ← Back to workspace
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
