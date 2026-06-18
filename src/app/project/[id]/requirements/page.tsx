import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  buildTraceabilityMatrix,
  getBaProjectContext,
  listClarifications,
  listRequirements,
  listUserStories,
} from "@/services/baRequirements";
import { BaRequirementsWorkspace } from "@/components/ba/ba-requirements-workspace";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ProjectRequirementsPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const [requirements, stories, clarifications, matrix, context] = await Promise.all([
    listRequirements(id).catch(() => []),
    listUserStories(id).catch(() => []),
    listClarifications(id).catch(() => []),
    buildTraceabilityMatrix(id).catch(() => []),
    getBaProjectContext(id).catch(() => null),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb={`${project.name} · Requirements`}
        title="Requirements"
        titleEm="workspace"
        action={
          <Link href="/workspace/ba" className={`${dxClass.btnGhost} text-[10px]`}>
            BA Mission Control →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <BaRequirementsWorkspace
          projectId={id}
          projectName={project.name}
          initialRequirements={requirements}
          initialStories={stories}
          initialClarifications={clarifications}
          initialMatrix={matrix}
          projectType={context?.project_type}
        />
      </div>
    </>
  );
}
