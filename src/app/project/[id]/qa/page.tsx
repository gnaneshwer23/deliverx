import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQaContext } from "@/services/qaContext";
import { QaWorkspace } from "@/components/qa/qa-workspace";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ProjectQaPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const context = await getQaContext().catch(() => null);

  return (
    <>
      <DxPageHeader
        breadcrumb={`${project.name} · QA`}
        title="QA"
        titleEm="workspace"
        action={
          <Link href="/workspace/qa" className={`${dxClass.btnGhost} text-[10px]`}>
            QA Mission Control →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <QaWorkspace
          projectId={id}
          projectName={project.name}
          specialisation={context?.specialisation}
          testingTools={context?.testing_tools}
          extractionStatus={context?.extraction_status}
        />
      </div>
    </>
  );
}
