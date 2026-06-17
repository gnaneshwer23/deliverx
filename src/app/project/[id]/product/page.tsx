import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getPmProductContext,
  getProductStats,
} from "@/services/pmProduct";
import { ProductWorkspace } from "@/components/product/product-workspace";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function ProjectProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const [stats, context] = await Promise.all([
    getProductStats(id).catch(() => ({
      features: [],
      insights: [],
      segments: [],
      context: null,
      now: [],
      next: [],
      later: [],
      shipped: [],
    })),
    getPmProductContext(id).catch(() => null),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb={`${project.name} · Product`}
        title="Product"
        titleEm="workspace"
        action={
          <Link href="/workspace/product" className={`${dxClass.btnGhost} text-[10px]`}>
            Product Mission Control →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <ProductWorkspace
          projectId={id}
          projectName={project.name}
          initialFeatures={stats.features}
          initialInsights={stats.insights}
          initialSegments={stats.segments}
          productType={context?.product_type}
        />
      </div>
    </>
  );
}
