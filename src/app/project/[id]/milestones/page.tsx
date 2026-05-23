import Link from "next/link";
import { listMilestones } from "@/services/milestones";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export default async function ProjectMilestonesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const milestones = await listMilestones(id);

  return (
    <>
      <DxPageHeader breadcrumb="Project · Milestones" title="Milestone" titleEm="confidence" />
      <div className="p-6 md:p-8">
        {milestones.length === 0 ? (
          <p className="text-sm text-[#6B6B64]">No milestones defined. Add via AI project setup.</p>
        ) : (
          <ul className="space-y-3">
            {milestones.map((m) => (
              <li key={m.id} className={`${dxClass.cardPad}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{m.title}</p>
                  <DxBadge tone={m.confidence_score >= 70 ? "green" : "amber"}>
                    {m.confidence_score}% confidence
                  </DxBadge>
                </div>
                {m.target_date ? (
                  <p className="mt-1 text-xs text-[#6B6B64]">
                    Target: {new Date(m.target_date).toLocaleDateString()} · {m.status}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <Link href={`/project/${id}`} className="mt-6 inline-block text-sm text-[#1C4A2E] hover:underline">
          ← Back to project
        </Link>
      </div>
    </>
  );
}
