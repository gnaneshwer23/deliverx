import Link from "next/link";
import { OrgListTable, projectLink } from "@/components/workspace/org-list-shell";
import { DxStatusPill, severityToPillTone } from "@/components/dx/dx-status-pill";
import { dxClass } from "@/lib/dx-theme";
import { ApprovalActions } from "@/app/workspace/governance/approvals/approval-actions";
import type { listOrgChangeRequests, listOrgDecisions, listOrgRaidItems } from "@/services/governance";
import type { listPendingApprovals } from "@/services/approvals";

type OrgRaidItem = Awaited<ReturnType<typeof listOrgRaidItems>>[number];
type OrgDecision = Awaited<ReturnType<typeof listOrgDecisions>>[number];
type OrgChangeRequest = Awaited<ReturnType<typeof listOrgChangeRequests>>[number];
type PendingApproval = Awaited<ReturnType<typeof listPendingApprovals>>[number];

function governanceStatusPillTone(status: string): "proposed" | "submitted" | "approved" | "pending" | "slate" {
  const s = status.toLowerCase();
  if (s === "proposed") return "proposed";
  if (s === "submitted") return "submitted";
  if (s === "approved") return "approved";
  if (s === "open" || s === "mitigated" || s === "pending") return "pending";
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
    <DxStatusPill key="sev" tone={severityToPillTone(item.severity)} size="xs">
      {item.severity}
    </DxStatusPill>,
    <DxStatusPill key="status" tone={governanceStatusPillTone(item.status)} size="xs">
      {item.status}
    </DxStatusPill>,
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
    <DxStatusPill key="status" tone={governanceStatusPillTone(d.status)} size="xs">
      {d.status}
    </DxStatusPill>,
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
    <DxStatusPill key="status" tone={governanceStatusPillTone(c.status)} size="xs">
      {c.status}
    </DxStatusPill>,
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
