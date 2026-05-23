import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppNav, AppSidebar } from "@/components/dx/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("organisation_id, organisations(name)")
    .single();

  if (!profile?.organisation_id) redirect("/onboarding/organisation");

  const orgName = (profile.organisations as { name?: string } | null)?.name ?? null;

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
