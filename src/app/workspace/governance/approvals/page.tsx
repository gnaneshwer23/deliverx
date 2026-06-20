import Link from "next/link";
import { listPendingApprovals } from "@/services/approvals";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";
import { ApprovalActions } from "./approval-actions";

export const dynamic = "force-dynamic";

export default async function GovernanceApprovalsPage() {
  const pending = await listPendingApprovals(50);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Governance"
        title="Steering"
        titleEm="approvals"
        action={
          <Link href="/workspace/governance" className={`${dxClass.btnGhost} text-[10px]`}>
            Governance rollup →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        {pending.length === 0 ? (
          <div className={`${dxClass.cardPad} text-sm text-[#6B6B64]`}>
            No pending sponsor or steering approvals.
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((a) => (
              <li key={a.id} className={`${dxClass.cardPad}`}>
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
        )}
      </div>
    </>
  );
}
