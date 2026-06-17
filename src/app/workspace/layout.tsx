import type { ReactNode } from "react";
import { AppNav, AppSidebar } from "@/components/dx/app-shell";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await requireCompleteOnboarding();

  let orgName: string | null = null;
  if (profile.organisation_id) {
    const supabase = await createClient();
    const { data: org } = await supabase
      .from("organisations")
      .select("name")
      .eq("id", profile.organisation_id)
      .maybeSingle();
    orgName = org?.name ?? null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <AppNav userEmail={user.email} orgName={orgName} />
      <AppSidebar />
      <main className="ml-[var(--dx-sbw)] mt-[var(--dx-navh)] min-h-[calc(100vh-var(--dx-navh))]">
        {children}
      </main>
    </div>
  );
}
