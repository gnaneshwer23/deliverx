import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getScrumContext } from "@/services/scrumContext";
import { ScrumWorkspace } from "@/components/scrum/scrum-workspace";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ProjectScrumPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const context = await getScrumContext().catch(() => null);

  return (
    <>
      <DxPageHeader
        breadcrumb={`${project.name} · Scrum`}
        title="Scrum"
        titleEm="workspace"
        action={
          <Link href="/workspace/scrum-mission" className={`${dxClass.btnGhost} text-[10px]`}>
            Scrum Mission Control →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <ScrumWorkspace
          projectId={id}
          projectName={project.name}
          agileFramework={context?.agile_framework}
          teamConfig={context?.team_config}
          extractionStatus={context?.extraction_status}
        />
      </div>
    </>
  );
}
