import type { ReactNode } from "react";
import { AppNav, AppSidebar } from "@/components/dx/app-shell";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireCompleteOnboarding();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("users")
    .select("organisations(name)")
    .eq("id", user.id)
    .single();

  const orgName = (profile?.organisations as { name?: string } | null)?.name ?? null;

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
