import Link from "next/link";
import { OrgListTable, projectLink } from "@/components/workspace/org-list-shell";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";
import { ApprovalActions } from "@/app/workspace/governance/approvals/approval-actions";
import type { listOrgChangeRequests, listOrgDecisions, listOrgRaidItems } from "@/services/governance";
import type { listPendingApprovals } from "@/services/approvals";

type OrgRaidItem = Awaited<ReturnType<typeof listOrgRaidItems>>[number];
type OrgDecision = Awaited<ReturnType<typeof listOrgDecisions>>[number];
type OrgChangeRequest = Awaited<ReturnType<typeof listOrgChangeRequests>>[number];
type PendingApproval = Awaited<ReturnType<typeof listPendingApprovals>>[number];

function severityTone(severity: string): "red" | "amber" | "green" | "slate" {
  if (severity === "critical" || severity === "high") return "red";
  if (severity === "medium") return "amber";
  return "slate";
}

export function GovernanceRisksPanel({ items }: { items: OrgRaidItem[] }) {
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
    <OrgListTable
      headers={["Project", "Type", "Item", "Severity", "Status", "Due"]}
      rows={rows}
    />
  );
}

export function GovernanceDecisionsPanel({ decisions }: { decisions: OrgDecision[] }) {
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
    <OrgListTable headers={["Project", "Decision", "Status", "Created"]} rows={rows} />
  );
}

export function GovernanceChangesPanel({ changes }: { changes: OrgChangeRequest[] }) {
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
    <OrgListTable headers={["Project", "Change", "Status", "Impact", "Created"]} rows={rows} />
  );
}

export function GovernanceApprovalsPanel({ pending }: { pending: PendingApproval[] }) {
  return (
    <ul className="space-y-3">
      {pending.map((a) => (
        <li key={a.id} className={dxClass.cardPad}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium capitalize">
                {a.entity_type} — {a.approval_level} approval
              </p>
              <Link
                href={`/project/${a.project_id}`}
                className="text-sm text-[#1C4A2E] hover:underline"
              >
                {a.project_name}
              </Link>
              {a.notes ? <p className="mt-1 text-xs text-[#6B6B64]">{a.notes}</p> : null}
            </div>
            <ApprovalActions approvalId={a.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
