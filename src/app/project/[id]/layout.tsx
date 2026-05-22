import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SovereignFonts } from "@/components/sovereign/sovereign-fonts";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, delivery_type, timeline, goal")
    .eq("id", id)
    .single();

  if (!project) notFound();

  return (
    <SovereignFonts className="flex h-screen bg-[#0a0e14] text-[#f8f6f2]">
      <ProjectSidebar projectId={project.id} projectName={project.name} />
      <div className="flex flex-1 flex-col bg-[#f5f2ed] text-[#1a1a1a]">
        <ProjectTopbar userEmail={user.email ?? null} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </SovereignFonts>
  );
}
