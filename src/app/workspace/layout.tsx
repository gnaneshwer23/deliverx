import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { WorkspaceSidebar } from "@/components/workspace/sidebar";
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
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A]">
      <WorkspaceSidebar orgName={orgName} userEmail={user.email} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
