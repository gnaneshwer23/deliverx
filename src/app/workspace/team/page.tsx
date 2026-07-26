import Link from "next/link";
import { listOrgMembers } from "@/services/delivery";
import { listPendingInvitations } from "@/services/invitations";
import { getOrgActiveBootstrapProject } from "@/services/orgBootstrap";
import { ProjectBootstrapPanel } from "@/components/project/project-bootstrap-panel";
import { InviteForm } from "@/app/onboarding/invite/invite-form";
import { OrgStructurePanel } from "@/components/org-structure/panel";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  pm: "Project Manager",
  engineer: "Engineer",
  scrum_master: "Scrum Master",
  qa: "QA / Test Manager",
  team_member: "Team member",
  executive: "Executive",
  ba: "Business Analyst",
  product_manager: "Product Manager",
};

export default async function WorkspaceTeamPage() {
  const [members, pending, bootstrapProject] = await Promise.all([
    listOrgMembers(),
    listPendingInvitations().catch(() => []),
    getOrgActiveBootstrapProject().catch(() => null),
  ]);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Professional Workspace"
        title="Team"
        subtitle="See members, thin org structure, and invitations. This is not executive mission control — membership and structure only."
        action={
          <Link href="/workspace" className={`${dxClass.btnGhost} text-[10px]`}>
            Back to Workspace
          </Link>
        }
      />
      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-2">
        {bootstrapProject ? (
          <section className="lg:col-span-2">
            <ProjectBootstrapPanel
              projectId={bootstrapProject.id}
              initialStatus={bootstrapProject.bootstrap_status}
              summary={bootstrapProject.bootstrap_summary}
            />
          </section>
        ) : null}
        <OrgStructurePanel />
        <section className={`${dxClass.cardPad}`}>
          <h2 className={`${dxClass.display} mb-4 text-lg`}>
            Members ({members.length})
          </h2>
          {members.length === 0 ? (
            <p className="text-sm text-[#6B6B64]">No team members in this organisation yet.</p>
          ) : (
            <ul className="divide-y divide-[#F0F0E8]">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{m.name ?? m.email}</p>
                    <p className="text-xs text-[#6B6B64]">{m.email}</p>
                  </div>
                  <DxBadge tone="accent">
                    {ROLE_LABEL[m.role ?? ""] ?? m.role ?? "Member"}
                  </DxBadge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className={`${dxClass.display} mb-2 text-lg`}>Invite teammates</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            PMs and executives can send email invitations with role assignment.
          </p>
          <InviteForm pending={pending} />
        </section>
      </div>
    </>
  );
}
