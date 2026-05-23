import Link from "next/link";
import { getOrgGovernanceStats, listOrgRaidItems } from "@/services/governance";
import { OrgListPage, OrgListTable, projectLink } from "@/components/workspace/org-list-shell";
import { DxBadge } from "@/components/dx/dx-badge";

export const dynamic = "force-dynamic";

function severityTone(severity: string): "red" | "amber" | "green" | "slate" {
  if (severity === "critical" || severity === "high") return "red";
  if (severity === "medium") return "amber";
  return "slate";
}

export default async function WorkspaceRaidPage() {
  const [stats, items] = await Promise.all([
    getOrgGovernanceStats(),
    listOrgRaidItems({ status: ["open", "mitigated"], limit: 200 }),
  ]);

  const rows = items.map((item) => [
    projectLink(item.project_id, item.project_name),
    <span key="type" className="capitalize">
      {item.type}
    </span>,
    <Link
      key="title"
      href={`/project/${item.project_id}/raid?type=${item.type}`}
      className="text-[#0D0D0B] hover:text-[#1C4A2E] hover:underline"
    >
      {item.title}
    </Link>,
    <DxBadge key="sev" tone={severityTone(item.severity)}>
      {item.severity}
    </DxBadge>,
    <span key="status" className="capitalize">
      {item.status}
    </span>,
    item.due_date ? new Date(item.due_date).toLocaleDateString() : "—",
  ]);

  return (
    <OrgListPage
      breadcrumb="DeliverX OS · Governance"
      title="RAID"
      titleEm="log"
      stats={[
        { label: "Open risks", value: stats.openRisks, tone: stats.openRisks ? "red" : "default" },
        { label: "Open issues", value: stats.openIssues, tone: stats.openIssues ? "amber" : "default" },
        { label: "All items", value: items.length },
        { label: "Pending decisions", value: stats.pendingDecisions },
      ]}
      empty={
        rows.length === 0
          ? {
              title: "No RAID items yet",
              description: "Log risks, assumptions, issues, and dependencies from any project.",
              href: "/workspace/projects",
              actionLabel: "View projects",
            }
          : undefined
      }
    >
      <OrgListTable
        headers={["Project", "Type", "Item", "Severity", "Status", "Due"]}
        rows={rows}
      />
    </OrgListPage>
  );
}
