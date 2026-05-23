import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import type { ClosurePackage } from "@/services/closurePackage";
import { ClosurePackagePanel } from "./closure-panel";

export default async function ProjectClosurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, status, closure_package")
    .eq("id", id)
    .single();

  const existing = (project?.closure_package as ClosurePackage | null) ?? null;

  return (
    <>
      <DxPageHeader
        breadcrumb={`${project?.name ?? "Project"} · Closure`}
        title="Closure"
        titleEm="package"
      />
      <div className="p-6 md:p-8">
        <p className="mb-4 text-sm text-[#6B6B64]">
          AI generates planned vs actual, outcomes, benefits, and lessons learned for PM review
          before publish.
        </p>
        <ClosurePackagePanel projectId={id} existing={existing} />
        <Link href={`/project/${id}`} className="mt-6 inline-block text-sm text-[#1C4A2E] hover:underline">
          ← Back to project
        </Link>
      </div>
    </>
  );
}
