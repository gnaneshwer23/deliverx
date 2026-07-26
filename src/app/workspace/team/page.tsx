import Link from "next/link";
import { listOrgMembers } from "@/services/delivery";
import { listPendingInvitations } from "@/services/invitations";
import { getOrgActiveBootstrapProject } from "@/services/orgBootstrap";
import { ProjectBootstrapPanel } from "@/components/project/project-bootstrap-panel";
import { InviteForm } from "@/app/onboarding/invite/invite-form";
import { OrgStructurePanel } from "@/components/org-structure/panel";
import { DxBadge } from "@/components/dx/dx-badge";
import {
  WorkspacePageHeader,
  WorkspaceProductShell,
} from "@/components/professional-workspace/workspace-product-shell";

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
    <WorkspaceProductShell
      aside={
        <>
          <section>
            <h2>What matters</h2>
            <p style={{ marginTop: 8 }}>
              Membership and thin org structure only — not executive mission control.
            </p>
          </section>
          <section>
            <h2>Next</h2>
            <ul>
              <li>Review members and roles</li>
              <li>Invite teammates when needed</li>
              <li>Configure departments/teams via pilot admin if you are an org admin</li>
            </ul>
          </section>
        </>
      }
    >
      <WorkspacePageHeader
        eyebrow="Professional Workspace · Team"
        title="Team"
        lead="See members, thin org structure, and invitations. This is not executive mission control — membership and structure only."
        actions={
          <Link href="/workspace" className="pw-button secondary">
            Back to Workspace
          </Link>
        }
        context={
          <div className="pw-context-card">
            <span>Members</span>
            <strong>{members.length}</strong>
            <small>Organisation roster</small>
          </div>
        }
      />

      <div className="pw-module-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {bootstrapProject ? (
          <section style={{ gridColumn: "1 / -1" }}>
            <ProjectBootstrapPanel
              projectId={bootstrapProject.id}
              initialStatus={bootstrapProject.bootstrap_status}
              summary={bootstrapProject.bootstrap_summary}
            />
          </section>
        ) : null}

        <section className="pw-panel" style={{ gridColumn: "1 / -1" }}>
          <OrgStructurePanel />
        </section>

        <section className="pw-panel">
          <h3>Members ({members.length})</h3>
          {members.length === 0 ? (
            <p className="pw-lead" style={{ marginTop: 10 }}>
              No team members in this organisation yet.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
              {members.map((m) => (
                <li
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--pw-line)",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{m.name ?? m.email}</p>
                    <p className="pw-lead" style={{ margin: "4px 0 0", fontSize: "0.8rem" }}>
                      {m.email}
                    </p>
                  </div>
                  <DxBadge tone="accent">
                    {ROLE_LABEL[m.role ?? ""] ?? m.role ?? "Member"}
                  </DxBadge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pw-panel">
          <h3>Invite teammates</h3>
          <p className="pw-lead" style={{ marginTop: 8, marginBottom: 14 }}>
            PMs and executives can send email invitations with role assignment.
          </p>
          <InviteForm pending={pending} />
        </section>
      </div>
    </WorkspaceProductShell>
  );
}
