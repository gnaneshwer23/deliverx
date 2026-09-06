import Link from "next/link";
import { listOrgAuditEvents } from "@/services/auditEvents";
import { listOrgProjects } from "@/services/delivery";
import {
  AuditProjectFilter,
  AuditTrailTimeline,
} from "@/components/approvals/audit-trail-timeline";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { resolveWorkspaceOrgProjectId } from "@/lib/professional-workspace/project-context";

export const dynamic = "force-dynamic";

export default async function AuditTrailPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  const projectId = resolveWorkspaceOrgProjectId(params.project);

  const [events, projects] = await Promise.all([
    listOrgAuditEvents({ projectId, limit: 80 }).catch(() => []),
    listOrgProjects().catch(() => []),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Governance"
        title="Responses"
        titleEm="audit"
        action={
          <Link href="/workspace/proposals" className="text-[10px] text-[#1C4A2E] hover:underline">
            AI output review →
          </Link>
        }
      />
      <div className="space-y-6 p-6 md:p-8">
        <p className="max-w-3xl text-sm text-[#6B6B64]">
          Immutable audit trail for AI suggestions, human approvals, rejections, and applied
          updates. Org-scoped and RLS-safe — every decision on AI outputs is recorded here.
        </p>

        <AuditProjectFilter projects={projects} currentProjectId={projectId} />
        <AuditTrailTimeline events={events} />
      </div>
    </>
  );
}
