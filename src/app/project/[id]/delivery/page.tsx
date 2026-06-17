import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPmDeliveryContext } from "@/services/deliveryPmContext";
import { DeliveryPmWorkspace } from "@/components/delivery-pm/delivery-pm-workspace";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ProjectDeliveryPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const context = await getPmDeliveryContext(id).catch(() => null);

  return (
    <>
      <DxPageHeader
        breadcrumb={`${project.name} · Delivery`}
        title="Delivery"
        titleEm="workspace"
        action={
          <Link href="/workspace/pm-mission" className={`${dxClass.btnGhost} text-[10px]`}>
            PM Mission Control →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <DeliveryPmWorkspace
          projectId={id}
          projectName={project.name}
          projectType={context?.project_type}
          extractionStatus={context?.extraction_status}
        />
      </div>
    </>
  );
}
