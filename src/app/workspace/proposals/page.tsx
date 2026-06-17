import Link from "next/link";
import { listPendingProposals } from "@/services/proposedActions";
import { ProposalsQueuePanel } from "@/components/proposals/proposals-queue-panel";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const proposals = await listPendingProposals(50);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX OS · Automation"
        title="Proposal"
        titleEm="queue"
        action={
          <Link href="/workspace/governance/approvals" className={`${dxClass.btnGhost} text-[10px]`}>
            Steering approvals →
          </Link>
        }
      />
      <div className="p-6 md:p-8">
        <p className="mb-6 max-w-2xl text-sm text-[#6B6B64]">
          Meeting follow-ups, calendar events, tasks, and RAID items land here first.
          Nothing executes until you approve — calendar events open in Google Calendar
          for you to confirm.
        </p>
        <ProposalsQueuePanel proposals={proposals} />
      </div>
    </>
  );
}
