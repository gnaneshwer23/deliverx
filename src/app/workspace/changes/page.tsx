import Link from "next/link";
import { getOrgGovernanceStats, listOrgChangeRequests } from "@/services/governance";
import { OrgListPage, OrgListTable, projectLink } from "@/components/workspace/org-list-shell";
import { DxBadge } from "@/components/dx/dx-badge";

export const dynamic = "force-dynamic";

export default async function WorkspaceChangesPage() {
  const [stats, changes] = await Promise.all([
    getOrgGovernanceStats(),
    listOrgChangeRequests({ limit: 200 }),
  ]);

  const open = changes.filter((c) => c.status === "draft" || c.status === "submitted");

  const rows = changes.map((c) => [
    projectLink(c.project_id, c.project_name),
    <Link
      key="title"
      href={`/project/${c.project_id}/changes`}
      className="font-medium text-[#0D0D0B] hover:text-[#1C4A2E] hover:underline"
    >
      {c.title}
    </Link>,
    <DxBadge
      key="status"
      tone={c.status === "submitted" ? "amber" : c.status === "approved" ? "green" : "slate"}
    >
      {c.status}
    </DxBadge>,
    c.impact ? (
      <span key="impact" className="line-clamp-2 max-w-xs text-[#6B6B64]">
        {c.impact}
      </span>
    ) : (
      "—"
    ),
    new Date(c.created_at).toLocaleDateString(),
  ]);

  return (
    <OrgListPage
      breadcrumb="DeliverX OS · Governance"
      title="Change"
      titleEm="requests"
      stats={[
        { label: "Open CRs", value: stats.openChanges, tone: stats.openChanges ? "amber" : "default" },
        { label: "Total logged", value: changes.length },
        { label: "Pending decisions", value: stats.pendingDecisions },
        { label: "Open risks", value: stats.openRisks },
      ]}
      empty={
        rows.length === 0
          ? {
              title: "No change requests",
              description: "Submit and track scope or delivery changes from project governance.",
              href: "/workspace/projects",
              actionLabel: "View projects",
            }
          : undefined
      }
    >
      <OrgListTable headers={["Project", "Change", "Status", "Impact", "Created"]} rows={rows} />
    </OrgListPage>
  );
}
