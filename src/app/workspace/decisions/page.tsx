import Link from "next/link";
import { getOrgGovernanceStats, listOrgDecisions } from "@/services/governance";
import { OrgListPage, OrgListTable, projectLink } from "@/components/workspace/org-list-shell";
import { DxBadge } from "@/components/dx/dx-badge";

export const dynamic = "force-dynamic";

export default async function WorkspaceDecisionsPage() {
  const [stats, decisions] = await Promise.all([
    getOrgGovernanceStats(),
    listOrgDecisions({ limit: 200 }),
  ]);

  const pending = decisions.filter((d) => d.status === "proposed").length;

  const rows = decisions.map((d) => [
    projectLink(d.project_id, d.project_name),
    <Link
      key="title"
      href={`/project/${d.project_id}/decisions`}
      className="font-medium text-[#0D0D0B] hover:text-[#1C4A2E] hover:underline"
    >
      {d.title}
    </Link>,
    <DxBadge key="status" tone={d.status === "proposed" ? "amber" : "slate"}>
      {d.status}
    </DxBadge>,
    new Date(d.created_at).toLocaleDateString(),
  ]);

  return (
    <OrgListPage
      breadcrumb="DeliverX OS · Governance"
      title="Decisions"
      titleEm="register"
      stats={[
        { label: "Pending approval", value: pending, tone: pending ? "amber" : "default" },
        { label: "Total logged", value: decisions.length },
        { label: "Open changes", value: stats.openChanges },
        { label: "Open risks", value: stats.openRisks, tone: stats.openRisks ? "red" : "default" },
      ]}
      empty={
        rows.length === 0
          ? {
              title: "No decisions recorded",
              description: "Capture decisions from meetings or governance workflows in a project.",
              href: "/workspace/projects",
              actionLabel: "View projects",
            }
          : undefined
      }
    >
      <OrgListTable headers={["Project", "Decision", "Status", "Created"]} rows={rows} />
    </OrgListPage>
  );
}
