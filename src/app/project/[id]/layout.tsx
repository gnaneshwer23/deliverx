import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppNav } from "@/components/dx/app-shell";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";
import { ProjectSidebar } from "./sidebar";
import { ProjectTopbar } from "./topbar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user } = await requireCompleteOnboarding();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, timeline, goal")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: profile } = await supabase
    .from("users")
    .select("organisations(name)")
    .single();

  const orgName = (profile?.organisations as { name?: string } | null)?.name ?? null;

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <AppNav userEmail={user.email} orgName={orgName} />
      <div className="ml-[var(--dx-sbw)] mt-[var(--dx-navh)] flex min-h-[calc(100vh-var(--dx-navh))]">
        <ProjectSidebar projectId={project.id} projectName={project.name} />
        <div className="flex min-w-0 flex-1 flex-col">
          <ProjectTopbar userEmail={user.email ?? null} />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
