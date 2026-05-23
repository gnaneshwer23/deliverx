"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveApprovalAction } from "./actions";
import { dxClass } from "@/lib/dx-theme";

export function ApprovalActions({ approvalId }: { approvalId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function act(status: "approved" | "rejected") {
    startTransition(async () => {
      await resolveApprovalAction(approvalId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => act("approved")}
        className={`${dxClass.btnPrimary} text-[9px]`}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("rejected")}
        className={`${dxClass.btnGhost} text-[9px]`}
      >
        Reject
      </button>
    </div>
  );
}
