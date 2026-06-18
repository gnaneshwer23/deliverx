import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEngineerContext } from "@/services/engineerContext";
import { EngineerWorkspace } from "@/components/engineer/engineer-workspace";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ProjectEngineeringPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const context = await getEngineerContext().catch(() => null);

  return (
    <>
      <DxPageHeader
        breadcrumb={`${project.name} · Engineering`}
        title="Engineering"
        titleEm="workspace"
        action={
          <Link href="/workspace/engineer" className={`${dxClass.btnGhost} text-[10px]`}>
            Engineer Mission Control →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <EngineerWorkspace
          projectId={id}
          projectName={project.name}
          specialisation={context?.specialisation}
          techStack={context?.tech_stack}
          extractionStatus={context?.extraction_status}
        />
      </div>
    </>
  );
}
