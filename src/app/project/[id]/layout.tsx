import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
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
    <div className="flex h-screen bg-[#F5F7FB] text-[#0F172A]">
      <ProjectSidebar projectId={project.id} projectName={project.name} />
      <div className="flex flex-1 flex-col">
        <ProjectTopbar userEmail={user.email ?? null} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
