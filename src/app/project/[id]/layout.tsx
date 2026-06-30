import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dx/app-shell";
import { requireCompleteOnboarding } from "@/lib/auth/require-onboarding";
import { createClient } from "@/lib/supabase/server";
import { getProjectAccess } from "@/lib/project-access";
import { getOrgAlertCount, getOrgAlertQueue } from "@/services/alerts";
import { listOrgProjects } from "@/services/delivery";
import { workspaceMainFullWidthClass } from "@/lib/responsive-layout";
import { ReadOnlyProjectGuard } from "@/components/project/read-only-project-guard";
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
  const access = await getProjectAccess(user.id, id);
  const readOnly = !access.canWrite;

  const [assistantProjects, alerts, alertCount] = await Promise.all([
    listOrgProjects().catch(() => []),
    getOrgAlertQueue(8).catch(() => []),
    getOrgAlertCount().catch(() => 0),
  ]);

  return (
    <div className="min-h-screen bg-[var(--dx-page)]">
      <AppShell
        userEmail={user.email}
        orgName={orgName}
        showSidebar={false}
        assistantProjects={assistantProjects}
        alerts={alerts}
        alertCount={alertCount}
      >
        <div className={`${workspaceMainFullWidthClass} flex`}>
          <ReadOnlyProjectGuard projectId={project.id} readOnly={readOnly} />
          <ProjectSidebar
            projectId={project.id}
            projectName={project.name}
            readOnly={readOnly}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <ProjectTopbar userEmail={user.email ?? null} />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </AppShell>
    </div>
  );
}
